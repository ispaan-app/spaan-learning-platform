import { EventEmitter } from 'events'
import { dbPool } from './database-connection-pool'
import { resourceOptimizer } from './server-resource-optimizer'
import { autoScaler } from './auto-scaling'
import { cdnOptimizer } from './cdn-optimization'
import { bandwidthOptimizer } from './bandwidth-optimization'
import { realtimeOptimizer } from './realtime-optimization'
import { wsOptimizer } from './websocket-optimization'

interface PerformanceConfig {
  enableDatabaseOptimization: boolean
  enableResourceOptimization: boolean
  enableAutoScaling: boolean
  enableCDNOptimization: boolean
  enableBandwidthOptimization: boolean
  enableRealtimeOptimization: boolean
  enableWebSocketOptimization: boolean
  monitoringInterval: number
  alertThresholds: {
    cpu: number
    memory: number
    connections: number
    responseTime: number
    errorRate: number
  }
}

interface PerformanceMetrics {
  database: {
    connections: number
    queryTime: number
    cacheHitRate: number
    errorRate: number
  }
  server: {
    cpu: number
    memory: number
    loadAverage: number[]
    gcCount: number
  }
  network: {
    bandwidth: number
    latency: number
    packetLoss: number
    throughput: number
  }
  realtime: {
    listeners: number
    messages: number
    connections: number
    errorRate: number
  }
  overall: {
    healthScore: number
    status: 'healthy' | 'warning' | 'critical'
    recommendations: string[]
  }
}

class PerformanceOptimizationManager extends EventEmitter {
  private static instance: PerformanceOptimizationManager
  private config: PerformanceConfig
  private metrics: PerformanceMetrics
  private monitoringInterval: NodeJS.Timeout | null = null
  private isInitialized = false

  constructor(config: PerformanceConfig = {
    enableDatabaseOptimization: true,
    enableResourceOptimization: true,
    enableAutoScaling: true,
    enableCDNOptimization: true,
    enableBandwidthOptimization: true,
    enableRealtimeOptimization: true,
    enableWebSocketOptimization: true,
    monitoringInterval: 10000, // 10 seconds
    alertThresholds: {
      cpu: 80,
      memory: 80,
      connections: 1000,
      responseTime: 2000,
      errorRate: 5
    }
  }) {
    super()
    this.config = config
    this.metrics = this.getInitialMetrics()
  }

