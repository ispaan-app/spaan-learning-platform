'use server'

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class CacheService {
  private static instance: CacheService
  private cache: Map<string, CacheItem<any>> = new Map()
  private maxSize: number = 1000
  private defaultTTL: number = 5 * 60 * 1000 // 5 minutes

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService()
    }
    return CacheService.instance
  }

  // Set cache item
  set<T>(key: string, data: T, ttl?: number): void {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    })
  }

  // Get cache item
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  // Check if key exists and is valid
  has(key: string): boolean {
    const item = this.cache.get(key)
    
    if (!item) {
      return false
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  // Delete cache item
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
  }

  // Get cache statistics
  getStats(): {
    size: number
    maxSize: number
    hitRate: number
    keys: string[]
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // TODO: Implement hit rate tracking
      keys: Array.from(this.cache.keys())
    }
  }

  // Clean expired items
  cleanExpired(): void {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())
    for (const [key, item] of entries) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }

  // Set cache size limit
  setMaxSize(size: number): void {
    this.maxSize = size
  }

  // Set default TTL
  setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl
  }
}

export const cacheService = CacheService.getInstance()

// Cache decorator for functions
export function cached<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string,
  ttl?: number
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : `fn:${fn.name}:${JSON.stringify(args)}`
    
    // Try to get from cache
    const cached = cacheService.get(key)
    if (cached !== null) {
      return cached
    }

    // Execute function and cache result
    const result = fn(...args)
    cacheService.set(key, result, ttl)
    return result
  }) as T
}

// Cache middleware for API routes
export function withCache<T>(
  handler: (request: Request) => Promise<T>,
  options: {
    ttl?: number
    keyGenerator?: (request: Request) => string
  } = {}
) {
  return async (request: Request): Promise<T> => {
    const key = options.keyGenerator 
      ? options.keyGenerator(request)
      : `api:${request.url}:${request.method}`
    
    // Try to get from cache
    const cached = cacheService.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Execute handler and cache result
    const result = await handler(request)
    cacheService.set(key, result, options.ttl)
    return result
  }
}

// Cache for database queries
export class DatabaseCache {
  private static instance: DatabaseCache
  private cache: CacheService

  constructor() {
    this.cache = CacheService.getInstance()
  }

  static getInstance(): DatabaseCache {
    if (!DatabaseCache.instance) {
      DatabaseCache.instance = new DatabaseCache()
    }
    return DatabaseCache.instance
  }

  // Cache user data
  async getUser(userId: string, fetcher: () => Promise<any>): Promise<any> {
    const key = `user:${userId}`
    
    if (this.cache.has(key)) {
      return this.cache.get(key)
    }

    const user = await fetcher()
    this.cache.set(key, user, 10 * 60 * 1000) // 10 minutes
    return user
  }

  // Cache program data
  async getProgram(programId: string, fetcher: () => Promise<any>): Promise<any> {
    const key = `program:${programId}`
    
    if (this.cache.has(key)) {
      return this.cache.get(key)
    }

    const program = await fetcher()
    this.cache.set(key, program, 30 * 60 * 1000) // 30 minutes
    return program
  }

  // Cache placement data
  async getPlacement(placementId: string, fetcher: () => Promise<any>): Promise<any> {
    const key = `placement:${placementId}`
    
    if (this.cache.has(key)) {
      return this.cache.get(key)
    }

    const placement = await fetcher()
    this.cache.set(key, placement, 15 * 60 * 1000) // 15 minutes
    return placement
  }

  // Invalidate cache for user
  invalidateUser(userId: string): void {
    this.cache.delete(`user:${userId}`)
  }

  // Invalidate cache for program
  invalidateProgram(programId: string): void {
    this.cache.delete(`program:${programId}`)
  }

  // Invalidate cache for placement
  invalidatePlacement(placementId: string): void {
    this.cache.delete(`placement:${placementId}`)
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
  }
}

export const databaseCache = DatabaseCache.getInstance()
