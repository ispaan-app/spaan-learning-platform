import { EventEmitter } from 'events'

interface WebSocketConfig {
  maxConnections: number
  heartbeatInterval: number
  reconnectAttempts: number
  reconnectDelay: number
  messageQueueSize: number
  compressionEnabled: boolean
  binaryMode: boolean
  pingTimeout: number
  pongTimeout: number
}

interface WebSocketConnection {
  id: string
  socket: WebSocket
  isAlive: boolean
  lastPing: number
  lastPong: number
  messageQueue: Array<{ id: string; data: any; timestamp: number }>
  subscriptions: Set<string>
  createdAt: Date
  errorCount: number
}

interface MessageBatch {
  messages: Array<{ id: string; data: any; timestamp: number }>
  compressionRatio: number
  totalSize: number
}

class WebSocketOptimizer extends EventEmitter {
  private static instance: WebSocketOptimizer
  private config: WebSocketConfig
  private connections: Map<string, WebSocketConnection> = new Map()
  private heartbeatInterval: NodeJS.Timeout | null = null
  private cleanupInterval: NodeJS.Timeout | null = null
  private messageBatchingInterval: NodeJS.Timeout | null = null
  private isInitialized = false

  constructor(config: WebSocketConfig = {
    maxConnections: 10000,
    heartbeatInterval: 30000, // 30 seconds
    reconnectAttempts: 3,
    reconnectDelay: 1000,
    messageQueueSize: 1000,
    compressionEnabled: true,
    binaryMode: false,
    pingTimeout: 5000,
    pongTimeout: 3000
  }) {
    super()
    this.config = config
  }