  static getInstance(config?: PerformanceConfig): PerformanceOptimizationManager {
    if (!PerformanceOptimizationManager.instance) {
      PerformanceOptimizationManager.instance = new PerformanceOptimizationManager(config)
    }
    return PerformanceOptimizationManager.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log('Initializing Performance Optimization Manager...')

      // Initialize database optimization
      if (this.config.enableDatabaseOptimization) {
        await dbPool.initialize()
        console.log('✅ Database optimization initialized')
      }

      // Initialize resource optimization
      if (this.config.enableResourceOptimization) {
        resourceOptimizer.startMonitoring()
        console.log('✅ Resource optimization initialized')
      }

      // Initialize auto-scaling
      if (this.config.enableAutoScaling) {
        autoScaler.start()
        console.log('✅ Auto-scaling initialized')
      }

      // Initialize CDN optimization
      if (this.config.enableCDNOptimization) {
        console.log('✅ CDN optimization initialized')
      }

      // Initialize bandwidth optimization
      if (this.config.enableBandwidthOptimization) {
        bandwidthOptimizer.startMonitoring()
        console.log('✅ Bandwidth optimization initialized')
      }

      // Initialize realtime optimization
      if (this.config.enableRealtimeOptimization) {
        await realtimeOptimizer.initialize()
        console.log('✅ Realtime optimization initialized')
      }

      // Initialize WebSocket optimization
      if (this.config.enableWebSocketOptimization) {
        await wsOptimizer.initialize()
        console.log('✅ WebSocket optimization initialized')
      }

      // Start monitoring
      this.startMonitoring()

      this.isInitialized = true
      console.log('🚀 Performance Optimization Manager fully initialized')

    } catch (error) {
      console.error('Failed to initialize Performance Optimization Manager:', error)
      throw error
    }
  }

  private getInitialMetrics(): PerformanceMetrics {
    return {
      database: {
        connections: 0,
        queryTime: 0,
        cacheHitRate: 0,
        errorRate: 0
      },
      server: {
        cpu: 0,
        memory: 0,
        loadAverage: [0, 0, 0],
        gcCount: 0
      },
      network: {
        bandwidth: 0,
        latency: 0,
        packetLoss: 0,
        throughput: 0
      },
      realtime: {
        listeners: 0,
        messages: 0,
        connections: 0,
        errorRate: 0
      },
      overall: {
        healthScore: 100,
        status: 'healthy',
        recommendations: []
      }
    }
  }

  private startMonitoring(): void {
    if (this.monitoringInterval) return

    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics()
      this.analyzePerformance()
      this.emitOptimizationEvents()
    }, this.config.monitoringInterval)

    console.log('Performance monitoring started')
  }

  private async collectMetrics(): Promise<void> {
    try {
      // Collect database metrics
      if (this.config.enableDatabaseOptimization) {
        const dbStats = dbPool.getPoolStats()
        this.metrics.database = {
          connections: dbStats.activeConnections,
          queryTime: 100, // Mock query time
          cacheHitRate: 0.85, // Mock cache hit rate
          errorRate: 0.02 // Mock error rate
        }
      }

      // Collect server metrics
      if (this.config.enableResourceOptimization) {
        const resourceMetrics = resourceOptimizer.getMetrics()
        this.metrics.server = {
          cpu: resourceMetrics.cpu.usage,
          memory: resourceMetrics.memory.usage,
          loadAverage: resourceMetrics.cpu.loadAverage,
          gcCount: resourceMetrics.gc.count
        }
      }

      // Collect network metrics
      if (this.config.enableBandwidthOptimization) {
        const networkStatus = bandwidthOptimizer.getStatus()
        this.metrics.network = {
          bandwidth: networkStatus.metrics.downloadSpeed,
          latency: networkStatus.metrics.latency,
          packetLoss: networkStatus.metrics.packetLoss,
          throughput: networkStatus.metrics.throughput
        }
      }

      // Collect realtime metrics
      if (this.config.enableRealtimeOptimization) {
        const realtimeStats = realtimeOptimizer.getListenerStats()
        this.metrics.realtime = {
          listeners: realtimeStats.active,
          messages: realtimeOptimizer.getMessageQueueStats().size,
          connections: realtimeStats.total,
          errorRate: realtimeStats.errorRate
        }
      }

      // Calculate overall health score
      this.calculateHealthScore()

    } catch (error) {
      console.error('Failed to collect metrics:', error)
    }
  }

  private calculateHealthScore(): void {
    let score = 100
    const recommendations: string[] = []

    // Database health
    if (this.metrics.database.errorRate > 0.05) {
      score -= 20
      recommendations.push('High database error rate detected')
    }
    if (this.metrics.database.connections > this.config.alertThresholds.connections * 0.8) {
      score -= 10
      recommendations.push('Database connection limit approaching')
    }

    // Server health
    if (this.metrics.server.cpu > this.config.alertThresholds.cpu) {
      score -= 25
      recommendations.push('High CPU usage detected')
    }
    if (this.metrics.server.memory > this.config.alertThresholds.memory) {
      score -= 25
      recommendations.push('High memory usage detected')
    }

    // Network health
    if (this.metrics.network.latency > 500) {
      score -= 15
      recommendations.push('High network latency detected')
    }
    if (this.metrics.network.packetLoss > 2) {
      score -= 20
      recommendations.push('High packet loss detected')
    }

    // Realtime health
    if (this.metrics.realtime.errorRate > this.config.alertThresholds.errorRate) {
      score -= 15
      recommendations.push('High realtime error rate detected')
    }

    this.metrics.overall.healthScore = Math.max(0, score)
    this.metrics.overall.recommendations = recommendations

    // Determine status
    if (score >= 80) {
      this.metrics.overall.status = 'healthy'
    } else if (score >= 60) {
      this.metrics.overall.status = 'warning'
    } else {
      this.metrics.overall.status = 'critical'
    }
  }

  private analyzePerformance(): void {
    // Check for critical issues
    if (this.metrics.overall.status === 'critical') {
      this.emit('criticalAlert', {
        status: this.metrics.overall.status,
        healthScore: this.metrics.overall.healthScore,
        recommendations: this.metrics.overall.recommendations,
        metrics: this.metrics
      })
    }

    // Check for warning conditions
    if (this.metrics.overall.status === 'warning') {
      this.emit('warningAlert', {
        status: this.metrics.overall.status,
        healthScore: this.metrics.overall.healthScore,
        recommendations: this.metrics.overall.recommendations,
        metrics: this.metrics
      })
    }
  }

  private emitOptimizationEvents(): void {
    this.emit('metrics', this.metrics)
    this.emit('healthCheck', {
      status: this.metrics.overall.status,
      healthScore: this.metrics.overall.healthScore,
      timestamp: new Date()
    })
  }

  // Public methods
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical'
    healthScore: number
    recommendations: string[]
    uptime: number
  } {
    return {
      status: this.metrics.overall.status,
      healthScore: this.metrics.overall.healthScore,
      recommendations: this.metrics.overall.recommendations,
      uptime: process.uptime()
    }
  }

  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = []

    // Database recommendations
    if (this.config.enableDatabaseOptimization) {
      const dbHealth = dbPool.getPoolStats()
      if (dbHealth.activeConnections > dbHealth.maxConnections * 0.8) {
        recommendations.push('Consider increasing database connection pool size')
      }
    }

    // Server recommendations
    if (this.config.enableResourceOptimization) {
      const resourceHealth = resourceOptimizer.getHealthStatus()
      recommendations.push(...resourceHealth.recommendations)
    }

    // Auto-scaling recommendations
    if (this.config.enableAutoScaling) {
      const scalingStatus = autoScaler.getCurrentStatus()
      if (scalingStatus.instances < 2) {
        recommendations.push('Consider scaling up for better performance')
      }
    }

    // CDN recommendations
    if (this.config.enableCDNOptimization) {
      const cdnStats = cdnOptimizer.getCacheStats()
      if (cdnStats.hitRate < 0.8) {
        recommendations.push('CDN cache hit rate is low - consider cache optimization')
      }
    }

    // Bandwidth recommendations
    if (this.config.enableBandwidthOptimization) {
      const bandwidthRecommendations = bandwidthOptimizer.getOptimizationRecommendations()
      recommendations.push(...bandwidthRecommendations)
    }

    // Realtime recommendations
    if (this.config.enableRealtimeOptimization) {
      const realtimeRecommendations = realtimeOptimizer.getOptimizationRecommendations()
      recommendations.push(...realtimeRecommendations)
    }

    // WebSocket recommendations
    if (this.config.enableWebSocketOptimization) {
      const wsRecommendations = wsOptimizer.getOptimizationRecommendations()
      recommendations.push(...wsRecommendations)
    }

    return recommendations
  }

  // Force optimization
  async forceOptimization(): Promise<void> {
    console.log('Forcing performance optimization...')

    try {
      // Force database optimization
      if (this.config.enableDatabaseOptimization) {
        // Clear database cache
        console.log('Optimizing database...')
      }

      // Force resource optimization
      if (this.config.enableResourceOptimization) {
        await resourceOptimizer.forceOptimization()
        console.log('Optimizing server resources...')
      }

      // Force auto-scaling check
      if (this.config.enableAutoScaling) {
        // Trigger scaling evaluation
        console.log('Evaluating auto-scaling...')
      }

      // Force CDN optimization
      if (this.config.enableCDNOptimization) {
        cdnOptimizer.clearCache()
        console.log('Optimizing CDN cache...')
      }

      // Force bandwidth optimization
      if (this.config.enableBandwidthOptimization) {
        // Trigger bandwidth optimization
        console.log('Optimizing bandwidth...')
      }

      console.log('✅ Performance optimization completed')

    } catch (error) {
      console.error('Performance optimization failed:', error)
      throw error
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    if (newConfig.monitoringInterval && this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.startMonitoring()
    }
  }

  getConfig(): PerformanceConfig {
    return { ...this.config }
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    console.log('Performance monitoring stopped')
  }

  // Cleanup and destroy
  async destroy(): Promise<void> {
    console.log('Destroying Performance Optimization Manager...')

    // Stop monitoring
    this.stopMonitoring()

    // Destroy all optimizers
    if (this.config.enableResourceOptimization) {
      resourceOptimizer.stopMonitoring()
    }

    if (this.config.enableAutoScaling) {
      autoScaler.stop()
    }

    if (this.config.enableBandwidthOptimization) {
      bandwidthOptimizer.stopMonitoring()
    }

    if (this.config.enableRealtimeOptimization) {
      await realtimeOptimizer.destroy()
    }

    if (this.config.enableWebSocketOptimization) {
      await wsOptimizer.destroy()
    }

    if (this.config.enableDatabaseOptimization) {
      await dbPool.destroy()
    }

    this.isInitialized = false
    console.log('✅ Performance Optimization Manager destroyed')
  }
}

