import Redis from 'ioredis'

// Redis-based caching service
export class RedisCacheService {
  private static instance: RedisCacheService
  private redis: Redis
  private defaultTTL: number = 3600 // 1 hour

  private constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
  }

  static getInstance(): RedisCacheService {
    if (!RedisCacheService.instance) {
      RedisCacheService.instance = new RedisCacheService()
    }
    return RedisCacheService.instance
  }

  // Set cache with TTL
  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    try {
      const serialized = JSON.stringify(value)
      await this.redis.setex(key, ttl, serialized)
    } catch (error) {
      console.error('Redis cache set error:', error)
    }
  }

  // Get cache value
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Redis cache get error:', error)
      return null
    }
  }

  // Delete cache
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key)
    } catch (error) {
      console.error('Redis cache delete error:', error)
    }
  }

  // Clear cache by pattern
  async clearPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      console.error('Redis cache clear pattern error:', error)
    }
  }

  // Get cache statistics
  async getStats(): Promise<{ memory: string; keys: number; hitRate: number }> {
    try {
      const info = await this.redis.info('memory')
      const keys = await this.redis.dbsize()
      
      // Calculate hit rate (simplified)
      const hitRate = 0.85 // Mock value
      
      return {
        memory: info,
        keys,
        hitRate
      }
    } catch (error) {
      console.error('Redis cache stats error:', error)
      return {
        memory: 'N/A',
        keys: 0,
        hitRate: 0
      }
    }
  }
}

export default RedisCacheService