  static getInstance(config?: WebSocketConfig): WebSocketOptimizer {
    if (!WebSocketOptimizer.instance) {
      WebSocketOptimizer.instance = new WebSocketOptimizer(config)
    }
    return WebSocketOptimizer.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Start heartbeat monitoring
      this.startHeartbeat()
      
      // Start cleanup process
      this.startCleanup()
      
      // Start message batching
      this.startMessageBatching()
      
      this.isInitialized = true
      console.log('WebSocket optimizer initialized')
    } catch (error) {
      console.error('Failed to initialize WebSocket optimizer:', error)
      throw error
    }
  }

  // Create optimized WebSocket connection
  async createConnection(
    url: string,
    protocols?: string | string[],
    options: {
      autoReconnect?: boolean
      compression?: boolean
      binaryMode?: boolean
    } = {}
  ): Promise<string> {
    const connectionId = `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Check connection limit
    if (this.connections.size >= this.config.maxConnections) {
      throw new Error('Maximum number of WebSocket connections reached')
    }

    return new Promise((resolve, reject) => {
      try {
        const socket = new WebSocket(url, protocols)
        
        const connection: WebSocketConnection = {
          id: connectionId,
          socket,
          isAlive: false,
          lastPing: 0,
          lastPong: 0,
          messageQueue: [],
          subscriptions: new Set(),
          createdAt: new Date(),
          errorCount: 0
        }

        // Set up event handlers
        socket.onopen = () => {
          connection.isAlive = true
          this.emit('connectionOpened', { id: connectionId, url })
        }

        socket.onmessage = (event) => {
          this.handleMessage(connectionId, event)
        }

        socket.onclose = (event) => {
          connection.isAlive = false
          this.emit('connectionClosed', { id: connectionId, code: event.code, reason: event.reason })
          
          // Auto-reconnect if enabled
          if (options.autoReconnect && connection.errorCount < this.config.reconnectAttempts) {
            setTimeout(() => {
              this.reconnectConnection(connectionId, url, protocols, options)
            }, this.config.reconnectDelay)
          }
        }

        socket.onerror = (error) => {
          connection.errorCount++
          this.emit('connectionError', { id: connectionId, error })
        }

        this.connections.set(connectionId, connection)
        resolve(connectionId)

      } catch (error) {
        reject(error)
      }
    })
  }

  private async reconnectConnection(
    connectionId: string,
    url: string,
    protocols?: string | string[],
    options: any = {}
  ): Promise<void> {
    const connection = this.connections.get(connectionId)
    if (!connection) return

    try {
      console.log(`Reconnecting WebSocket: ${connectionId}`)
      await this.createConnection(url, protocols, options)
    } catch (error) {
      console.error(`Failed to reconnect WebSocket ${connectionId}:`, error)
    }
  }

  // Send message with optimization
  async sendMessage(
    connectionId: string,
    data: any,
    options: {
      batch?: boolean
      compress?: boolean
      priority?: 'high' | 'normal' | 'low'
    } = {}
  ): Promise<boolean> {
    const connection = this.connections.get(connectionId)
    if (!connection || !connection.isAlive) {
      return false
    }

    try {
      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        data,
        timestamp: Date.now(),
        priority: options.priority || 'normal'
      }

      if (options.batch) {
        // Add to message queue for batching
        connection.messageQueue.push(message)
        return true
      } else {
        // Send immediately
        return await this.sendImmediateMessage(connection, message, options)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      return false
    }
  }

  private async sendImmediateMessage(
    connection: WebSocketConnection,
    message: any,
    options: any
  ): Promise<boolean> {
    try {
      let dataToSend = message.data

      // Compress if enabled
      if (options.compress && this.config.compressionEnabled) {
        dataToSend = await this.compressData(dataToSend)
      }

      // Send message
      if (this.config.binaryMode) {
        const buffer = this.stringToBuffer(JSON.stringify(dataToSend))
        connection.socket.send(buffer)
      } else {
        connection.socket.send(JSON.stringify(dataToSend))
      }

      this.emit('messageSent', {
        connectionId: connection.id,
        messageId: message.id,
        size: JSON.stringify(dataToSend).length
      })

      return true
    } catch (error) {
      console.error('Failed to send immediate message:', error)
      return false
    }
  }

  // Subscribe to topics
  subscribe(connectionId: string, topic: string): boolean {
    const connection = this.connections.get(connectionId)
    if (!connection) return false

    connection.subscriptions.add(topic)
    this.emit('subscriptionAdded', { connectionId, topic })
    return true
  }

  // Unsubscribe from topics
  unsubscribe(connectionId: string, topic: string): boolean {
    const connection = this.connections.get(connectionId)
    if (!connection) return false

    connection.subscriptions.delete(topic)
    this.emit('subscriptionRemoved', { connectionId, topic })
    return true
  }

  // Broadcast to subscribers
  async broadcast(topic: string, data: any, options: any = {}): Promise<number> {
    let sentCount = 0

    for (const [connectionId, connection] of Array.from(this.connections.entries())) {
      if (connection.isAlive && connection.subscriptions.has(topic)) {
        const success = await this.sendMessage(connectionId, data, options)
        if (success) sentCount++
      }
    }

    this.emit('broadcast', { topic, sentCount, totalConnections: this.connections.size })
    return sentCount
  }

  // Handle incoming messages
  private handleMessage(connectionId: string, event: MessageEvent): void {
    const connection = this.connections.get(connectionId)
    if (!connection) return

    try {
      let data = event.data

      // Handle binary data
      if (this.config.binaryMode && data instanceof ArrayBuffer) {
        data = this.bufferToString(data)
      }

      // Parse JSON
      if (typeof data === 'string') {
        data = JSON.parse(data)
      }

      // Handle ping/pong
      if (data.type === 'ping') {
        this.sendPong(connectionId)
        return
      }

      if (data.type === 'pong') {
        connection.lastPong = Date.now()
        return
      }

      this.emit('messageReceived', {
        connectionId,
        data,
        size: JSON.stringify(data).length
      })

    } catch (error) {
      console.error('Failed to handle message:', error)
    }
  }

  // Send ping
  private sendPing(connectionId: string): void {
    const connection = this.connections.get(connectionId)
    if (!connection || !connection.isAlive) return

    try {
      const pingMessage = { type: 'ping', timestamp: Date.now() }
      connection.socket.send(JSON.stringify(pingMessage))
      connection.lastPing = Date.now()
    } catch (error) {
      console.error('Failed to send ping:', error)
    }
  }

  // Send pong
  private sendPong(connectionId: string): void {
    const connection = this.connections.get(connectionId)
    if (!connection || !connection.isAlive) return

    try {
      const pongMessage = { type: 'pong', timestamp: Date.now() }
      connection.socket.send(JSON.stringify(pongMessage))
      connection.lastPong = Date.now()
    } catch (error) {
      console.error('Failed to send pong:', error)
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

    for (const [connectionId, connection] of Array.from(this.connections.entries())) {
      if (!connection.isAlive) continue

      // Check for stale connections
      if (now - connection.lastPong > this.config.pongTimeout) {
        console.log(`Closing stale connection: ${connectionId}`)
        this.closeConnection(connectionId)
        continue
      }

      // Send ping
      this.sendPing(connectionId)
    }

    this.emit('heartbeat', {
      activeConnections: this.connections.size,
      totalConnections: this.connections.size
    })
  }

  // Start cleanup process
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.performCleanup()
    }, 60000) // Cleanup every minute
  }

  private performCleanup(): void {
    const now = Date.now()
    const staleThreshold = 300000 // 5 minutes

    for (const [connectionId, connection] of Array.from(this.connections.entries())) {
      const timeSinceLastActivity = now - Math.max(connection.lastPing, connection.lastPong)
      
      if (timeSinceLastActivity > staleThreshold) {
        console.log(`Cleaning up stale connection: ${connectionId}`)
        this.closeConnection(connectionId)
      }
    }
  }

  // Start message batching
  private startMessageBatching(): void {
    this.messageBatchingInterval = setInterval(() => {
      this.processMessageBatches()
    }, 100) // Process batches every 100ms
  }

  private async processMessageBatches(): Promise<void> {
    for (const [connectionId, connection] of Array.from(this.connections.entries())) {
      if (connection.messageQueue.length === 0) continue

      const batch = connection.messageQueue.splice(0, this.config.messageQueueSize)
      await this.sendMessageBatch(connection, batch)
    }
  }

  private async sendMessageBatch(connection: WebSocketConnection, messages: any[]): Promise<void> {
    if (messages.length === 0) return

    try {
      const batch: MessageBatch = {
        messages,
        compressionRatio: 1,
        totalSize: 0
      }

      // Calculate total size
      batch.totalSize = messages.reduce((sum, msg) => sum + JSON.stringify(msg.data).length, 0)

      // Compress if enabled
      let dataToSend = batch
      if (this.config.compressionEnabled) {
        dataToSend = await this.compressData(batch)
        batch.compressionRatio = batch.totalSize / JSON.stringify(dataToSend).length
      }

      // Send batch
      if (this.config.binaryMode) {
        const buffer = this.stringToBuffer(JSON.stringify(dataToSend))
        connection.socket.send(buffer)
      } else {
        connection.socket.send(JSON.stringify(dataToSend))
      }

      this.emit('batchSent', {
        connectionId: connection.id,
        messageCount: messages.length,
        totalSize: batch.totalSize,
        compressionRatio: batch.compressionRatio
      })

    } catch (error) {
      console.error('Failed to send message batch:', error)
    }
  }

  // Utility methods
  private async compressData(data: any): Promise<any> {
    // Simulate compression
    return {
      ...data,
      compressed: true,
      originalSize: JSON.stringify(data).length,
      compressedSize: Math.floor(JSON.stringify(data).length * 0.7)
    }
  }

  private stringToBuffer(str: string): ArrayBuffer {
    const encoder = new TextEncoder()
    return encoder.encode(str).buffer
  }

  private bufferToString(buffer: ArrayBuffer): string {
    const decoder = new TextDecoder()
    return decoder.decode(buffer)
  }

  // Close connection
  closeConnection(connectionId: string): boolean {
    const connection = this.connections.get(connectionId)
    if (!connection) return false

    try {
      connection.socket.close()
      this.connections.delete(connectionId)
      this.emit('connectionClosed', { id: connectionId })
      return true
    } catch (error) {
      console.error('Failed to close connection:', error)
      return false
    }
  }

  // Get connection statistics
  getConnectionStats(): {
    total: number
    active: number
    inactive: number
    averageAge: number
    errorRate: number
  } {
    let active = 0
    let inactive = 0
    let totalErrors = 0
    let totalAge = 0

    for (const connection of Array.from(this.connections.values())) {
      if (connection.isAlive) {
        active++
      } else {
        inactive++
      }
      
      totalErrors += connection.errorCount
      totalAge += Date.now() - connection.createdAt.getTime()
    }

    return {
      total: this.connections.size,
      active,
      inactive,
      averageAge: this.connections.size > 0 ? totalAge / this.connections.size : 0,
      errorRate: this.connections.size > 0 ? totalErrors / this.connections.size : 0
    }
  }

  // Get optimization recommendations
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = []
    const stats = this.getConnectionStats()

    if (stats.errorRate > 0.1) {
      recommendations.push('High error rate detected - check network stability')
    }

    if (stats.total > this.config.maxConnections * 0.8) {
      recommendations.push('Approaching connection limit - consider load balancing')
    }

    if (stats.averageAge > 3600000) { // 1 hour
      recommendations.push('Long-running connections detected - consider connection pooling')
    }

    return recommendations
  }

  // Update configuration
  updateConfig(newConfig: Partial<WebSocketConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    if (newConfig.heartbeatInterval && this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.startHeartbeat()
    }
  }

  getConfig(): WebSocketConfig {
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
    if (this.messageBatchingInterval) {
      clearInterval(this.messageBatchingInterval)
    }

    // Close all connections
    for (const [connectionId] of Array.from(this.connections.entries())) {
      this.closeConnection(connectionId)
    }

    this.isInitialized = false
    console.log('WebSocket optimizer destroyed')
  }
}

// Export singleton instance
export const wsOptimizer = WebSocketOptimizer.getInstance({
  maxConnections: parseInt(process.env.MAX_WEBSOCKET_CONNECTIONS || '10000'),
  heartbeatInterval: parseInt(process.env.WS_HEARTBEAT_INTERVAL || '30000'),
  reconnectAttempts: parseInt(process.env.WS_RECONNECT_ATTEMPTS || '3'),
  reconnectDelay: parseInt(process.env.WS_RECONNECT_DELAY || '1000'),
  messageQueueSize: parseInt(process.env.WS_MESSAGE_QUEUE_SIZE || '1000'),
  compressionEnabled: process.env.WS_COMPRESSION_ENABLED === 'true',
  binaryMode: process.env.WS_BINARY_MODE === 'true',
  pingTimeout: parseInt(process.env.WS_PING_TIMEOUT || '5000'),
  pongTimeout: parseInt(process.env.WS_PONG_TIMEOUT || '3000')
})

export { WebSocketOptimizer }
export type { WebSocketConfig, WebSocketConnection, MessageBatch }
