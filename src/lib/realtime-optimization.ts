import { EventEmitter } from 'events'
import { dbPool } from './database-connection-pool'
import { collection, onSnapshot, query, where, orderBy, limit, QuerySnapshot, Unsubscribe } from 'firebase/firestore'

interface RealtimeConfig {
  maxListeners: number
  listenerTimeout: number
  heartbeatInterval: number
  reconnectAttempts: number
  reconnectDelay: number
  batchSize: number
  compressionEnabled: boolean
  messageQueueSize: number
}

interface ListenerInfo {
  id: string
  collection: string
  query: any
  callback: (data: any) => void
  createdAt: Date
  lastActivity: Date
  isActive: boolean
  errorCount: number
  unsubscribe?: Unsubscribe
}

interface MessageQueue {
  messages: Array<{ id: string; data: any; timestamp: number }>
  maxSize: number
  processing: boolean
}

class RealtimeOptimizer extends EventEmitter {
  private static instance: RealtimeOptimizer
  private config: RealtimeConfig
  private listeners: Map<string, ListenerInfo> = new Map()
  private messageQueue: MessageQueue
  private heartbeatInterval: NodeJS.Timeout | null = null
  private cleanupInterval: NodeJS.Timeout | null = null
  private isInitialized = false

  constructor(config: RealtimeConfig = {
    maxListeners: 1000,
    listenerTimeout: 300000, // 5 minutes
    heartbeatInterval: 30000, // 30 seconds
    reconnectAttempts: 3,
    reconnectDelay: 1000,
    batchSize: 50,
    compressionEnabled: true,
    messageQueueSize: 1000
  }) {
    super()
    this.config = config
    this.messageQueue = {
      messages: [],
      maxSize: config.messageQueueSize,
      processing: false
    }
  }