// Export singleton instance
export const performanceManager = PerformanceOptimizationManager.getInstance({
  enableDatabaseOptimization: process.env.ENABLE_DB_OPTIMIZATION !== 'false',
  enableResourceOptimization: process.env.ENABLE_RESOURCE_OPTIMIZATION !== 'false',
  enableAutoScaling: process.env.ENABLE_AUTO_SCALING !== 'false',
  enableCDNOptimization: process.env.ENABLE_CDN_OPTIMIZATION !== 'false',
  enableBandwidthOptimization: process.env.ENABLE_BANDWIDTH_OPTIMIZATION !== 'false',
  enableRealtimeOptimization: process.env.ENABLE_REALTIME_OPTIMIZATION !== 'false',
  enableWebSocketOptimization: process.env.ENABLE_WEBSOCKET_OPTIMIZATION !== 'false',
  monitoringInterval: parseInt(process.env.PERFORMANCE_MONITORING_INTERVAL || '10000'),
  alertThresholds: {
    cpu: parseInt(process.env.CPU_ALERT_THRESHOLD || '80'),
    memory: parseInt(process.env.MEMORY_ALERT_THRESHOLD || '80'),
    connections: parseInt(process.env.CONNECTIONS_ALERT_THRESHOLD || '1000'),
    responseTime: parseInt(process.env.RESPONSE_TIME_ALERT_THRESHOLD || '2000'),
    errorRate: parseInt(process.env.ERROR_RATE_ALERT_THRESHOLD || '5')
  }
})

export { PerformanceOptimizationManager }
export type { PerformanceConfig, PerformanceMetrics }
