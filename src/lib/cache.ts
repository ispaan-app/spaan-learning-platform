import { NextRequest, NextResponse } from 'next/server'

interface CacheConfig {
  ttl: number // Time to live in seconds
  maxSize: number // Maximum number of items
  strategy: 'lru' | 'fifo' | 'ttl'
}

interface CacheItem<T = any> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
}

class MemoryCache {
  private static instance: MemoryCache
  private cache: Map<string, CacheItem> = new Map()
  private config: CacheConfig
  private cleanupInterval: NodeJS.Timeout

  constructor(config: CacheConfig) {
    this.config = config
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000) // Cleanup every minute
  }

  static getInstance(config?: CacheConfig): MemoryCache {
    if (!MemoryCache.instance) {
      MemoryCache.instance = new MemoryCache(config || {
        ttl: 300, // 5 minutes
        maxSize: 1000,
        strategy: 'lru'
      })
    }
    return MemoryCache.instance
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl,
      accessCount: 0,
      lastAccessed: Date.now()
    }

    // Check if we need to evict items
    if (this.cache.size >= this.config.maxSize) {
      this.evict()
    }

    this.cache.set(key, item)
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl * 1000) {
      this.cache.delete(key)
      return null
    }

    // Update access statistics
    item.accessCount++
    item.lastAccessed = Date.now()

    return item.data as T
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    
    if (!item) {
      return false
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl * 1000) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  private evict(): void {
    switch (this.config.strategy) {
      case 'lru':
        this.evictLRU()
        break
      case 'fifo':
        this.evictFIFO()
        break
      case 'ttl':
        this.evictTTL()
        break
    }
  }

  private evictLRU(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, item] of Array.from(this.cache.entries())) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  private evictFIFO(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, item] of Array.from(this.cache.entries())) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  private evictTTL(): void {
    const now = Date.now()
    for (const [key, item] of Array.from(this.cache.entries())) {
      if (now - item.timestamp > item.ttl * 1000) {
        this.cache.delete(key)
      }
    }
  }

  private cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, item] of Array.from(this.cache.entries())) {
      if (now - item.timestamp > item.ttl * 1000) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key))
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.cache.clear()
  }
}

// Redis cache implementation for production
class RedisCache {
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
      console.warn('Redis not available, falling back to memory cache')
      this.isConnected = false
    }
  }

  async set<T>(key: string, data: T, ttl: number = 300): Promise<void> {
    if (!this.isConnected) {
      MemoryCache.getInstance().set(key, data, ttl)
      return
    }

    try {
      const serialized = JSON.stringify(data)
      await this.redisClient.setex(key, ttl, serialized)
    } catch (error) {
      console.error('Redis cache set error:', error)
      MemoryCache.getInstance().set(key, data, ttl)
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) {
      return MemoryCache.getInstance().get<T>(key)
    }

    try {
      const data = await this.redisClient.get(key)
      if (!data) {
        return null
      }
      return JSON.parse(data) as T
    } catch (error) {
      console.error('Redis cache get error:', error)
      return MemoryCache.getInstance().get<T>(key)
    }
  }

  async has(key: string): Promise<boolean> {
    if (!this.isConnected) {
      return MemoryCache.getInstance().has(key)
    }

    try {
      const exists = await this.redisClient.exists(key)
      return exists === 1
    } catch (error) {
      console.error('Redis cache has error:', error)
      return MemoryCache.getInstance().has(key)
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.isConnected) {
      return MemoryCache.getInstance().delete(key)
    }

    try {
      const result = await this.redisClient.del(key)
      return result === 1
    } catch (error) {
      console.error('Redis cache delete error:', error)
      return MemoryCache.getInstance().delete(key)
    }
  }

  async clear(): Promise<void> {
    if (!this.isConnected) {
      MemoryCache.getInstance().clear()
      return
    }

    try {
      await this.redisClient.flushdb()
    } catch (error) {
      console.error('Redis cache clear error:', error)
      MemoryCache.getInstance().clear()
    }
  }
}

// Cache factory
export function createCache(): MemoryCache | RedisCache {
  try {
    const { createClient } = require('redis')
    const redisClient = createClient({ url: process.env.REDIS_URL })
    return new RedisCache(redisClient)
  } catch {
    return MemoryCache.getInstance()
  }
}

// Cache decorator for API routes
export function withCache<T extends any[]>(
  keyGenerator: (request: NextRequest, ...args: T) => string,
  ttl: number = 300
) {
  return function (
    handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
  ) {
    return async function (request: NextRequest, ...args: T): Promise<NextResponse> {
      const cache = createCache()
      const key = keyGenerator(request, ...args)

      // Try to get from cache first
      const cachedResponse = await cache.get<{
        status: number
        headers: Record<string, string>
        body: string
      }>(key)

      if (cachedResponse) {
        return new NextResponse(cachedResponse.body, {
          status: cachedResponse.status,
          headers: cachedResponse.headers
        })
      }

      // Execute handler
      const response = await handler(request, ...args)
      
      // Clone response to read body
      const responseClone = response.clone()
      const body = await responseClone.text()
      
      // Cache the response
      await cache.set(key, {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body
      }, ttl)

      return response
    }
  }
}

// Cache key generators
export const cacheKeys = {
  user: (userId: string) => `user:${userId}`,
  userRole: (userId: string) => `user:role:${userId}`,
  learnerStats: (userId: string) => `learner:stats:${userId}`,
  adminStats: () => 'admin:stats',
  applications: (filters: string) => `applications:${filters}`,
  placements: (filters: string) => `placements:${filters}`,
  notifications: (userId: string) => `notifications:${userId}`,
  documents: (userId: string) => `documents:${userId}`,
  leaveRequests: (userId: string) => `leave:${userId}`,
  issueReports: (filters: string) => `issues:${filters}`
}

// Cache invalidation helpers
export class CacheInvalidator {
  private static cache = createCache()

  static async invalidateUser(userId: string): Promise<void> {
    const keys = [
      cacheKeys.user(userId),
      cacheKeys.userRole(userId),
      cacheKeys.learnerStats(userId),
      cacheKeys.notifications(userId),
      cacheKeys.documents(userId),
      cacheKeys.leaveRequests(userId)
    ]

    for (const key of keys) {
      await this.cache.delete(key)
    }
  }

  static async invalidateAdminStats(): Promise<void> {
    await this.cache.delete(cacheKeys.adminStats())
  }

  static async invalidateApplications(): Promise<void> {
    // In a real implementation, you would track all application cache keys
    // For now, we'll use a pattern-based approach
    const pattern = 'applications:*'
    // Redis supports pattern deletion, but we'll implement a simple version
    // In production, you'd use Redis SCAN with MATCH
  }

  static async invalidateAll(): Promise<void> {
    await this.cache.clear()
  }
}

export { MemoryCache, RedisCache }