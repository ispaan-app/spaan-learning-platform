import { EventEmitter } from 'events'
import { resourceOptimizer } from './server-resource-optimizer'
import { dbPool } from './database-connection-pool'

interface ScalingMetrics {
  cpu: number
  memory: number
  connections: number
  responseTime: number
  errorRate: number
  throughput: number
}

interface ScalingConfig {
  minInstances: number
  maxInstances: number
  scaleUpThreshold: number
  scaleDownThreshold: number
  cooldownPeriod: number
  checkInterval: number
}

interface ScalingDecision {
  action: 'scale_up' | 'scale_down' | 'no_action'
  reason: string
  currentMetrics: ScalingMetrics
  targetInstances: number
  confidence: number
}

class AutoScalingManager extends EventEmitter {
  private static instance: AutoScalingManager
  private config: ScalingConfig
  private currentInstances: number
  private lastScalingTime: number = 0
  private metricsHistory: ScalingMetrics[] = []
  private scalingInterval: NodeJS.Timeout | null = null
  private isScaling = false

  constructor(config: ScalingConfig = {
    minInstances: 1,
    maxInstances: 10,
    scaleUpThreshold: 70,
    scaleDownThreshold: 30,
    cooldownPeriod: 300000, // 5 minutes
    checkInterval: 30000 // 30 seconds
  }) {
    super()
    this.config = config
    this.currentInstances = config.minInstances
  }

  static getInstance(config?: ScalingConfig): AutoScalingManager {
    if (!AutoScalingManager.instance) {
      AutoScalingManager.instance = new AutoScalingManager(config)
    }
    return AutoScalingManager.instance
  }

  start(): void {
    if (this.scalingInterval) return

    this.scalingInterval = setInterval(() => {
      this.evaluateScaling()
    }, this.config.checkInterval)

    console.log('Auto-scaling manager started')
  }

  stop(): void {
    if (this.scalingInterval) {
      clearInterval(this.scalingInterval)
      this.scalingInterval = null
    }
    console.log('Auto-scaling manager stopped')
  }

  private async evaluateScaling(): Promise<void> {
    if (this.isScaling) return

    const metrics = await this.collectMetrics()
    this.metricsHistory.push(metrics)
    
    // Keep only last 10 metrics
    if (this.metricsHistory.length > 10) {
      this.metricsHistory.shift()
    }

    const decision = this.makeScalingDecision(metrics)
    
    if (decision.action !== 'no_action') {
      await this.executeScaling(decision)
    }
  }

  private async collectMetrics(): Promise<ScalingMetrics> {
    const resourceMetrics = resourceOptimizer.getMetrics()
    const dbStats = dbPool.getPoolStats()
    
    // Mock response time and error rate (in real implementation, these would come from monitoring)
    const responseTime = Math.random() * 1000 // 0-1000ms
    const errorRate = Math.random() * 5 // 0-5%
    const throughput = Math.random() * 1000 // 0-1000 requests/second

    return {
      cpu: resourceMetrics.cpu.usage,
      memory: resourceMetrics.memory.usage,
      connections: dbStats.activeConnections,
      responseTime,
      errorRate,
      throughput
    }
  }

  private makeScalingDecision(metrics: ScalingMetrics): ScalingDecision {
    const now = Date.now()
    
    // Check cooldown period
    if (now - this.lastScalingTime < this.config.cooldownPeriod) {
      return {
        action: 'no_action',
        reason: 'Cooldown period active',
        currentMetrics: metrics,
        targetInstances: this.currentInstances,
        confidence: 0
      }
    }

    // Calculate average metrics over last 5 measurements
    const recentMetrics = this.metricsHistory.slice(-5)
    const avgCpu = recentMetrics.reduce((sum, m) => sum + m.cpu, 0) / recentMetrics.length
    const avgMemory = recentMetrics.reduce((sum, m) => sum + m.memory, 0) / recentMetrics.length
    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length
    const avgErrorRate = recentMetrics.reduce((sum, m) => sum + m.errorRate, 0) / recentMetrics.length

    // Scale up conditions
    if (this.shouldScaleUp(avgCpu, avgMemory, avgResponseTime, avgErrorRate)) {
      const targetInstances = Math.min(this.currentInstances + 1, this.config.maxInstances)
      return {
        action: 'scale_up',
        reason: `High resource usage: CPU ${avgCpu.toFixed(1)}%, Memory ${avgMemory.toFixed(1)}%, Response Time ${avgResponseTime.toFixed(0)}ms`,
        currentMetrics: metrics,
        targetInstances,
        confidence: this.calculateConfidence(avgCpu, avgMemory, avgResponseTime, avgErrorRate)
      }
    }

    // Scale down conditions
    if (this.shouldScaleDown(avgCpu, avgMemory, avgResponseTime, avgErrorRate)) {
      const targetInstances = Math.max(this.currentInstances - 1, this.config.minInstances)
      return {
        action: 'scale_down',
        reason: `Low resource usage: CPU ${avgCpu.toFixed(1)}%, Memory ${avgMemory.toFixed(1)}%, Response Time ${avgResponseTime.toFixed(0)}ms`,
        currentMetrics: metrics,
        targetInstances,
        confidence: this.calculateConfidence(avgCpu, avgMemory, avgResponseTime, avgErrorRate)
      }
    }

    return {
      action: 'no_action',
      reason: 'Resources within normal range',
      currentMetrics: metrics,
      targetInstances: this.currentInstances,
      confidence: 0
    }
  }

