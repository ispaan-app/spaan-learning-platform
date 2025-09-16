import { NextRequest, NextResponse } from 'next/server'
import { ValidationService, rateLimitSchema } from './validation'

interface RateLimit {
  windowMs: number
  maxRequests: number
  message?: string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

interface RateLimitResult {
  allowed: boolean
  retryAfter?: number
  remaining?: number
  resetTime?: number
}

class RateLimiter {
  private static instance: RateLimiter
  private requests: Map<string, { count: number; resetTime: number }> = new Map()
  private cleanupInterval: NodeJS.Timeout

  private constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000)
  }

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter()
    }
    return RateLimiter.instance
  }

  private getKey(identifier: string, endpoint: string): string {
    return `${identifier}:${endpoint}`
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, data] of this.requests.entries()) {
      if (now > data.resetTime) {
        this.requests.delete(key)
      }
    }
  }

  async checkLimit(
    identifier: string, 
    endpoint: string, 
    limit: RateLimit
  ): Promise<RateLimitResult> {
    // Validate input
    const validation = ValidationService.validateAndSanitize(rateLimitSchema, {
      identifier,
      endpoint,
      limit: limit.maxRequests,
      windowMs: limit.windowMs
    })

    if (!validation.success) {
      return {
        allowed: false,
        retryAfter: limit.windowMs / 1000
      }
    }

    const key = this.getKey(identifier, endpoint)
    const now = Date.now()
    const windowStart = now - limit.windowMs

    // Get current request data
    const currentData = this.requests.get(key)
    
    if (!currentData || now > currentData.resetTime) {
      // First request in window or window expired
      this.requests.set(key, {
        count: 1,
        resetTime: now + limit.windowMs
      })
      
      return {
        allowed: true,
        remaining: limit.maxRequests - 1,
        resetTime: now + limit.windowMs
      }
    }

    if (currentData.count >= limit.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        retryAfter: Math.ceil((currentData.resetTime - now) / 1000),
        remaining: 0,
        resetTime: currentData.resetTime
      }
    }

    // Increment count
    currentData.count++
    this.requests.set(key, currentData)

    return {
      allowed: true,
      remaining: limit.maxRequests - currentData.count,
      resetTime: currentData.resetTime
    }
  }

  async getStatus(identifier: string, endpoint: string): Promise<{ count: number; resetTime: number } | null> {
    const key = this.getKey(identifier, endpoint)
    const data = this.requests.get(key)
    
    if (!data || Date.now() > data.resetTime) {
      return null
    }

    return {
      count: data.count,
      resetTime: data.resetTime
    }
  }

  async resetLimit(identifier: string, endpoint: string): Promise<void> {
    const key = this.getKey(identifier, endpoint)
    this.requests.delete(key)
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.requests.clear()
  }
}

// Redis-based rate limiter for production
class RedisRateLimiter {
  private redisClient: any
  private isConnected: boolean = false

  constructor(redisClient: any) {
    this.redisClient = redisClient
    this.checkConnection()
  }

  private async checkConnection(): Promise<void> {
    try {
      await this.redisClient.ping()
      this.isConnected = true
    } catch (error) {
      console.warn('Redis not available, falling back to memory rate limiter')
      this.isConnected = false
    }
  }

