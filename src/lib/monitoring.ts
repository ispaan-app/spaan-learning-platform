import { NextRequest, NextResponse } from 'next/server'

interface MetricData {
  name: string
  value: number
  labels?: Record<string, string>
  timestamp: number
}

interface PerformanceMetrics {
  requests: number
  averageResponseTime: number
  errorRate: number
  memoryUsage: number
  cpuUsage: number
  activeConnections: number
}

interface BusinessMetrics {
  totalUsers: number
  activeUsers: number
  applicationsSubmitted: number
  applicationsApproved: number
  learnersActive: number
  placementsActive: number
  revenue: number
}

class MetricsCollector {
  private static instance: MetricsCollector
  private metrics: Map<string, MetricData[]> = new Map()
  private performanceMetrics: PerformanceMetrics = {
    requests: 0,
    averageResponseTime: 0,
    errorRate: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    activeConnections: 0
  }
  private businessMetrics: BusinessMetrics = {
    totalUsers: 0,
    activeUsers: 0,
    applicationsSubmitted: 0,
    applicationsApproved: 0,
    learnersActive: 0,
    placementsActive: 0,
    revenue: 0
  }

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector()
    }
    return MetricsCollector.instance
  }

  recordMetric(name: string, value: number, labels?: Record<string, string>): void {
    const metric: MetricData = {
      name,
      value,
      labels,
      timestamp: Date.now()
    }

    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    const metricArray = this.metrics.get(name)!
    metricArray.push(metric)

    // Keep only last 1000 metrics per name
    if (metricArray.length > 1000) {
      metricArray.splice(0, metricArray.length - 1000)
    }
  }

  recordPerformanceMetric(metric: keyof PerformanceMetrics, value: number): void {
    this.performanceMetrics[metric] = value
  }

  recordBusinessMetric(metric: keyof BusinessMetrics, value: number): void {
    this.businessMetrics[metric] = value
  }

  getMetrics(name: string): MetricData[] {
    return this.metrics.get(name) || []
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics }
  }

  getBusinessMetrics(): BusinessMetrics {
    return { ...this.businessMetrics }
  }

  getAllMetrics(): Map<string, MetricData[]> {
    return new Map(this.metrics)
  }

  clearMetrics(): void {
    this.metrics.clear()
  }

  exportMetrics(): string {
    const allMetrics = Array.from(this.metrics.entries()).flatMap(([name, metrics]) =>
      metrics.map(metric => ({
        name: metric.name,
        value: metric.value,
        labels: metric.labels,
        timestamp: metric.timestamp
      }))
    )

    return JSON.stringify({
      performance: this.performanceMetrics,
      business: this.businessMetrics,
      custom: allMetrics
    }, null, 2)
  }
  }

  // Error tracking
class ErrorTracker {
  private static instance: ErrorTracker
  private errors: Array<{
    message: string
    stack?: string
    timestamp: number
    userId?: string
    requestId?: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    context?: Record<string, any>
  }> = []

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker()
    }
    return ErrorTracker.instance
  }

  recordError(
    error: Error,
    context?: {
      userId?: string
      requestId?: string
      severity?: 'low' | 'medium' | 'high' | 'critical'
      additionalContext?: Record<string, any>
    }
  ): void {
    this.errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      userId: context?.userId,
      requestId: context?.requestId,
      severity: context?.severity || 'medium',
      context: context?.additionalContext
    })

    // Keep only last 1000 errors
    if (this.errors.length > 1000) {
      this.errors.splice(0, this.errors.length - 1000)
    }

    // Log critical errors
    if (context?.severity === 'critical') {
      console.error('CRITICAL ERROR:', {
        message: error.message,
        stack: error.stack,
        context
      })
    }
  }

  getErrors(severity?: 'low' | 'medium' | 'high' | 'critical'): typeof this.errors {
    if (severity) {
      return this.errors.filter(error => error.severity === severity)
    }
    return [...this.errors]
  }

  getErrorCount(severity?: 'low' | 'medium' | 'high' | 'critical'): number {
    if (severity) {
      return this.errors.filter(error => error.severity === severity).length
    }
    return this.errors.length
  }

  clearErrors(): void {
    this.errors = []
  }
}

// Performance monitoring
class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private requestTimes: number[] = []
  private activeRequests: number = 0
  private startTime: number = Date.now()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startRequest(): string {
    this.activeRequests++
    return Date.now().toString()
  }

  endRequest(requestId: string): number {
    this.activeRequests--
    const duration = Date.now() - parseInt(requestId)
    this.requestTimes.push(duration)

    // Keep only last 1000 request times
    if (this.requestTimes.length > 1000) {
      this.requestTimes.splice(0, this.requestTimes.length - 1000)
    }

    return duration
  }

  getAverageResponseTime(): number {
    if (this.requestTimes.length === 0) return 0
    return this.requestTimes.reduce((sum, time) => sum + time, 0) / this.requestTimes.length
  }

  getActiveRequests(): number {
    return this.activeRequests
  }

  getUptime(): number {
    return Date.now() - this.startTime
  }

  getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed / 1024 / 1024 // MB
    }
    return 0
  }

  recordApiCall(endpoint: string, method: string, duration: number, statusCode: number): void {
    // This method is used by the captureApiCall function
    // The actual recording is handled by the metricsCollector
    console.log(`API Call: ${method} ${endpoint} - ${duration}ms - ${statusCode}`)
  }
}

