import Redis from 'redis'
import { createHash } from 'crypto'

interface CacheConfig {
  ttl: number // Time to live in seconds
  prefix: string
  serialize?: boolean
  compress?: boolean
}

interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  hitRate: number
}

class CacheManager {
  private static instance: CacheManager
  private redis: Redis.RedisClientType | null = null
  private memoryCache: Map<string, { data: any; expires: number }> = new Map()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    hitRate: 0
  }
  private readonly MEMORY_CACHE_SIZE = 1000
  private readonly DEFAULT_TTL = 300 // 5 minutes

  private constructor() {
    this.initializeRedis()
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  private async initializeRedis(): Promise<void> {
    try {
      if (process.env.REDIS_URL) {
        this.redis = Redis.createClient({
          url: process.env.REDIS_URL
        })
        
        this.redis.on('error', (err) => {
          console.error('Redis error:', err)
          this.redis = null
        })

        this.redis.on('connect', () => {
          console.log('Redis connected successfully')
        })

        await this.redis.connect()
      } else {
        console.log('Redis not configured, using memory cache only')
      }
    } catch (error) {
      console.error('Failed to initialize Redis:', error)
      this.redis = null
    }
  }

  // Set cache value
  async set(
    key: string, 
    value: any, 
    config: Partial<CacheConfig> = {}
  ): Promise<boolean> {
    const ttl = config.ttl || this.DEFAULT_TTL
    const prefix = config.prefix || 'default'
    const fullKey = `${prefix}:${key}`
    
    try {
      const serializedValue = config.serialize !== false 
        ? JSON.stringify(value) 
        : value

      // Try Redis first
      if (this.redis) {
        await this.redis.setEx(fullKey, ttl, serializedValue)
        this.stats.sets++
        return true
      }

      // Fallback to memory cache
      this.memoryCache.set(fullKey, {
        data: serializedValue,
        expires: Date.now() + (ttl * 1000)
      })

      // Clean up memory cache if it gets too large
      if (this.memoryCache.size > this.MEMORY_CACHE_SIZE) {
        this.cleanupMemoryCache()
      }

      this.stats.sets++
      return true
    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  }

  // Get cache value
  async get<T = any>(
    key: string, 
    config: Partial<CacheConfig> = {}
  ): Promise<T | null> {
    const prefix = config.prefix || 'default'
    const fullKey = `${prefix}:${key}`

    try {
      let value: string | null = null

      // Try Redis first
      if (this.redis) {
        value = await this.redis.get(fullKey)
        if (value) {
          this.stats.hits++
          this.updateHitRate()
          return config.serialize !== false ? JSON.parse(value) : value as T
        }
      }

      // Fallback to memory cache
      const cached = this.memoryCache.get(fullKey)
      if (cached && cached.expires > Date.now()) {
        this.stats.hits++
        this.updateHitRate()
        return config.serialize !== false ? JSON.parse(cached.data) : cached.data
      } else if (cached) {
        // Expired, remove it
        this.memoryCache.delete(fullKey)
      }

      this.stats.misses++
      this.updateHitRate()
      return null
    } catch (error) {
      console.error('Cache get error:', error)
      this.stats.misses++
      this.updateHitRate()
      return null
    }
  }

  // Delete cache value
  async delete(key: string, config: Partial<CacheConfig> = {}): Promise<boolean> {
    const prefix = config.prefix || 'default'
    const fullKey = `${prefix}:${key}`

    try {
      // Try Redis first
      if (this.redis) {
        await this.redis.del(fullKey)
      }

      // Also remove from memory cache
      this.memoryCache.delete(fullKey)
      
      this.stats.deletes++
      return true
    } catch (error) {
      console.error('Cache delete error:', error)
      return false
    }
  }

  // Clear cache by pattern
  async clear(pattern: string = '*', config: Partial<CacheConfig> = {}): Promise<number> {
    const prefix = config.prefix || 'default'
    const fullPattern = `${prefix}:${pattern}`

    try {
      let deletedCount = 0

      // Try Redis first
      if (this.redis) {
        const keys = await this.redis.keys(fullPattern)
        if (keys.length > 0) {
          deletedCount = await this.redis.del(keys)
        }
      }

      // Also clear memory cache
      this.memoryCache.forEach((value, key) => {
        if (key.startsWith(prefix) && (pattern === '*' || key.includes(pattern))) {
          this.memoryCache.delete(key)
          deletedCount++
        }
      })

      return deletedCount
    } catch (error) {
      console.error('Cache clear error:', error)
      return 0
    }
  }

  // Check if key exists
  async exists(key: string, config: Partial<CacheConfig> = {}): Promise<boolean> {
    const prefix = config.prefix || 'default'
    const fullKey = `${prefix}:${key}`

    try {
      // Try Redis first
      if (this.redis) {
        const exists = await this.redis.exists(fullKey)
        return exists === 1
      }

      // Check memory cache
      const cached = this.memoryCache.get(fullKey)
      return cached ? cached.expires > Date.now() : false
    } catch (error) {
      console.error('Cache exists error:', error)
      return false
    }
  }

  // Set with expiration
  async setEx(
    key: string, 
    value: any, 
    ttl: number, 
    config: Partial<CacheConfig> = {}
  ): Promise<boolean> {
    return this.set(key, value, { ...config, ttl })
  }

  // Get or set (cache-aside pattern)
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    config: Partial<CacheConfig> = {}
  ): Promise<T> {
    const cached = await this.get<T>(key, config)
    
    if (cached !== null) {
      return cached
    }

    const value = await fetchFn()
    await this.set(key, value, config)
    return value
  }

  // Batch operations
  async mget<T = any>(
    keys: string[], 
    config: Partial<CacheConfig> = {}
  ): Promise<(T | null)[]> {
    const prefix = config.prefix || 'default'
    const fullKeys = keys.map(key => `${prefix}:${key}`)

    try {
      if (this.redis) {
        const values = await this.redis.mGet(fullKeys)
        return values.map(value => 
          value && config.serialize !== false ? JSON.parse(value) : value
        )
      }

      // Fallback to memory cache
      return fullKeys.map(fullKey => {
        const cached = this.memoryCache.get(fullKey)
        if (cached && cached.expires > Date.now()) {
          return config.serialize !== false ? JSON.parse(cached.data) : cached.data
        }
        return null
      })
    } catch (error) {
      console.error('Cache mget error:', error)
      return keys.map(() => null)
    }
  }

  async mset(
    keyValuePairs: Array<{ key: string; value: any }>,
    config: Partial<CacheConfig> = {}
  ): Promise<boolean> {
    const prefix = config.prefix || 'default'
    const ttl = config.ttl || this.DEFAULT_TTL

    try {
      if (this.redis) {
        const pipeline = this.redis.multi()
        
        for (const { key, value } of keyValuePairs) {
          const fullKey = `${prefix}:${key}`
          const serializedValue = config.serialize !== false 
            ? JSON.stringify(value) 
            : value
          pipeline.setEx(fullKey, ttl, serializedValue)
        }

        await pipeline.exec()
        this.stats.sets += keyValuePairs.length
        return true
      }

      // Fallback to memory cache
      for (const { key, value } of keyValuePairs) {
        const fullKey = `${prefix}:${key}`
        const serializedValue = config.serialize !== false 
          ? JSON.stringify(value) 
          : value
        
        this.memoryCache.set(fullKey, {
          data: serializedValue,
          expires: Date.now() + (ttl * 1000)
        })
      }

      this.stats.sets += keyValuePairs.length
      return true
    } catch (error) {
      console.error('Cache mset error:', error)
      return false
    }
  }

  // Cache warming
  async warmCache<T>(
    keys: string[],
    fetchFn: (key: string) => Promise<T>,
    config: Partial<CacheConfig> = {}
  ): Promise<void> {
    const promises = keys.map(async (key) => {
      const value = await fetchFn(key)
      await this.set(key, value, config)
    })

    await Promise.all(promises)
  }

  // Cache invalidation patterns
  async invalidateByPattern(pattern: string, config: Partial<CacheConfig> = {}): Promise<number> {
    return this.clear(pattern, config)
  }

  async invalidateByTags(tags: string[], config: Partial<CacheConfig> = {}): Promise<number> {
    let totalDeleted = 0
    
    for (const tag of tags) {
      const deleted = await this.clear(`tag:${tag}:*`, config)
      totalDeleted += deleted
    }

    return totalDeleted
  }

  // Tag-based caching
  async setWithTags(
    key: string,
    value: any,
    tags: string[],
    config: Partial<CacheConfig> = {}
  ): Promise<boolean> {
    // Set the main value
    const success = await this.set(key, value, config)
    
    if (success) {
      // Set tag references
      for (const tag of tags) {
        await this.set(`tag:${tag}:${key}`, true, { ...config, ttl: config.ttl || this.DEFAULT_TTL })
      }
    }

    return success
  }

  // Health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    redis: boolean
    memoryCache: boolean
    stats: CacheStats
  }> {
    const redisHealthy = this.redis ? await this.testRedisConnection() : false
    const memoryCacheHealthy = this.memoryCache.size >= 0

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    
    if (!redisHealthy && !memoryCacheHealthy) {
      status = 'unhealthy'
    } else if (!redisHealthy || this.stats.hitRate < 0.5) {
      status = 'degraded'
    }

    return {
      status,
      redis: redisHealthy,
      memoryCache: memoryCacheHealthy,
      stats: { ...this.stats }
    }
  }

  private async testRedisConnection(): Promise<boolean> {
    if (!this.redis) return false

    try {
      await this.redis.ping()
      return true
    } catch {
      return false
    }
  }

  // Cleanup memory cache
  private cleanupMemoryCache(): void {
    const now = Date.now()
    const entries = Array.from(this.memoryCache.entries())
    
    // Remove expired entries
    for (const [key, value] of entries) {
      if (value.expires <= now) {
        this.memoryCache.delete(key)
      }
    }

    // If still too large, remove oldest entries
    if (this.memoryCache.size > this.MEMORY_CACHE_SIZE) {
      const sortedEntries = entries
        .filter(([_, value]) => value.expires > now)
        .sort((a, b) => a[1].expires - b[1].expires)
      
      const toRemove = sortedEntries.slice(0, this.memoryCache.size - this.MEMORY_CACHE_SIZE)
      for (const [key] of toRemove) {
        this.memoryCache.delete(key)
      }
    }
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0
  }

  // Generate cache key with hash
  generateKey(parts: string[]): string {
    const key = parts.join(':')
    return createHash('md5').update(key).digest('hex')
  }

  // Get cache statistics
  getStats(): CacheStats {
    return { ...this.stats }
  }

  // Reset statistics
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      hitRate: 0
    }
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance()

