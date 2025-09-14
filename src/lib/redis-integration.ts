// Redis integration for iSpaan
import { createClient, RedisClientType } from 'redis'

class RedisManager {
  private client: RedisClientType | null = null
  private isConnected = false

  async connect() {
    if (this.isConnected && this.client) {
      return this.client
    }

    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        password: process.env.REDIS_PASSWORD,
        socket: {
          connectTimeout: 10000
        }
      })

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err)
        this.isConnected = false
      })

      this.client.on('connect', () => {
        console.log('Redis Client Connected')
        this.isConnected = true
      })

      this.client.on('disconnect', () => {
        console.log('Redis Client Disconnected')
        this.isConnected = false
      })

      await this.client.connect()
      return this.client
    } catch (error) {
      console.error('Failed to connect to Redis:', error)
      this.isConnected = false
      return null
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.disconnect()
      this.isConnected = false
    }
  }

  async get(key: string) {
    try {
      const client = await this.connect()
      if (!client) return null
      
      const value = await client.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Redis GET error:', error)
      return null
    }
  }

  async set(key: string, value: any, ttlSeconds?: number) {
    try {
      const client = await this.connect()
      if (!client) return false

      const serializedValue = JSON.stringify(value)
      
      if (ttlSeconds) {
        await client.setEx(key, ttlSeconds, serializedValue)
      } else {
        await client.set(key, serializedValue)
      }
      
      return true
    } catch (error) {
      console.error('Redis SET error:', error)
      return false
    }
  }

  async del(key: string) {
    try {
      const client = await this.connect()
      if (!client) return false

      await client.del(key)
      return true
    } catch (error) {
      console.error('Redis DEL error:', error)
      return false
    }
  }

  async exists(key: string) {
    try {
      const client = await this.connect()
      if (!client) return false

      const result = await client.exists(key)
      return result === 1
    } catch (error) {
      console.error('Redis EXISTS error:', error)
      return false
    }
  }

  async expire(key: string, ttlSeconds: number) {
    try {
      const client = await this.connect()
      if (!client) return false

      await client.expire(key, ttlSeconds)
      return true
    } catch (error) {
      console.error('Redis EXPIRE error:', error)
      return false
    }
  }

  async keys(pattern: string) {
    try {
      const client = await this.connect()
      if (!client) return []

      const keys = await client.keys(pattern)
      return keys
    } catch (error) {
      console.error('Redis KEYS error:', error)
      return []
    }
  }

  async flushAll() {
    try {
      const client = await this.connect()
      if (!client) return false

      await client.flushAll()
      return true
    } catch (error) {
      console.error('Redis FLUSHALL error:', error)
      return false
    }
  }

  // Cache management methods
  async cacheUser(userId: string, userData: any, ttlSeconds = 300) {
    const key = `user:${userId}`
    return await this.set(key, userData, ttlSeconds)
  }

  async getCachedUser(userId: string) {
    const key = `user:${userId}`
    return await this.get(key)
  }

  async cacheDashboardStats(stats: any, ttlSeconds = 60) {
    const key = 'dashboard:stats'
    return await this.set(key, stats, ttlSeconds)
  }

  async getCachedDashboardStats() {
    const key = 'dashboard:stats'
    return await this.get(key)
  }

  async cacheLearnerData(learnerId: string, learnerData: any, ttlSeconds = 300) {
    const key = `learner:${learnerId}`
    return await this.set(key, learnerData, ttlSeconds)
  }

  async getCachedLearnerData(learnerId: string) {
    const key = `learner:${learnerId}`
    return await this.get(key)
  }

  async cacheApplications(applications: any[], ttlSeconds = 60) {
    const key = 'applications:recent'
    return await this.set(key, applications, ttlSeconds)
  }

  async getCachedApplications() {
    const key = 'applications:recent'
    return await this.get(key)
  }

  async cacheLearners(learners: any[], ttlSeconds = 60) {
    const key = 'learners:all'
    return await this.set(key, learners, ttlSeconds)
  }

  async getCachedLearners() {
    const key = 'learners:all'
    return await this.get(key)
  }

  async cacheWorkHours(learnerId: string, workHours: any[], ttlSeconds = 300) {
    const key = `work-hours:${learnerId}`
    return await this.set(key, workHours, ttlSeconds)
  }

  async getCachedWorkHours(learnerId: string) {
    const key = `work-hours:${learnerId}`
    return await this.get(key)
  }

  async cacheLeaveRequests(learnerId: string, leaveRequests: any[], ttlSeconds = 300) {
    const key = `leave-requests:${learnerId}`
    return await this.set(key, leaveRequests, ttlSeconds)
  }

  async getCachedLeaveRequests(learnerId: string) {
    const key = `leave-requests:${learnerId}`
    return await this.get(key)
  }

  async cacheDocuments(userId: string, documents: any[], ttlSeconds = 300) {
    const key = `documents:${userId}`
    return await this.set(key, documents, ttlSeconds)
  }

  async getCachedDocuments(userId: string) {
    const key = `documents:${userId}`
    return await this.get(key)
  }

  async cacheAnnouncements(announcements: any[], ttlSeconds = 300) {
    const key = 'announcements:published'
    return await this.set(key, announcements, ttlSeconds)
  }

  async getCachedAnnouncements() {
    const key = 'announcements:published'
    return await this.get(key)
  }

  // Session management
  async setSession(sessionId: string, sessionData: any, ttlSeconds = 3600) {
    const key = `session:${sessionId}`
    return await this.set(key, sessionData, ttlSeconds)
  }

  async getSession(sessionId: string) {
    const key = `session:${sessionId}`
    return await this.get(key)
  }

  async deleteSession(sessionId: string) {
    const key = `session:${sessionId}`
    return await this.del(key)
  }

  // Rate limiting
  async checkRateLimit(identifier: string, limit: number, windowSeconds: number) {
    try {
      const client = await this.connect()
      if (!client) return { allowed: true, remaining: limit }

      const key = `rate-limit:${identifier}`
      const current = await client.get(key)
      
      if (current === null) {
        await client.setEx(key, windowSeconds, '1')
        return { allowed: true, remaining: limit - 1 }
      }

      const count = parseInt(current)
      if (count >= limit) {
        return { allowed: false, remaining: 0 }
      }

      await client.incr(key)
      return { allowed: true, remaining: limit - count - 1 }
    } catch (error) {
      console.error('Rate limit check error:', error)
      return { allowed: true, remaining: limit }
    }
  }

  // Cache invalidation
  async invalidateUserCache(userId: string) {
    const patterns = [
      `user:${userId}`,
      `learner:${userId}`,
      `work-hours:${userId}`,
      `leave-requests:${userId}`,
      `documents:${userId}`
    ]

    for (const pattern of patterns) {
      await this.del(pattern)
    }
  }

  async invalidateDashboardCache() {
    const patterns = [
      'dashboard:stats',
      'applications:recent',
      'learners:all',
      'announcements:published'
    ]

    for (const pattern of patterns) {
      await this.del(pattern)
    }
  }

  // Health check
  async healthCheck() {
    try {
      const client = await this.connect()
      if (!client) return { status: 'disconnected', error: 'Failed to connect' }

      const pong = await client.ping()
      return { status: pong === 'PONG' ? 'connected' : 'error', error: null }
    } catch (error) {
      return { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

// Singleton instance
export const redisManager = new RedisManager()

// Export types
export interface CacheOptions {
  ttlSeconds?: number
  forceRefresh?: boolean
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime?: number
}

export interface RedisHealthCheck {
  status: 'connected' | 'disconnected' | 'error'
  error: string | null
}
