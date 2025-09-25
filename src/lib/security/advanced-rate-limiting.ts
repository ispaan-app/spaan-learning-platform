import { NextRequest, NextResponse } from 'next/server'
import Redis from 'ioredis'

// Advanced rate limiting with Redis backend
export class AdvancedRateLimiter {
  private static instance: AdvancedRateLimiter
  private redis: Redis
  private defaultLimits: Record<string, { requests: number; window: number }> = {
    'api': { requests: 100, window: 3600 }, // 100 requests per hour
    'auth': { requests: 5, window: 900 }, // 5 requests per 15 minutes
    'upload': { requests: 10, window: 3600 }, // 10 uploads per hour
    'admin': { requests: 1000, window: 3600 }, // 1000 requests per hour
    'super-admin': { requests: 2000, window: 3600 } // 2000 requests per hour
  }

  private constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
  }

  static getInstance(): AdvancedRateLimiter {
    if (!AdvancedRateLimiter.instance) {
      AdvancedRateLimiter.instance = new AdvancedRateLimiter()
    }
    return AdvancedRateLimiter.instance
  }

  // Check rate limit for endpoint
  async checkLimit(
    identifier: string,
    endpoint: string,
    customLimit?: { requests: number; window: number }
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number; retryAfter?: number }> {
    const limit = customLimit || this.defaultLimits[endpoint] || this.defaultLimits['api']
    const key = `rate_limit:${endpoint}:${identifier}`
    const now = Date.now()
    const windowStart = now - (limit.window * 1000)

    try {
      // Get current count
      const count = await this.redis.zcount(key, windowStart, now)
      
      if (count >= limit.requests) {
        // Rate limit exceeded
        const oldestRequest = await this.redis.zrange(key, 0, 0, 'WITHSCORES')
        const resetTime = oldestRequest.length > 0 ? parseInt(oldestRequest[1]) + (limit.window * 1000) : now + (limit.window * 1000)
        const retryAfter = Math.ceil((resetTime - now) / 1000)
        
        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter
        }
      }

      // Add current request
      await this.redis.zadd(key, now, `${now}-${Math.random()}`)
      await this.redis.expire(key, limit.window)

      // Clean old entries
      await this.redis.zremrangebyscore(key, 0, windowStart)

      return {
        allowed: true,
        remaining: limit.requests - count - 1,
        resetTime: now + (limit.window * 1000)
      }
    } catch (error) {
      console.error('Rate limiting error:', error)
      // Allow request if Redis is down
      return {
        allowed: true,
        remaining: limit.requests,
        resetTime: now + (limit.window * 1000)
      }
    }
  }

  // Get rate limit status
  async getStatus(identifier: string, endpoint: string): Promise<{ count: number; limit: number; resetTime: number }> {
    const limit = this.defaultLimits[endpoint] || this.defaultLimits['api']
    const key = `rate_limit:${endpoint}:${identifier}`
    const now = Date.now()
    const windowStart = now - (limit.window * 1000)

    try {
      const count = await this.redis.zcount(key, windowStart, now)
      return {
        count,
        limit: limit.requests,
        resetTime: now + (limit.window * 1000)
      }
    } catch (error) {
      console.error('Rate limit status error:', error)
      return {
        count: 0,
        limit: limit.requests,
        resetTime: now + (limit.window * 1000)
      }
    }
  }

  // Reset rate limit for identifier
  async resetLimit(identifier: string, endpoint: string): Promise<void> {
    const key = `rate_limit:${endpoint}:${identifier}`
    try {
      await this.redis.del(key)
    } catch (error) {
      console.error('Rate limit reset error:', error)
    }
  }

  // Set custom limit for endpoint
  setCustomLimit(endpoint: string, limit: { requests: number; window: number }): void {
    this.defaultLimits[endpoint] = limit
  }

  // Get all rate limits
  getAllLimits(): Record<string, { requests: number; window: number }> {
    return { ...this.defaultLimits }
  }
}

// Rate limiting middleware
export function withAdvancedRateLimit(
  endpoint: string,
  customLimit?: { requests: number; window: number }
) {
  return function(handler: (request: NextRequest) => Promise<NextResponse>) {
    return async (request: NextRequest): Promise<NextResponse> => {
      const rateLimiter = AdvancedRateLimiter.getInstance()
      
      // Get client identifier
      const clientIP = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'
      
      // Check rate limit
      const limitCheck = await rateLimiter.checkLimit(clientIP, endpoint, customLimit)
      
      if (!limitCheck.allowed) {
        const response = NextResponse.json(
          { 
            error: 'Rate limit exceeded',
            retryAfter: limitCheck.retryAfter,
            resetTime: limitCheck.resetTime
          },
          { status: 429 }
        )
        
        response.headers.set('X-RateLimit-Limit', (customLimit?.requests || 100).toString())
        response.headers.set('X-RateLimit-Remaining', '0')
        response.headers.set('X-RateLimit-Reset', limitCheck.resetTime.toString())
        response.headers.set('Retry-After', limitCheck.retryAfter?.toString() || '60')
        
        return response
      }

      // Process request
      const response = await handler(request)
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', (customLimit?.requests || 100).toString())
      response.headers.set('X-RateLimit-Remaining', limitCheck.remaining.toString())
      response.headers.set('X-RateLimit-Reset', limitCheck.resetTime.toString())
      
      return response
    }
  }
}

export default AdvancedRateLimiter
