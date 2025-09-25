import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth'
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage'

interface ConnectionPoolConfig {
  maxConnections: number
  minConnections: number
  connectionTimeout: number
  idleTimeout: number
  retryAttempts: number
  retryDelay: number
}

interface DatabaseConnection {
  id: string
  firestore: Firestore
  auth: Auth
  storage: FirebaseStorage
  createdAt: Date
  lastUsed: Date
  isActive: boolean
  errorCount: number
}

class DatabaseConnectionPool {
  private static instance: DatabaseConnectionPool
  private connections: Map<string, DatabaseConnection> = new Map()
  private config: ConnectionPoolConfig
  private isInitialized = false
  private healthCheckInterval: NodeJS.Timeout | null = null

  constructor(config: ConnectionPoolConfig = {
    maxConnections: 100,
    minConnections: 5,
    connectionTimeout: 30000,
    idleTimeout: 300000, // 5 minutes
    retryAttempts: 3,
    retryDelay: 1000
  }) {
    this.config = config
  }

  static getInstance(config?: ConnectionPoolConfig): DatabaseConnectionPool {
    if (!DatabaseConnectionPool.instance) {
      DatabaseConnectionPool.instance = new DatabaseConnectionPool(config)
    }
    return DatabaseConnectionPool.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Create initial connections
      await this.createConnections(this.config.minConnections)
      
      // Start health check
      this.startHealthCheck()
      
      this.isInitialized = true
      console.log(`Database connection pool initialized with ${this.config.minConnections} connections`)
    } catch (error) {
      console.error('Failed to initialize database connection pool:', error)
      throw error
    }
  }

  private async createConnections(count: number): Promise<void> {
    const promises = Array.from({ length: count }, (_, index) => 
      this.createConnection(`conn_${Date.now()}_${index}`)
    )
    
    await Promise.allSettled(promises)
  }

  private async createConnection(id: string): Promise<DatabaseConnection> {
    try {
      // Create Firebase app instance
      const app = initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!
      }, id)

      // Initialize services
      const firestore = getFirestore(app)
      const auth = getAuth(app)
      const storage = getStorage(app)

      // Connect to emulators in development
      if (process.env.NODE_ENV === 'development') {
        try {
          connectFirestoreEmulator(firestore, 'localhost', 8080)
          connectAuthEmulator(auth, 'http://localhost:9099')
          connectStorageEmulator(storage, 'localhost', 9199)
        } catch (error) {
          // Emulators already connected
        }
      }

      const connection: DatabaseConnection = {
        id,
        firestore,
        auth,
        storage,
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true,
        errorCount: 0
      }

      this.connections.set(id, connection)
      return connection
    } catch (error) {
      console.error(`Failed to create connection ${id}:`, error)
      throw error
    }
  }

  async getConnection(): Promise<DatabaseConnection> {
    // Find available connection
    for (const [id, connection] of this.connections) {
      if (connection.isActive && connection.errorCount < 3) {
        connection.lastUsed = new Date()
        return connection
      }
    }

    // Create new connection if under limit
    if (this.connections.size < this.config.maxConnections) {
      const id = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      return await this.createConnection(id)
    }

    // Wait for connection to become available
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout: No available connections'))
      }, this.config.connectionTimeout)

      const checkForConnection = () => {
        for (const [id, connection] of this.connections) {
          if (connection.isActive && connection.errorCount < 3) {
            clearTimeout(timeout)
            connection.lastUsed = new Date()
            resolve(connection)
            return
          }
        }
        setTimeout(checkForConnection, 100)
      }
      checkForConnection()
    })
  }

  async releaseConnection(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId)
    if (connection) {
      connection.lastUsed = new Date()
    }
  }

  async markConnectionError(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId)
    if (connection) {
      connection.errorCount++
      if (connection.errorCount >= 3) {
        connection.isActive = false
        // Create replacement connection
        if (this.connections.size < this.config.maxConnections) {
          const newId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          await this.createConnection(newId)
        }
      }
    }
  }

  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck()
    }, 60000) // Check every minute
  }

  private async performHealthCheck(): Promise<void> {
    const now = Date.now()
    const idleThreshold = this.config.idleTimeout

    for (const [id, connection] of this.connections) {
      const timeSinceLastUse = now - connection.lastUsed.getTime()
      
      // Remove idle connections if we have more than minimum
      if (timeSinceLastUse > idleThreshold && this.connections.size > this.config.minConnections) {
        connection.isActive = false
        this.connections.delete(id)
      }
    }

    // Ensure minimum connections
    if (this.connections.size < this.config.minConnections) {
      const needed = this.config.minConnections - this.connections.size
      await this.createConnections(needed)
    }
  }

  getPoolStats(): {
    totalConnections: number
    activeConnections: number
    idleConnections: number
    errorConnections: number
    maxConnections: number
  } {
    let activeConnections = 0
    let idleConnections = 0
    let errorConnections = 0

    for (const connection of this.connections.values()) {
      if (!connection.isActive) continue
      
      if (connection.errorCount > 0) {
        errorConnections++
      } else {
        const timeSinceLastUse = Date.now() - connection.lastUsed.getTime()
        if (timeSinceLastUse > 60000) { // 1 minute
          idleConnections++
        } else {
          activeConnections++
        }
      }
    }

    return {
      totalConnections: this.connections.size,
      activeConnections,
      idleConnections,
      errorConnections,
      maxConnections: this.config.maxConnections
    }
  }

  async destroy(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }
    
    this.connections.clear()
    this.isInitialized = false
  }
}

// Export singleton instance
export const dbPool = DatabaseConnectionPool.getInstance({
  maxConnections: parseInt(process.env.DATABASE_POOL_SIZE || '50'),
  minConnections: parseInt(process.env.DATABASE_MIN_CONNECTIONS || '5'),
  connectionTimeout: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '30000'),
  idleTimeout: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '300000')
})

export { DatabaseConnectionPool }
export type { DatabaseConnection, ConnectionPoolConfig }
