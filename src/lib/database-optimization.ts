import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

interface QueryOptimization {
  collection: string
  field: string
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not-in' | 'array-contains' | 'array-contains-any'
  value: any
  limit?: number
  orderBy?: {
    field: string
    direction: 'asc' | 'desc'
  }
}

interface IndexConfig {
  collection: string
  fields: string[]
  composite?: boolean
  unique?: boolean
}

class DatabaseOptimizer {
  private static instance: DatabaseOptimizer
  private queryCache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  private constructor() {
    this.initializeIndexes()
  }

  static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer()
    }
    return DatabaseOptimizer.instance
  }

  // Initialize database indexes
  private async initializeIndexes(): Promise<void> {
    const indexes: IndexConfig[] = [
      // Users collection indexes
      { collection: 'users', fields: ['role'], composite: false },
      { collection: 'users', fields: ['status'], composite: false },
      { collection: 'users', fields: ['role', 'status'], composite: true },
      { collection: 'users', fields: ['email'], composite: false, unique: true },
      { collection: 'users', fields: ['idNumber'], composite: false, unique: true },
      { collection: 'users', fields: ['createdAt'], composite: false },
      { collection: 'users', fields: ['program'], composite: false },
      { collection: 'users', fields: ['placementId'], composite: false },

      // Work hours collection indexes
      { collection: 'work-hours', fields: ['learnerId'], composite: false },
      { collection: 'work-hours', fields: ['date'], composite: false },
      { collection: 'work-hours', fields: ['learnerId', 'date'], composite: true },
      { collection: 'work-hours', fields: ['month'], composite: false },
      { collection: 'work-hours', fields: ['verified'], composite: false },
      { collection: 'work-hours', fields: ['createdAt'], composite: false },

      // Placements collection indexes
      { collection: 'placements', fields: ['status'], composite: false },
      { collection: 'placements', fields: ['companyName'], composite: false },
      { collection: 'placements', fields: ['createdAt'], composite: false },
      { collection: 'placements', fields: ['capacity'], composite: false },

      // Documents collection indexes
      { collection: 'documents', fields: ['userId'], composite: false },
      { collection: 'documents', fields: ['status'], composite: false },
      { collection: 'documents', fields: ['type'], composite: false },
      { collection: 'documents', fields: ['userId', 'status'], composite: true },
      { collection: 'documents', fields: ['uploadedAt'], composite: false },

      // Audit logs collection indexes
      { collection: 'audit-logs', fields: ['userId'], composite: false },
      { collection: 'audit-logs', fields: ['action'], composite: false },
      { collection: 'audit-logs', fields: ['category'], composite: false },
      { collection: 'audit-logs', fields: ['severity'], composite: false },
      { collection: 'audit-logs', fields: ['timestamp'], composite: false },
      { collection: 'audit-logs', fields: ['userId', 'timestamp'], composite: true },
      { collection: 'audit-logs', fields: ['category', 'severity'], composite: true },

      // Leave requests collection indexes
      { collection: 'leave-requests', fields: ['learnerId'], composite: false },
      { collection: 'leave-requests', fields: ['status'], composite: false },
      { collection: 'leave-requests', fields: ['type'], composite: false },
      { collection: 'leave-requests', fields: ['learnerId', 'status'], composite: true },
      { collection: 'leave-requests', fields: ['requestedAt'], composite: false },

      // Announcements collection indexes
      { collection: 'announcements', fields: ['published'], composite: false },
      { collection: 'announcements', fields: ['targetAudience'], composite: false },
      { collection: 'announcements', fields: ['priority'], composite: false },
      { collection: 'announcements', fields: ['createdAt'], composite: false },
      { collection: 'announcements', fields: ['published', 'targetAudience'], composite: true }
    ]

    // In a real implementation, you would create these indexes in Firebase Console
    // or use the Firebase Admin SDK to create them programmatically
    console.log('Database indexes configured:', indexes.length)
  }

  // Optimized query with caching
  async optimizedQuery(config: QueryOptimization): Promise<any[]> {
    const cacheKey = this.generateCacheKey(config)
    
    // Check cache first
    const cached = this.queryCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data
    }

    try {
      let query: any = adminDb.collection(config.collection)

      // Apply filters
      if (config.field && config.operator && config.value !== undefined) {
        query = query.where(config.field, config.operator, config.value)
      }

      // Apply ordering
      if (config.orderBy) {
        query = query.orderBy(config.orderBy.field, config.orderBy.direction)
      }

      // Apply limit
      if (config.limit) {
        query = query.limit(config.limit)
      }

      const snapshot = await query.get()
      const data = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      }))

      // Cache the result
      this.queryCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl: this.CACHE_TTL
      })

      return data
    } catch (error) {
      console.error('Query optimization error:', error)
      throw error
    }
  }

  // Batch operations for better performance
  async batchWrite(operations: Array<{
    type: 'create' | 'update' | 'delete'
    collection: string
    docId?: string
    data?: any
  }>): Promise<void> {
    const batch = adminDb.batch()
    const maxBatchSize = 500 // Firestore limit

    for (let i = 0; i < operations.length; i += maxBatchSize) {
      const batchOperations = operations.slice(i, i + maxBatchSize)
      
      for (const operation of batchOperations) {
        const docRef = operation.docId 
          ? adminDb.collection(operation.collection).doc(operation.docId)
          : adminDb.collection(operation.collection).doc()

        switch (operation.type) {
          case 'create':
            batch.set(docRef, {
              ...operation.data,
              createdAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp()
            })
            break
          case 'update':
            batch.update(docRef, {
              ...operation.data,
              updatedAt: FieldValue.serverTimestamp()
            })
            break
          case 'delete':
            batch.delete(docRef)
            break
        }
      }

      await batch.commit()
    }
  }

  // Paginated queries
  async paginatedQuery(
    collection: string,
    filters: Array<{ field: string; operator: any; value: any }> = [],
    orderBy: { field: string; direction: 'asc' | 'desc' } = { field: 'createdAt', direction: 'desc' },
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: any[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }> {
    try {
      let query: any = adminDb.collection(collection)

      // Apply filters
      for (const filter of filters) {
        query = query.where(filter.field, filter.operator, filter.value)
      }

      // Apply ordering
      query = query.orderBy(orderBy.field, orderBy.direction)

      // Get total count (this is expensive, consider caching)
      const totalSnapshot = await query.get()
      const total = totalSnapshot.size

      // Calculate pagination
      const totalPages = Math.ceil(total / limit)
      const offset = (page - 1) * limit

      // Apply pagination
      if (offset > 0) {
        const offsetSnapshot = await query.limit(offset).get()
        const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1]
        query = query.startAfter(lastDoc)
      }

      const snapshot = await query.limit(limit).get()
      const data = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      }))

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    } catch (error) {
      console.error('Paginated query error:', error)
      throw error
    }
  }

  // Aggregation queries
  async aggregateQuery(
    collection: string,
    groupBy: string,
    filters: Array<{ field: string; operator: any; value: any }> = []
  ): Promise<Record<string, number>> {
    try {
      let query: any = adminDb.collection(collection)

      // Apply filters
      for (const filter of filters) {
        query = query.where(filter.field, filter.operator, filter.value)
      }

      const snapshot = await query.get()
      const groups: Record<string, number> = {}

      snapshot.docs.forEach((doc: any) => {
        const data = doc.data()
        const value = data[groupBy]
        if (value !== undefined) {
          groups[value] = (groups[value] || 0) + 1
        }
      })

      return groups
    } catch (error) {
      console.error('Aggregation query error:', error)
      throw error
    }
  }

  // Connection pooling simulation
  private connectionPool: Map<string, any> = new Map()
  private readonly MAX_CONNECTIONS = 10

  async getConnection(key: string): Promise<any> {
    if (this.connectionPool.has(key)) {
      return this.connectionPool.get(key)
    }

    if (this.connectionPool.size >= this.MAX_CONNECTIONS) {
      // Remove oldest connection
      const oldestKey = this.connectionPool.keys().next().value
      if (oldestKey) {
        this.connectionPool.delete(oldestKey)
      }
    }

    // Create new connection (in real implementation, this would be a database connection)
    const connection = { id: key, createdAt: Date.now() }
    this.connectionPool.set(key, connection)
    return connection
  }

  // Query performance monitoring
  private queryMetrics: Map<string, {
    count: number
    totalTime: number
    avgTime: number
    minTime: number
    maxTime: number
  }> = new Map()

  async monitorQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now()
    
    try {
      const result = await queryFn()
      const duration = Date.now() - startTime
      
      this.updateQueryMetrics(queryName, duration)
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      this.updateQueryMetrics(queryName, duration)
      throw error
    }
  }

  private updateQueryMetrics(queryName: string, duration: number): void {
    const existing = this.queryMetrics.get(queryName) || {
      count: 0,
      totalTime: 0,
      avgTime: 0,
      minTime: Infinity,
      maxTime: 0
    }

    const updated = {
      count: existing.count + 1,
      totalTime: existing.totalTime + duration,
      avgTime: (existing.totalTime + duration) / (existing.count + 1),
      minTime: Math.min(existing.minTime, duration),
      maxTime: Math.max(existing.maxTime, duration)
    }

    this.queryMetrics.set(queryName, updated)
  }

  // Get query performance metrics
  getQueryMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {}
    
    this.queryMetrics.forEach((data, queryName) => {
      metrics[queryName] = {
        ...data,
        minTime: data.minTime === Infinity ? 0 : data.minTime
      }
    })

    return metrics
  }

  // Clear cache
  clearCache(pattern?: string): void {
    if (pattern) {
      this.queryCache.forEach((value, key) => {
        if (key.includes(pattern)) {
          this.queryCache.delete(key)
        }
      })
    } else {
      this.queryCache.clear()
    }
  }

  // Generate cache key
  private generateCacheKey(config: QueryOptimization): string {
    return `${config.collection}_${config.field}_${config.operator}_${JSON.stringify(config.value)}_${config.limit || 'all'}_${config.orderBy ? `${config.orderBy.field}_${config.orderBy.direction}` : 'none'}`
  }

  // Database health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    metrics: {
      connectionPoolSize: number
      cacheSize: number
      queryCount: number
      avgQueryTime: number
    }
  }> {
    try {
      // Test basic query
      const startTime = Date.now()
      await adminDb.collection('users').limit(1).get()
      const queryTime = Date.now() - startTime

      const totalQueries = Array.from(this.queryMetrics.values())
        .reduce((sum, metric) => sum + metric.count, 0)
      
      const avgQueryTime = totalQueries > 0 
        ? Array.from(this.queryMetrics.values())
            .reduce((sum, metric) => sum + metric.totalTime, 0) / totalQueries
        : 0

      const status = queryTime < 1000 ? 'healthy' : queryTime < 3000 ? 'degraded' : 'unhealthy'

      return {
        status,
        metrics: {
          connectionPoolSize: this.connectionPool.size,
          cacheSize: this.queryCache.size,
          queryCount: totalQueries,
          avgQueryTime
        }
      }
    } catch (error) {
      console.error('Database health check failed:', error)
      return {
        status: 'unhealthy',
        metrics: {
          connectionPoolSize: 0,
          cacheSize: 0,
          queryCount: 0,
          avgQueryTime: 0
        }
      }
    }
  }
}

// Export singleton instance
export const databaseOptimizer = DatabaseOptimizer.getInstance()

// Utility functions
export async function optimizedQuery(config: QueryOptimization): Promise<any[]> {
  return databaseOptimizer.optimizedQuery(config)
}

export async function paginatedQuery(
  collection: string,
  filters?: Array<{ field: string; operator: any; value: any }>,
  orderBy?: { field: string; direction: 'asc' | 'desc' },
  page?: number,
  limit?: number
) {
  return databaseOptimizer.paginatedQuery(collection, filters, orderBy, page, limit)
}

export async function aggregateQuery(
  collection: string,
  groupBy: string,
  filters?: Array<{ field: string; operator: any; value: any }>
) {
  return databaseOptimizer.aggregateQuery(collection, groupBy, filters)
}

export async function monitorQuery<T>(queryName: string, queryFn: () => Promise<T>): Promise<T> {
  return databaseOptimizer.monitorQuery(queryName, queryFn)
}
