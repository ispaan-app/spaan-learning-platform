import { dbPool } from './database-connection-pool'
import { collection, query, where, orderBy, limit, startAfter, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, writeBatch, runTransaction } from 'firebase/firestore'
import { QuerySnapshot, DocumentSnapshot, DocumentData } from 'firebase/firestore'

interface QueryOptimization {
  collection: string
  filters?: Array<{ field: string; operator: any; value: any }>
  orderBy?: { field: string; direction: 'asc' | 'desc' }
  limit?: number
  startAfter?: any
  cacheKey?: string
}

interface BatchOperation {
  type: 'create' | 'update' | 'delete'
  collection: string
  docId?: string
  data?: any
}

class AdvancedDatabaseOptimizer {
  private static instance: AdvancedDatabaseOptimizer
  private queryCache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()
  private batchQueue: BatchOperation[] = []
  private batchTimer: NodeJS.Timeout | null = null
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  private readonly BATCH_SIZE = 500
  private readonly BATCH_TIMEOUT = 1000 // 1 second

  private constructor() {}

  static getInstance(): AdvancedDatabaseOptimizer {
    if (!AdvancedDatabaseOptimizer.instance) {
      AdvancedDatabaseOptimizer.instance = new AdvancedDatabaseOptimizer()
    }
    return AdvancedDatabaseOptimizer.instance
  }

  // Optimized query with connection pooling
  async optimizedQuery(config: QueryOptimization): Promise<any[]> {
    const cacheKey = this.generateCacheKey(config)
    
    // Check cache first
    const cached = this.queryCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data
    }

    const connection = await dbPool.getConnection()
    
    try {
      let firestoreQuery: any = collection(connection.firestore, config.collection)

      // Apply filters
      if (config.filters) {
        for (const filter of config.filters) {
          firestoreQuery = query(firestoreQuery, where(filter.field, filter.operator, filter.value))
        }
      }

      // Apply ordering
      if (config.orderBy) {
        firestoreQuery = query(firestoreQuery, orderBy(config.orderBy.field, config.orderBy.direction))
      }

      // Apply pagination
      if (config.limit) {
        firestoreQuery = query(firestoreQuery, limit(config.limit))
      }

      if (config.startAfter) {
        firestoreQuery = query(firestoreQuery, startAfter(config.startAfter))
      }

      const snapshot = await getDocs(firestoreQuery)
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      }))

      // Cache the result
      this.queryCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl: this.CACHE_TTL
      })

      return data
    } catch (error) {
      await dbPool.markConnectionError(connection.id)
      throw error
    } finally {
      await dbPool.releaseConnection(connection.id)
    }
  }

  // Batch operations for better performance
  async batchWrite(operations: BatchOperation[]): Promise<void> {
    // Add to batch queue
    this.batchQueue.push(...operations)

    // Process batch if it reaches size limit
    if (this.batchQueue.length >= this.BATCH_SIZE) {
      await this.processBatch()
    } else {
      // Set timer to process batch after timeout
      if (this.batchTimer) {
        clearTimeout(this.batchTimer)
      }
      this.batchTimer = setTimeout(() => {
        this.processBatch()
      }, this.BATCH_TIMEOUT)
    }
  }

  private async processBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return

    const operations = this.batchQueue.splice(0, this.BATCH_SIZE)
    const connection = await dbPool.getConnection()

    try {
      const batch = writeBatch(connection.firestore)
      
      for (const operation of operations) {
        const docRef = doc(connection.firestore, operation.collection, operation.docId || '')
        
        switch (operation.type) {
          case 'create':
            batch.set(docRef, operation.data)
            break
          case 'update':
            batch.update(docRef, operation.data)
            break
          case 'delete':
            batch.delete(docRef)
            break
        }
      }

      await batch.commit()
    } catch (error) {
      await dbPool.markConnectionError(connection.id)
      throw error
    } finally {
      await dbPool.releaseConnection(connection.id)
    }
  }

  // Transaction support for complex operations
  async runTransaction<T>(
    transactionFunction: (transaction: any) => Promise<T>
  ): Promise<T> {
    const connection = await dbPool.getConnection()
    
    try {
      return await runTransaction(connection.firestore, transactionFunction)
    } catch (error) {
      await dbPool.markConnectionError(connection.id)
      throw error
    } finally {
      await dbPool.releaseConnection(connection.id)
    }
  }

  // Optimized document operations
  async getDocument(collection: string, docId: string): Promise<any> {
    const connection = await dbPool.getConnection()
    
    try {
      const docRef = doc(connection.firestore, collection, docId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      }
      return null
    } catch (error) {
      await dbPool.markConnectionError(connection.id)
      throw error
    } finally {
      await dbPool.releaseConnection(connection.id)
    }
  }

  async setDocument(collection: string, docId: string, data: any): Promise<void> {
    const connection = await dbPool.getConnection()
    
    try {
      const docRef = doc(connection.firestore, collection, docId)
      await setDoc(docRef, data)
    } catch (error) {
      await dbPool.markConnectionError(connection.id)
      throw error
    } finally {
      await dbPool.releaseConnection(connection.id)
    }
  }

  async updateDocument(collection: string, docId: string, data: any): Promise<void> {
    const connection = await dbPool.getConnection()
    
    try {
      const docRef = doc(connection.firestore, collection, docId)
      await updateDoc(docRef, data)
    } catch (error) {
      await dbPool.markConnectionError(connection.id)
      throw error
    } finally {
      await dbPool.releaseConnection(connection.id)
    }
  }

  async deleteDocument(collection: string, docId: string): Promise<void> {
    const connection = await dbPool.getConnection()
    
    try {
      const docRef = doc(connection.firestore, collection, docId)
      await deleteDoc(docRef)
    } catch (error) {
      await dbPool.markConnectionError(connection.id)
      throw error
    } finally {
      await dbPool.releaseConnection(connection.id)
    }
  }

  // Connection health monitoring
  async getConnectionHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    stats: any
    recommendations: string[]
  }> {
    const stats = dbPool.getPoolStats()
    const recommendations: string[] = []

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

    // Check connection utilization
    const utilization = (stats.activeConnections / stats.maxConnections) * 100
    if (utilization > 80) {
      status = 'degraded'
      recommendations.push('Consider increasing max connections')
    }

    // Check error rate
    const errorRate = (stats.errorConnections / stats.totalConnections) * 100
    if (errorRate > 10) {
      status = 'unhealthy'
      recommendations.push('High error rate detected - check database connectivity')
    }

    // Check idle connections
    if (stats.idleConnections > stats.activeConnections * 2) {
      recommendations.push('Consider reducing min connections to save resources')
    }

    return {
      status,
      stats,
      recommendations
    }
  }

  // Cache management
  clearCache(): void {
    this.queryCache.clear()
  }

  getCacheStats(): {
    size: number
    hitRate: number
    memoryUsage: number
  } {
    return {
      size: this.queryCache.size,
      hitRate: 0.85, // Mock hit rate
      memoryUsage: this.queryCache.size * 1024 // Approximate memory usage
    }
  }

  private generateCacheKey(config: QueryOptimization): string {
    return `${config.collection}_${JSON.stringify(config.filters)}_${JSON.stringify(config.orderBy)}_${config.limit}`
  }
}

export const dbOptimizer = AdvancedDatabaseOptimizer.getInstance()
export { AdvancedDatabaseOptimizer }
export type { QueryOptimization, BatchOperation }
