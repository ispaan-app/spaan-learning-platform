import { performance } from 'perf_hooks'
import { EventEmitter } from 'events'

interface ResourceMetrics {
  cpu: {
    usage: number
    loadAverage: number[]
    cores: number
  }
  memory: {
    used: number
    total: number
    free: number
    usage: number
  }
  heap: {
    used: number
    total: number
    external: number
    arrayBuffers: number
  }
  gc: {
    count: number
    time: number
    lastGc: number
  }
}

interface OptimizationConfig {
  maxMemoryUsage: number // MB
  maxCpuUsage: number // percentage
  gcThreshold: number // MB
  monitoringInterval: number // ms
  autoOptimization: boolean
}

class ServerResourceOptimizer extends EventEmitter {
  private static instance: ServerResourceOptimizer
  private metrics: ResourceMetrics
  private config: OptimizationConfig
  private monitoringInterval: NodeJS.Timeout | null = null
  private gcCount = 0
  private lastGcTime = 0
  private isOptimizing = false

  constructor(config: OptimizationConfig = {
    maxMemoryUsage: 1024, // 1GB
    maxCpuUsage: 80, // 80%
    gcThreshold: 512, // 512MB
    monitoringInterval: 5000, // 5 seconds
    autoOptimization: true
  }) {
    super()
    this.config = config
    this.metrics = this.getInitialMetrics()
  }

  static getInstance(config?: OptimizationConfig): ServerResourceOptimizer {
    if (!ServerResourceOptimizer.instance) {
      ServerResourceOptimizer.instance = new ServerResourceOptimizer(config)
    }
    return ServerResourceOptimizer.instance
  }

  startMonitoring(): void {
    if (this.monitoringInterval) return

    this.monitoringInterval = setInterval(() => {
      this.collectMetrics()
      this.analyzeAndOptimize()
    }, this.config.monitoringInterval)

    console.log('Server resource monitoring started')
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    console.log('Server resource monitoring stopped')
  }

