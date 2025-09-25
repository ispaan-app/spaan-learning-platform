'use server'

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private static instance: RateLimiter
  private limits: Map<string, RateLimitEntry> = new Map()

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter()
    }
    return RateLimiter.instance
  }

  async isRateLimited(
    identifier: string,
    endpoint: string,
    maxRequests: number,
    windowMs: number
  ): Promise<boolean> {
    const key = `${identifier}:${endpoint}`
    const now = Date.now()
    const entry = this.limits.get(key)

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      return false
    }

    if (entry.count >= maxRequests) {
      return true
    }

    // Increment count
    entry.count++
    this.limits.set(key, entry)
    return false
  }

  // Clean expired entries
  cleanExpired(): void {
    const now = Date.now()
    const entries = Array.from(this.limits.entries())
    for (const [key, entry] of entries) {
      if (now > entry.resetTime) {
        this.limits.delete(key)
      }
    }
  }

  // Get current limit status
  getLimitStatus(identifier: string, endpoint: string): {
    remaining: number
    resetTime: number
    isLimited: boolean
  } {
    const key = `${identifier}:${endpoint}`
    const entry = this.limits.get(key)
    const now = Date.now()

    if (!entry || now > entry.resetTime) {
      return {
        remaining: 100, // Default max
        resetTime: now + 3600000, // 1 hour
        isLimited: false
      }
    }

    return {
      remaining: Math.max(0, 100 - entry.count), // Assuming max 100
      resetTime: entry.resetTime,
      isLimited: entry.count >= 100
    }
  }
}

export const rateLimiter = RateLimiter.getInstance()
