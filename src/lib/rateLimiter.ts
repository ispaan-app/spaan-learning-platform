interface RateLimit {
  requests: number
  window: number
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private static instance: RateLimiter
  private limits: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout

  private constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter()
    }
    return RateLimiter.instance
  }

  async checkLimit(
    identifier: string, 
    endpoint: string, 
    limit: RateLimit
  ): Promise<{ allowed: boolean; retryAfter?: number }> {
    const key = `${identifier}:${endpoint}`
    const now = Date.now()
    const entry = this.limits.get(key)

    if (!entry || now >= entry.resetTime) {
      // Create new entry or reset expired entry
      this.limits.set(key, {
        count: 1,
        resetTime: now + limit.window
      })
      return { allowed: true }
    }

    if (entry.count >= limit.requests) {
      // Rate limit exceeded
      return {
        allowed: false,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      }
    }

    // Increment count
    entry.count++
    this.limits.set(key, entry)
    return { allowed: true }
  }

  private cleanup(): void {
    const now = Date.now()
    this.limits.forEach((entry, key) => {
      if (now >= entry.resetTime) {
        this.limits.delete(key)
      }
    })
  }

  // Get current rate limit status
  getStatus(identifier: string, endpoint: string): { count: number; resetTime: number; limit: number } | null {
    const key = `${identifier}:${endpoint}`
    const entry = this.limits.get(key)
    
    if (!entry) {
      return null
    }

    return {
      count: entry.count,
      resetTime: entry.resetTime,
      limit: 0 // This would need to be passed from the calling context
    }
  }

  // Reset rate limit for specific identifier
  reset(identifier: string, endpoint?: string): void {
    if (endpoint) {
      const key = `${identifier}:${endpoint}`
      this.limits.delete(key)
    } else {
      // Reset all limits for this identifier
      this.limits.forEach((entry, key) => {
        if (key.startsWith(`${identifier}:`)) {
          this.limits.delete(key)
        }
      })
    }
  }

  // Get all active limits (for monitoring)
  getAllLimits(): Array<{ key: string; count: number; resetTime: number }> {
    return Array.from(this.limits.entries()).map(([key, entry]) => ({
      key,
      count: entry.count,
      resetTime: entry.resetTime
    }))
  }

  // Cleanup on shutdown
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.limits.clear()
  }
}

// Redis-based rate limiter (for production)
class RedisRateLimiter {
  private redis: any // Redis client would be injected here

  constructor(redisClient: any) {
    this.redis = redisClient
  }

  async checkLimit(
    identifier: string, 
    endpoint: string, 
    limit: RateLimit
  ): Promise<{ allowed: boolean; retryAfter?: number }> {
    const key = `rate_limit:${identifier}:${endpoint}`
    const now = Date.now()
    const windowStart = now - limit.window

    try {
      // Use Redis sorted set for sliding window
      const pipeline = this.redis.pipeline()
      
      // Remove expired entries
      pipeline.zremrangebyscore(key, 0, windowStart)
      
      // Count current requests
      pipeline.zcard(key)
      
      // Add current request
      pipeline.zadd(key, now, `${now}-${Math.random()}`)
      
      // Set expiration
      pipeline.expire(key, Math.ceil(limit.window / 1000))
      
      const results = await pipeline.exec()
      const currentCount = results[1][1] as number

      if (currentCount >= limit.requests) {
        // Get oldest request to calculate retry time
        const oldest = await this.redis.zrange(key, 0, 0, 'WITHSCORES')
        const retryAfter = oldest.length > 0 
          ? Math.ceil((parseInt(oldest[1]) + limit.window - now) / 1000)
          : Math.ceil(limit.window / 1000)

        return { allowed: false, retryAfter }
      }

      return { allowed: true }
    } catch (error) {
      console.error('Redis rate limiter error:', error)
      // Fallback to allowing the request
      return { allowed: true }
    }
  }

  async getStatus(identifier: string, endpoint: string): Promise<{ count: number; resetTime: number } | null> {
    const key = `rate_limit:${identifier}:${endpoint}`
    
    try {
      const now = Date.now()
      const count = await this.redis.zcard(key)
      const oldest = await this.redis.zrange(key, 0, 0, 'WITHSCORES')
      
      if (oldest.length === 0) {
        return null
      }

      const resetTime = parseInt(oldest[1]) + 15 * 60 * 1000 // 15 minutes window
      return { count, resetTime }
    } catch (error) {
      console.error('Redis status check error:', error)
      return null
    }
  }

  async reset(identifier: string, endpoint?: string): Promise<void> {
    if (endpoint) {
      const key = `rate_limit:${identifier}:${endpoint}`
      await this.redis.del(key)
    } else {
      const pattern = `rate_limit:${identifier}:*`
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    }
  }
}

// Factory function to create appropriate rate limiter
export function createRateLimiter(redisClient?: any) {
  if (redisClient && process.env.NODE_ENV === 'production') {
    return new RedisRateLimiter(redisClient)
  }
  return RateLimiter.getInstance()
}

// Export singleton instance
export const rateLimiter = RateLimiter.getInstance()

// Rate limiting middleware for API routes
export async function withRateLimit(
  handler: Function,
  limit: RateLimit,
  getIdentifier: (request: Request) => string
) {
  return async (request: Request, ...args: any[]) => {
    const identifier = getIdentifier(request)
    const url = new URL(request.url)
    const endpoint = url.pathname

    const result = await rateLimiter.checkLimit(identifier, endpoint, limit)
    
    if (!result.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          retryAfter: result.retryAfter 
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': result.retryAfter?.toString() || '60'
          }
        }
      )
    }

    return handler(request, ...args)
  }
}

// Utility functions
export function getClientIdentifier(request: Request): string {
  // Try to get user ID from session first
  const sessionId = request.headers.get('x-session-id')
  if (sessionId) {
    return `session:${sessionId}`
  }

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0]?.trim() || realIP || 'unknown'
  
  return `ip:${ip}`
}

export function getIPIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0]?.trim() || realIP || 'unknown'
}