  private shouldScaleUp(cpu: number, memory: number, responseTime: number, errorRate: number): boolean {
    return (
      cpu > this.config.scaleUpThreshold ||
      memory > this.config.scaleUpThreshold ||
      responseTime > 2000 || // 2 seconds
      errorRate > 5 || // 5%
      this.currentInstances < this.config.maxInstances
    )
  }

  private shouldScaleDown(cpu: number, memory: number, responseTime: number, errorRate: number): boolean {
    return (
      cpu < this.config.scaleDownThreshold &&
      memory < this.config.scaleDownThreshold &&
      responseTime < 500 && // 500ms
      errorRate < 1 && // 1%
      this.currentInstances > this.config.minInstances
    )
  }

  private calculateConfidence(cpu: number, memory: number, responseTime: number, errorRate: number): number {
    let confidence = 0

    // CPU confidence
    if (cpu > 80) confidence += 0.3
    else if (cpu > 60) confidence += 0.2
    else if (cpu < 20) confidence += 0.2

    // Memory confidence
    if (memory > 80) confidence += 0.3
    else if (memory > 60) confidence += 0.2
    else if (memory < 20) confidence += 0.2

    // Response time confidence
    if (responseTime > 1000) confidence += 0.2
    else if (responseTime < 200) confidence += 0.2

    // Error rate confidence
    if (errorRate > 3) confidence += 0.2
    else if (errorRate < 0.5) confidence += 0.2

    return Math.min(confidence, 1)
  }

  private async executeScaling(decision: ScalingDecision): Promise<void> {
    if (this.isScaling) return

    this.isScaling = true
    this.lastScalingTime = Date.now()

    try {
      console.log(`Executing scaling decision: ${decision.action}`)
      console.log(`Reason: ${decision.reason}`)
      console.log(`Target instances: ${decision.targetInstances}`)
      console.log(`Confidence: ${(decision.confidence * 100).toFixed(1)}%`)

      // In a real implementation, this would:
      // 1. Create/destroy server instances
      // 2. Update load balancer configuration
      // 3. Update DNS records
      // 4. Notify monitoring systems

      this.currentInstances = decision.targetInstances

      this.emit('scaling', {
        action: decision.action,
        from: this.currentInstances,
        to: decision.targetInstances,
        reason: decision.reason,
        confidence: decision.confidence,
        timestamp: new Date()
      })

      // Simulate scaling time
      await new Promise(resolve => setTimeout(resolve, 5000))

    } catch (error) {
      console.error('Scaling execution failed:', error)
      this.emit('scalingError', error)
    } finally {
      this.isScaling = false
    }
  }

  // Public methods
  getCurrentStatus(): {
    instances: number
    metrics: ScalingMetrics
    lastScaling: Date | null
    isScaling: boolean
  } {
    return {
      instances: this.currentInstances,
      metrics: this.metricsHistory[this.metricsHistory.length - 1] || this.getDefaultMetrics(),
      lastScaling: this.lastScalingTime ? new Date(this.lastScalingTime) : null,
      isScaling: this.isScaling
    }
  }

  private getDefaultMetrics(): ScalingMetrics {
    return {
      cpu: 0,
      memory: 0,
      connections: 0,
      responseTime: 0,
      errorRate: 0,
      throughput: 0
    }
  }

  updateConfig(newConfig: Partial<ScalingConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    if (newConfig.checkInterval && this.scalingInterval) {
      clearInterval(this.scalingInterval)
      this.start()
    }
  }

  getConfig(): ScalingConfig {
    return { ...this.config }
  }

  // Manual scaling methods
  async scaleUp(): Promise<void> {
    if (this.currentInstances < this.config.maxInstances) {
      const decision: ScalingDecision = {
        action: 'scale_up',
        reason: 'Manual scale up requested',
        currentMetrics: this.metricsHistory[this.metricsHistory.length - 1] || this.getDefaultMetrics(),
        targetInstances: this.currentInstances + 1,
        confidence: 1
      }
      await this.executeScaling(decision)
    }
  }

  async scaleDown(): Promise<void> {
    if (this.currentInstances > this.config.minInstances) {
      const decision: ScalingDecision = {
        action: 'scale_down',
        reason: 'Manual scale down requested',
        currentMetrics: this.metricsHistory[this.metricsHistory.length - 1] || this.getDefaultMetrics(),
        targetInstances: this.currentInstances - 1,
        confidence: 1
      }
      await this.executeScaling(decision)
    }
  }
}

// Export singleton instance
export const autoScaler = AutoScalingManager.getInstance({
  minInstances: parseInt(process.env.MIN_INSTANCES || '1'),
  maxInstances: parseInt(process.env.MAX_INSTANCES || '10'),
  scaleUpThreshold: parseInt(process.env.SCALE_UP_THRESHOLD || '70'),
  scaleDownThreshold: parseInt(process.env.SCALE_DOWN_THRESHOLD || '30'),
  cooldownPeriod: parseInt(process.env.SCALING_COOLDOWN || '300000'),
  checkInterval: parseInt(process.env.SCALING_CHECK_INTERVAL || '30000')
})

export { AutoScalingManager }
export type { ScalingMetrics, ScalingConfig, ScalingDecision }