  async checkLimit(
    identifier: string, 
    endpoint: string, 
    limit: RateLimit
  ): Promise<RateLimitResult> {
    if (!this.isConnected) {
      // Fallback to memory-based rate limiter
      return RateLimiter.getInstance().checkLimit(identifier, endpoint, limit)
    }

    try {
      const key = `rate_limit:${identifier}:${endpoint}`
      const now = Date.now()
      const windowStart = now - limit.windowMs

      // Use Redis pipeline for atomic operations
      const pipeline = this.redisClient.pipeline()
      
      // Remove expired entries
      pipeline.zremrangebyscore(key, 0, windowStart)
      
      // Count current requests
      pipeline.zcard(key)
      
      // Add current request
      pipeline.zadd(key, now, `${now}-${Math.random()}`)
      
      // Set expiration
      pipeline.expire(key, Math.ceil(limit.windowMs / 1000))
      
      const results = await pipeline.exec()
      const currentCount = results[1][1] as number

      if (currentCount >= limit.maxRequests) {
        // Get oldest request to calculate retry after
        const oldestRequest = await this.redisClient.zrange(key, 0, 0, 'WITHSCORES')
        const retryAfter = oldestRequest.length > 0 
          ? Math.ceil((parseInt(oldestRequest[1]) + limit.windowMs - now) / 1000)
          : Math.ceil(limit.windowMs / 1000)

        return {
          allowed: false,
          retryAfter,
          remaining: 0,
          resetTime: now + limit.windowMs
        }
      }

      return {
        allowed: true,
        remaining: limit.maxRequests - currentCount - 1,
        resetTime: now + limit.windowMs
      }
    } catch (error) {
      console.error('Redis rate limiter error:', error)
      // Fallback to memory-based rate limiter
      return RateLimiter.getInstance().checkLimit(identifier, endpoint, limit)
    }
  }
}

// Rate limit configurations
export const RATE_LIMITS = {
  // General API endpoints
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many requests, please try again later'
  },
  
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts, please try again later'
  },
  
  // File upload endpoints
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: 'Too many file uploads, please try again later'
  },
  
  // Password reset
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: 'Too many password reset attempts, please try again later'
  },
  
  // PIN login attempts
  pinLogin: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 3,
    message: 'Too many PIN login attempts, please try again later'
  },
  
  // Admin operations
  admin: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 50,
    message: 'Too many admin operations, please try again later'
  }
} as const

// Rate limiting middleware
export function withRateLimit(
  limitType: keyof typeof RATE_LIMITS,
  getIdentifier: (request: NextRequest) => string
) {
  return function <T extends any[]>(
    handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
  ) {
    return async function (request: NextRequest, ...args: T): Promise<NextResponse> {
    const identifier = getIdentifier(request)
      const limit = RATE_LIMITS[limitType]
      
      // Try Redis first, fallback to memory
      let rateLimiter: RateLimiter | RedisRateLimiter
      
      try {
        const { createClient } = require('redis')
        const redisClient = createClient({ url: process.env.REDIS_URL })
        rateLimiter = new RedisRateLimiter(redisClient)
      } catch {
        rateLimiter = RateLimiter.getInstance()
      }

      const result = await rateLimiter.checkLimit(
        identifier,
        request.nextUrl.pathname,
        limit
      )
    
    if (!result.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: limit.message,
          retryAfter: result.retryAfter 
          },
        { 
          status: 429,
          headers: {
              'Retry-After': result.retryAfter?.toString() || '900',
              'X-RateLimit-Limit': limit.maxRequests.toString(),
              'X-RateLimit-Remaining': result.remaining?.toString() || '0',
              'X-RateLimit-Reset': result.resetTime?.toString() || Date.now().toString()
            }
          }
        )
      }

      // Add rate limit headers to successful responses
      const response = await handler(request, ...args)
      
      response.headers.set('X-RateLimit-Limit', limit.maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', result.remaining?.toString() || '0')
      response.headers.set('X-RateLimit-Reset', result.resetTime?.toString() || Date.now().toString())
      
      return response
    }
  }
}

// Helper function to get client identifier
export function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown'
  
  // For authenticated users, use user ID instead of IP
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    try {
      const token = authHeader.replace('Bearer ', '')
      // In a real implementation, you would decode the JWT to get the user ID
      // For now, we'll use a hash of the token
      return `user:${Buffer.from(token).toString('base64').slice(0, 16)}`
    } catch {
      // If token is invalid, fall back to IP
    }
  }
  
  return `ip:${ip}`
}

export { RateLimiter, RedisRateLimiter }