// Convenience functions
export async function cacheGet<T = any>(key: string, config?: Partial<CacheConfig>): Promise<T | null> {
  return cacheManager.get<T>(key, config)
}

export async function cacheSet(key: string, value: any, config?: Partial<CacheConfig>): Promise<boolean> {
  return cacheManager.set(key, value, config)
}

export async function cacheDelete(key: string, config?: Partial<CacheConfig>): Promise<boolean> {
  return cacheManager.delete(key, config)
}

export async function cacheGetOrSet<T>(
  key: string,
  fetchFn: () => Promise<T>,
  config?: Partial<CacheConfig>
): Promise<T> {
  return cacheManager.getOrSet(key, fetchFn, config)
}

export async function cacheWarm<T>(
  keys: string[],
  fetchFn: (key: string) => Promise<T>,
  config?: Partial<CacheConfig>
): Promise<void> {
  return cacheManager.warmCache(keys, fetchFn, config)
}

// Cache configuration presets
export const CACHE_CONFIGS = {
  USER_DATA: { ttl: 300, prefix: 'user', serialize: true },
  SESSION: { ttl: 900, prefix: 'session', serialize: true },
  API_RESPONSE: { ttl: 60, prefix: 'api', serialize: true },
  STATIC_CONTENT: { ttl: 3600, prefix: 'static', serialize: false },
  QUERY_RESULT: { ttl: 300, prefix: 'query', serialize: true },
  TEMP_DATA: { ttl: 30, prefix: 'temp', serialize: true }
} as const