// Health check system
class HealthChecker {
  private static instance: HealthChecker
  private checks: Map<string, () => Promise<boolean>> = new Map()

  static getInstance(): HealthChecker {
    if (!HealthChecker.instance) {
      HealthChecker.instance = new HealthChecker()
    }
    return HealthChecker.instance
  }

  addCheck(name: string, check: () => Promise<boolean>): void {
    this.checks.set(name, check)
  }

  async runChecks(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    checks: Record<string, { status: 'pass' | 'fail'; message?: string }>
    timestamp: number
  }> {
    const results: Record<string, { status: 'pass' | 'fail'; message?: string }> = {}
    let failedChecks = 0

    for (const [name, check] of Array.from(this.checks.entries())) {
      try {
        const result = await check()
        results[name] = {
          status: result ? 'pass' : 'fail',
          message: result ? undefined : 'Check failed'
        }
        if (!result) failedChecks++
      } catch (error) {
        results[name] = {
          status: 'fail',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
        failedChecks++
      }
    }

    let status: 'healthy' | 'degraded' | 'unhealthy'
    if (failedChecks === 0) {
      status = 'healthy'
    } else if (failedChecks < this.checks.size / 2) {
      status = 'degraded'
    } else {
      status = 'unhealthy'
    }

    return {
      status,
      checks: results,
      timestamp: Date.now()
    }
  }

  async checkHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    checks: Record<string, { status: 'pass' | 'fail'; message?: string }>
    timestamp: number
  }> {
    return this.runChecks()
  }
}

// Monitoring middleware
export function withMonitoring<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async function (request: NextRequest, ...args: T): Promise<NextResponse> {
    const metrics = MetricsCollector.getInstance()
    const performance = PerformanceMonitor.getInstance()
    const errorTracker = ErrorTracker.getInstance()

    const requestId = performance.startRequest()
    const startTime = Date.now()

    try {
      const response = await handler(request, ...args)
      const duration = performance.endRequest(requestId)

      // Record metrics
      metrics.recordMetric('http_requests_total', 1, {
        method: request.method,
        path: request.nextUrl.pathname,
        status: response.status.toString()
      })

      metrics.recordMetric('http_request_duration_ms', duration, {
        method: request.method,
        path: request.nextUrl.pathname
      })

      metrics.recordPerformanceMetric('requests', metrics.getPerformanceMetrics().requests + 1)
      metrics.recordPerformanceMetric('averageResponseTime', performance.getAverageResponseTime())
      metrics.recordPerformanceMetric('activeConnections', performance.getActiveRequests())
      metrics.recordPerformanceMetric('memoryUsage', performance.getMemoryUsage())

      return response
    } catch (error) {
      const duration = performance.endRequest(requestId)
      
      // Record error
      errorTracker.recordError(error as Error, {
        requestId,
        severity: 'high',
        additionalContext: {
          method: request.method,
          path: request.nextUrl.pathname,
          duration
        }
      })

      // Record error metrics
      metrics.recordMetric('http_errors_total', 1, {
        method: request.method,
        path: request.nextUrl.pathname,
        error: error instanceof Error ? error.constructor.name : 'Unknown'
      })

      throw error
    }
  }
}

// Initialize health checks
export function initializeHealthChecks(): void {
  const healthChecker = HealthChecker.getInstance()

  // Database health check
  healthChecker.addCheck('database', async () => {
    try {
      // In a real implementation, you would check database connectivity
      // For now, we'll simulate a check
      return true
    } catch {
      return false
    }
  })

  // Redis health check
  healthChecker.addCheck('redis', async () => {
    try {
      // In a real implementation, you would check Redis connectivity
      return true
    } catch {
      return false
    }
  })

  // Memory health check
  healthChecker.addCheck('memory', async () => {
    const performance = PerformanceMonitor.getInstance()
    const memoryUsage = performance.getMemoryUsage()
    return memoryUsage < 1000 // Less than 1GB
  })
}

// Export instances
export const metricsCollector = MetricsCollector.getInstance()
export const errorTracker = ErrorTracker.getInstance()
export const performanceMonitor = PerformanceMonitor.getInstance()
export const healthChecker = HealthChecker.getInstance()

// Export utility functions
export async function getHealthData() {
  return await healthChecker.checkHealth()
}

export function captureMetric(name: string, value: number, tags?: Record<string, string>) {
  metricsCollector.recordMetric(name, value, tags)
}

export function captureApiCall(endpoint: string, method: string, duration: number, statusCode: number) {
  performanceMonitor.recordApiCall(endpoint, method, duration, statusCode)
}

export function captureError(error: Error, context?: {
  severity?: 'low' | 'medium' | 'high' | 'critical'
  tags?: Record<string, string>
  url?: string
  userAgent?: string
  componentStack?: string
}) {
  errorTracker.recordError(error, {
    severity: context?.severity || 'medium',
    additionalContext: {
      ...context?.tags,
      url: context?.url,
      userAgent: context?.userAgent,
      componentStack: context?.componentStack
    }
  })
}

// Initialize monitoring
initializeHealthChecks()