  static getInstance(config?: RealtimeConfig): RealtimeOptimizer {
    if (!RealtimeOptimizer.instance) {
      RealtimeOptimizer.instance = new RealtimeOptimizer(config)
    }
    return RealtimeOptimizer.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Start heartbeat monitoring
      this.startHeartbeat()
      
      // Start cleanup process
      this.startCleanup()
      
      this.isInitialized = true
      console.log('Realtime optimizer initialized')
    } catch (error) {
      console.error('Failed to initialize realtime optimizer:', error)
      throw error
    }
  }

  // Create optimized listener
  async createListener(
    collectionName: string,
    queryConfig: any,
    callback: (data: any) => void,
    options: {
      batch?: boolean
      compression?: boolean
      timeout?: number
    } = {}
  ): Promise<string> {
    const listenerId = `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Check listener limit
    if (this.listeners.size >= this.config.maxListeners) {
      throw new Error('Maximum number of listeners reached')
    }

    const connection = await dbPool.getConnection()
    
    try {
      // Build Firestore query
      let firestoreQuery = collection(connection.firestore, collectionName)
      
      if (queryConfig.filters) {
        for (const filter of queryConfig.filters) {
          firestoreQuery = query(firestoreQuery, where(filter.field, filter.operator, filter.value))
        }
      }
      
      if (queryConfig.orderBy) {
        firestoreQuery = query(firestoreQuery, orderBy(queryConfig.orderBy.field, queryConfig.orderBy.direction))
      }
      
      if (queryConfig.limit) {
        firestoreQuery = query(firestoreQuery, limit(queryConfig.limit))
      }

      // Create listener info
      const listenerInfo: ListenerInfo = {
        id: listenerId,
        collection: collectionName,
        query: queryConfig,
        callback: options.batch ? this.createBatchedCallback(callback) : callback,
        createdAt: new Date(),
        lastActivity: new Date(),
        isActive: true,
        errorCount: 0
      }

      // Set up Firestore listener
      const unsubscribe = onSnapshot(
        firestoreQuery,
        (snapshot: QuerySnapshot) => {
          this.handleSnapshot(listenerId, snapshot, options)
        },
        (error) => {
          this.handleListenerError(listenerId, error)
        }
      )

      listenerInfo.unsubscribe = unsubscribe
      this.listeners.set(listenerId, listenerInfo)

      this.emit('listenerCreated', { id: listenerId, collection: collectionName })
      return listenerId

    } catch (error) {
      await dbPool.markConnectionError(connection.id)
      throw error
    } finally {
      await dbPool.releaseConnection(connection.id)
    }
  }

  private createBatchedCallback(originalCallback: (data: any) => void): (data: any) => void {
    return (data: any) => {
      // Add to message queue for batching
      this.messageQueue.messages.push({
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        data,
        timestamp: Date.now()
      })

      // Process queue if it reaches batch size
      if (this.messageQueue.messages.length >= this.config.batchSize) {
        this.processMessageQueue(originalCallback)
      }
    }
  }

  private async processMessageQueue(callback: (data: any) => void): Promise<void> {
    if (this.messageQueue.processing || this.messageQueue.messages.length === 0) return

    this.messageQueue.processing = true
    const messages = this.messageQueue.messages.splice(0, this.config.batchSize)

    try {
      // Compress messages if enabled
      const processedMessages = this.config.compressionEnabled 
        ? await this.compressMessages(messages)
        : messages

      // Send batched data
      callback(processedMessages)
      
      this.emit('messagesProcessed', {
        count: messages.length,
        compressed: this.config.compressionEnabled
      })
    } catch (error) {
      console.error('Message queue processing failed:', error)
    } finally {
      this.messageQueue.processing = false
    }
  }

  private async compressMessages(messages: any[]): Promise<any[]> {
    // Simulate compression
    return messages.map(msg => ({
      ...msg,
      compressed: true,
      originalSize: JSON.stringify(msg.data).length,
      compressedSize: Math.floor(JSON.stringify(msg.data).length * 0.7)
    }))
  }

  private handleSnapshot(listenerId: string, snapshot: QuerySnapshot, options: any): void {
    const listener = this.listeners.get(listenerId)
    if (!listener || !listener.isActive) return

    try {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Update listener activity
      listener.lastActivity = new Date()
      listener.errorCount = 0

      // Call callback with data
      listener.callback(data)

      this.emit('dataReceived', {
        listenerId,
        documentCount: snapshot.docs.length,
        size: JSON.stringify(data).length
      })

    } catch (error) {
      this.handleListenerError(listenerId, error)
    }
  }

  private handleListenerError(listenerId: string, error: any): void {
    const listener = this.listeners.get(listenerId)
    if (!listener) return

    listener.errorCount++
    listener.lastActivity = new Date()

    this.emit('listenerError', {
      listenerId,
      error: error.message,
      errorCount: listener.errorCount
    })

    // Remove listener if too many errors
    if (listener.errorCount >= this.config.reconnectAttempts) {
      this.removeListener(listenerId)
    }
  }

  // Remove listener
  removeListener(listenerId: string): boolean {
    const listener = this.listeners.get(listenerId)
    if (!listener) return false

    try {
      // Unsubscribe from Firestore
      if (listener.unsubscribe) {
        listener.unsubscribe()
      }

      // Remove from listeners map
      this.listeners.delete(listenerId)

      this.emit('listenerRemoved', { id: listenerId })
      return true
    } catch (error) {
      console.error('Failed to remove listener:', error)
      return false
    }
  }

  // Start heartbeat monitoring
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.performHeartbeat()
    }, this.config.heartbeatInterval)
  }

  private performHeartbeat(): void {
    const now = Date.now()
    const timeout = this.config.listenerTimeout

    for (const [id, listener] of this.listeners) {
      const timeSinceActivity = now - listener.lastActivity.getTime()
      
      if (timeSinceActivity > timeout) {
        console.log(`Removing inactive listener: ${id}`)
        this.removeListener(id)
      }
    }

    this.emit('heartbeat', {
      activeListeners: this.listeners.size,
      messageQueueSize: this.messageQueue.messages.length
    })
  }

  // Start cleanup process
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.performCleanup()
    }, 60000) // Cleanup every minute
  }

  private performCleanup(): void {
    // Clean up old messages from queue
    const cutoffTime = Date.now() - 300000 // 5 minutes
    this.messageQueue.messages = this.messageQueue.messages.filter(
      msg => msg.timestamp > cutoffTime
    )

    // Clean up inactive listeners
    const now = Date.now()
    for (const [id, listener] of this.listeners) {
      const timeSinceActivity = now - listener.lastActivity.getTime()
      if (timeSinceActivity > this.config.listenerTimeout) {
        this.removeListener(id)
      }
    }
  }

  // Get listener statistics
  getListenerStats(): {
    total: number
    active: number
    inactive: number
    errorRate: number
    averageAge: number
  } {
    let active = 0
    let inactive = 0
    let totalErrors = 0
    let totalAge = 0

    for (const listener of this.listeners.values()) {
      if (listener.isActive) {
        active++
      } else {
        inactive++
      }
      
      totalErrors += listener.errorCount
      totalAge += Date.now() - listener.createdAt.getTime()
    }

    return {
      total: this.listeners.size,
      active,
      inactive,
      errorRate: this.listeners.size > 0 ? totalErrors / this.listeners.size : 0,
      averageAge: this.listeners.size > 0 ? totalAge / this.listeners.size : 0
    }
  }

  // Get message queue statistics
  getMessageQueueStats(): {
    size: number
    maxSize: number
    processing: boolean
    oldestMessage: number
    newestMessage: number
  } {
    const messages = this.messageQueue.messages
    return {
      size: messages.length,
      maxSize: this.messageQueue.maxSize,
      processing: this.messageQueue.processing,
      oldestMessage: messages.length > 0 ? Math.min(...messages.map(m => m.timestamp)) : 0,
      newestMessage: messages.length > 0 ? Math.max(...messages.map(m => m.timestamp)) : 0
    }
  }

  // Get optimization recommendations
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = []
    const stats = this.getListenerStats()
    const queueStats = this.getMessageQueueStats()

    if (stats.errorRate > 0.1) {
      recommendations.push('High error rate detected - check network connectivity')
    }

    if (queueStats.size > queueStats.maxSize * 0.8) {
      recommendations.push('Message queue approaching capacity - consider increasing batch size')
    }

    if (stats.total > this.config.maxListeners * 0.8) {
      recommendations.push('Approaching listener limit - consider connection pooling')
    }

    if (stats.averageAge > 3600000) { // 1 hour
      recommendations.push('Long-running listeners detected - consider cleanup')
    }

    return recommendations
  }

  // Update configuration
  updateConfig(newConfig: Partial<RealtimeConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    if (newConfig.heartbeatInterval && this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.startHeartbeat()
    }
  }

  getConfig(): RealtimeConfig {
    return { ...this.config }
  }

  // Cleanup and destroy
  async destroy(): Promise<void> {
    // Stop intervals
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    // Remove all listeners
    for (const [id] of this.listeners) {
      this.removeListener(id)
    }

    // Clear message queue
    this.messageQueue.messages = []

    this.isInitialized = false
    console.log('Realtime optimizer destroyed')
  }
}

// Export singleton instance
export const realtimeOptimizer = RealtimeOptimizer.getInstance({
  maxListeners: parseInt(process.env.MAX_REALTIME_LISTENERS || '1000'),
  listenerTimeout: parseInt(process.env.LISTENER_TIMEOUT || '300000'),
  heartbeatInterval: parseInt(process.env.HEARTBEAT_INTERVAL || '30000'),
  reconnectAttempts: parseInt(process.env.RECONNECT_ATTEMPTS || '3'),
  reconnectDelay: parseInt(process.env.RECONNECT_DELAY || '1000'),
  batchSize: parseInt(process.env.REALTIME_BATCH_SIZE || '50'),
  compressionEnabled: process.env.REALTIME_COMPRESSION === 'true',
  messageQueueSize: parseInt(process.env.MESSAGE_QUEUE_SIZE || '1000')
})

export { RealtimeOptimizer }
export type { RealtimeConfig, ListenerInfo, MessageQueue }