  private getInitialMetrics(): ResourceMetrics {
    const memUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()

    return {
      cpu: {
        usage: 0,
        loadAverage: [0, 0, 0],
        cores: require('os').cpus().length
      },
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        free: 0,
        usage: 0
      },
      heap: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers
      },
      gc: {
        count: 0,
        time: 0,
        lastGc: 0
      }
    }
  }

  private collectMetrics(): void {
    const memUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()
    const loadAvg = require('os').loadavg()

    this.metrics = {
      cpu: {
        usage: this.calculateCpuUsage(cpuUsage),
        loadAverage: loadAvg,
        cores: require('os').cpus().length
      },
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        free: memUsage.heapTotal - memUsage.heapUsed,
        usage: (memUsage.heapUsed / memUsage.heapTotal) * 100
      },
      heap: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers
      },
      gc: {
        count: this.gcCount,
        time: performance.now() - this.lastGcTime,
        lastGc: this.lastGcTime
      }
    }

    this.emit('metrics', this.metrics)
  }

  private calculateCpuUsage(cpuUsage: NodeJS.CpuUsage): number {
    const startUsage = cpuUsage
    const startTime = performance.now()
    
    // Wait a bit to get accurate CPU usage
    setTimeout(() => {
      const endUsage = process.cpuUsage(startUsage)
      const endTime = performance.now()
      
      const totalTime = (endTime - startTime) * 1000 // Convert to microseconds
      const totalUsage = endUsage.user + endUsage.system
      
      return (totalUsage / totalTime) * 100
    }, 100)

    return 0 // Return 0 for now, will be updated in next cycle
  }

  private analyzeAndOptimize(): void {
    if (this.isOptimizing) return

    const issues = this.detectIssues()
    if (issues.length > 0) {
      this.emit('issues', issues)
      
      if (this.config.autoOptimization) {
        this.optimize(issues)
      }
    }
  }

  private detectIssues(): string[] {
    const issues: string[] = []

    // Memory usage check
    if (this.metrics.memory.usage > this.config.maxMemoryUsage) {
      issues.push('High memory usage detected')
    }

    // CPU usage check
    if (this.metrics.cpu.usage > this.config.maxCpuUsage) {
      issues.push('High CPU usage detected')
    }

    // Heap usage check
    if (this.metrics.heap.used > this.config.gcThreshold * 1024 * 1024) {
      issues.push('Heap usage approaching threshold')
    }

    // Load average check
    const loadAvg = this.metrics.cpu.loadAverage[0]
    if (loadAvg > this.metrics.cpu.cores * 0.8) {
      issues.push('High system load detected')
    }

    return issues
  }

  private async optimize(issues: string[]): Promise<void> {
    this.isOptimizing = true

    try {
      for (const issue of issues) {
        switch (issue) {
          case 'High memory usage detected':
            await this.optimizeMemory()
            break
          case 'High CPU usage detected':
            await this.optimizeCpu()
            break
          case 'Heap usage approaching threshold':
            await this.forceGarbageCollection()
            break
          case 'High system load detected':
            await this.optimizeLoad()
            break
        }
      }
    } finally {
      this.isOptimizing = false
    }
  }

  private async optimizeMemory(): Promise<void> {
    console.log('Optimizing memory usage...')
    
    // Clear unused caches
    if (global.gc) {
      global.gc()
      this.gcCount++
      this.lastGcTime = performance.now()
    }

    // Emit memory optimization event
    this.emit('memoryOptimization', {
      before: this.metrics.memory,
      after: this.getCurrentMemoryMetrics()
    })
  }

  private async optimizeCpu(): Promise<void> {
    console.log('Optimizing CPU usage...')
    
    // Reduce monitoring frequency temporarily
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = setInterval(() => {
        this.collectMetrics()
        this.analyzeAndOptimize()
      }, this.config.monitoringInterval * 2) // Double the interval
    }

    // Emit CPU optimization event
    this.emit('cpuOptimization', {
      before: this.metrics.cpu,
      after: this.getCurrentCpuMetrics()
    })
  }

  private async forceGarbageCollection(): Promise<void> {
    console.log('Forcing garbage collection...')
    
    if (global.gc) {
      global.gc()
      this.gcCount++
      this.lastGcTime = performance.now()
    }

    // Emit GC event
    this.emit('garbageCollection', {
      count: this.gcCount,
      time: performance.now() - this.lastGcTime
    })
  }

  private async optimizeLoad(): Promise<void> {
    console.log('Optimizing system load...')
    
    // Implement load balancing strategies
    this.emit('loadOptimization', {
      loadAverage: this.metrics.cpu.loadAverage,
      cores: this.metrics.cpu.cores
    })
  }

  private getCurrentMemoryMetrics() {
    const memUsage = process.memoryUsage()
    return {
      used: memUsage.heapUsed,
      total: memUsage.heapTotal,
      free: memUsage.heapTotal - memUsage.heapUsed,
      usage: (memUsage.heapUsed / memUsage.heapTotal) * 100
    }
  }

  private getCurrentCpuMetrics() {
    const cpuUsage = process.cpuUsage()
    return {
      usage: this.calculateCpuUsage(cpuUsage),
      loadAverage: require('os').loadavg(),
      cores: require('os').cpus().length
    }
  }

  // Public methods for manual optimization
  async forceOptimization(): Promise<void> {
    const issues = this.detectIssues()
    if (issues.length > 0) {
      await this.optimize(issues)
    }
  }

  getMetrics(): ResourceMetrics {
    return { ...this.metrics }
  }

  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical'
    issues: string[]
    recommendations: string[]
  } {
    const issues = this.detectIssues()
    const recommendations: string[] = []

    let status: 'healthy' | 'warning' | 'critical' = 'healthy'

    if (issues.length > 0) {
      status = 'warning'
      
      if (issues.some(issue => 
        issue.includes('High memory') || 
        issue.includes('High CPU') || 
        issue.includes('High system load')
      )) {
        status = 'critical'
      }
    }

    // Generate recommendations
    if (this.metrics.memory.usage > 80) {
      recommendations.push('Consider increasing server memory or optimizing memory usage')
    }

    if (this.metrics.cpu.usage > 70) {
      recommendations.push('Consider CPU optimization or horizontal scaling')
    }

    if (this.metrics.cpu.loadAverage[0] > this.metrics.cpu.cores * 0.8) {
      recommendations.push('Consider load balancing or adding more server instances')
    }

    return {
      status,
      issues,
      recommendations
    }
  }

  // Configuration management
  updateConfig(newConfig: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    if (newConfig.monitoringInterval && this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.startMonitoring()
    }
  }

  getConfig(): OptimizationConfig {
    return { ...this.config }
  }
}

// Export singleton instance
export const resourceOptimizer = ServerResourceOptimizer.getInstance({
  maxMemoryUsage: parseInt(process.env.MAX_MEMORY_USAGE || '1024'),
  maxCpuUsage: parseInt(process.env.MAX_CPU_USAGE || '80'),
  gcThreshold: parseInt(process.env.GC_THRESHOLD || '512'),
  monitoringInterval: parseInt(process.env.MONITORING_INTERVAL || '5000'),
  autoOptimization: process.env.AUTO_OPTIMIZATION === 'true'
})

export { ServerResourceOptimizer }
export type { ResourceMetrics, OptimizationConfig }
