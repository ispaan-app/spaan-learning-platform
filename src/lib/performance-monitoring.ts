'use client'

import { NextRequest, NextResponse } from 'next/server'

// Performance metrics interface
interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'count'
  timestamp: number
  tags: Record<string, string>
}

interface WebVitals {
  FCP: number // First Contentful Paint
  LCP: number // Largest Contentful Paint
  FID: number // First Input Delay
  CLS: number // Cumulative Layout Shift
  TTFB: number // Time to First Byte
}

interface PerformanceStats {
  totalRequests: number
  averageResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  errorRate: number
  throughput: number
  memoryUsage: number
  cpuUsage: number
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetric[] = []
  private webVitals: WebVitals[] = []
  private requestTimes: number[] = []
  private errorCount = 0
  private readonly MAX_METRICS = 10000

  private constructor() {
    this.initializeMonitoring()
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  private initializeMonitoring(): void {
    if (typeof window !== 'undefined') {
      // Monitor Web Vitals
      this.monitorWebVitals()
      
      // Monitor resource loading
      this.monitorResourceLoading()
      
      // Monitor memory usage
      this.monitorMemoryUsage()
      
      // Monitor long tasks
      this.monitorLongTasks()
    }
  }

  // Record performance metric
  recordMetric(
    name: string,
    value: number,
    unit: 'ms' | 'bytes' | 'count' = 'ms',
    tags: Record<string, string> = {}
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags
    }

    this.metrics.push(metric)

    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS)
    }
  }

  // Record Web Vitals
  recordWebVitals(vitals: Partial<WebVitals>): void {
    const webVital: WebVitals = {
      FCP: vitals.FCP || 0,
      LCP: vitals.LCP || 0,
      FID: vitals.FID || 0,
      CLS: vitals.CLS || 0,
      TTFB: vitals.TTFB || 0
    }

    this.webVitals.push(webVital)
  }

  // Record request time
  recordRequestTime(duration: number): void {
    this.requestTimes.push(duration)
    
    // Keep only recent request times
    if (this.requestTimes.length > 1000) {
      this.requestTimes = this.requestTimes.slice(-1000)
    }
  }

  // Record error
  recordError(error: Error, context?: string): void {
    this.errorCount++
    
    this.recordMetric('error', 1, 'count', {
      error: error.name,
      message: error.message,
      context: context || 'unknown'
    })
  }

  // Monitor Web Vitals
  private monitorWebVitals(): void {
    if (typeof window === 'undefined') return

    // First Contentful Paint
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.recordWebVitals({ FCP: entry.startTime })
        }
      }
    }).observe({ entryTypes: ['paint'] })

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.recordWebVitals({ LCP: lastEntry.startTime })
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordWebVitals({ FID: (entry as any).processingEnd - entry.startTime })
      }
    }).observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift
    let clsValue = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
        }
      }
      this.recordWebVitals({ CLS: clsValue })
    }).observe({ entryTypes: ['layout-shift'] })
  }

  // Monitor resource loading
  private monitorResourceLoading(): void {
    if (typeof window === 'undefined') return

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming
        
        this.recordMetric('resource_load_time', resource.duration, 'ms', {
          type: resource.initiatorType,
          name: resource.name,
          size: resource.transferSize.toString()
        })
      }
    }).observe({ entryTypes: ['resource'] })
  }

  // Monitor memory usage
  private monitorMemoryUsage(): void {
    if (typeof window === 'undefined') return

    setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        
        this.recordMetric('memory_used', memory.usedJSHeapSize, 'bytes')
        this.recordMetric('memory_total', memory.totalJSHeapSize, 'bytes')
        this.recordMetric('memory_limit', memory.jsHeapSizeLimit, 'bytes')
      }
    }, 30000) // Check every 30 seconds
  }

  // Monitor long tasks
  private monitorLongTasks(): void {
    if (typeof window === 'undefined') return

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric('long_task', entry.duration, 'ms', {
          startTime: entry.startTime.toString()
        })
      }
    }).observe({ entryTypes: ['longtask'] })
  }

  // Get performance statistics
  getStats(): PerformanceStats {
    const totalRequests = this.requestTimes.length
    const averageResponseTime = totalRequests > 0 
      ? this.requestTimes.reduce((sum, time) => sum + time, 0) / totalRequests
      : 0

    const sortedTimes = [...this.requestTimes].sort((a, b) => a - b)
    const p95Index = Math.floor(sortedTimes.length * 0.95)
    const p99Index = Math.floor(sortedTimes.length * 0.99)
    
    const p95ResponseTime = sortedTimes[p95Index] || 0
    const p99ResponseTime = sortedTimes[p99Index] || 0

    const errorRate = totalRequests > 0 ? this.errorCount / totalRequests : 0
    const throughput = totalRequests / (Date.now() - this.metrics[0]?.timestamp || 1) * 1000

    return {
      totalRequests,
      averageResponseTime,
      p95ResponseTime,
      p99ResponseTime,
      errorRate,
      throughput,
      memoryUsage: this.getCurrentMemoryUsage(),
      cpuUsage: 0 // CPU usage not available in browser
    }
  }

  // Get current memory usage
  private getCurrentMemoryUsage(): number {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return 0
    }

    return (performance as any).memory.usedJSHeapSize
  }

  // Get metrics by name
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name)
  }

  // Get metrics by time range
  getMetricsByTimeRange(startTime: number, endTime: number): PerformanceMetric[] {
    return this.metrics.filter(metric => 
      metric.timestamp >= startTime && metric.timestamp <= endTime
    )
  }

  // Get Web Vitals
  getWebVitals(): WebVitals[] {
    return [...this.webVitals]
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics = []
    this.webVitals = []
    this.requestTimes = []
    this.errorCount = 0
  }

  // Export metrics
  exportMetrics(): string {
    return JSON.stringify({
      metrics: this.metrics,
      webVitals: this.webVitals,
      stats: this.getStats()
    })
  }
}

// API performance monitoring
export class ApiPerformanceMonitor {
  private static instance: ApiPerformanceMonitor
  private requestMetrics: Map<string, {
    count: number
    totalTime: number
    minTime: number
    maxTime: number
    errors: number
  }> = new Map()

  static getInstance(): ApiPerformanceMonitor {
    if (!ApiPerformanceMonitor.instance) {
      ApiPerformanceMonitor.instance = new ApiPerformanceMonitor()
    }
    return ApiPerformanceMonitor.instance
  }

  // Record API request
  recordRequest(
    endpoint: string,
    method: string,
    duration: number,
    statusCode: number
  ): void {
    const key = `${method}:${endpoint}`
    const existing = this.requestMetrics.get(key) || {
      count: 0,
      totalTime: 0,
      minTime: Infinity,
      maxTime: 0,
      errors: 0
    }

    const updated = {
      count: existing.count + 1,
      totalTime: existing.totalTime + duration,
      minTime: Math.min(existing.minTime, duration),
      maxTime: Math.max(existing.maxTime, duration),
      errors: existing.errors + (statusCode >= 400 ? 1 : 0)
    }

    this.requestMetrics.set(key, updated)
  }

  // Get API statistics
  getApiStats(): Record<string, {
    count: number
    averageTime: number
    minTime: number
    maxTime: number
    errorRate: number
  }> {
    const stats: Record<string, any> = {}

    this.requestMetrics.forEach((metrics, key) => {
      stats[key] = {
        count: metrics.count,
        averageTime: metrics.totalTime / metrics.count,
        minTime: metrics.minTime === Infinity ? 0 : metrics.minTime,
        maxTime: metrics.maxTime,
        errorRate: metrics.errors / metrics.count
      }
    })

    return stats
  }

  // Clear API metrics
  clearApiMetrics(): void {
    this.requestMetrics.clear()
  }
}

// Performance monitoring middleware
export function withPerformanceMonitoring(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now()
    const endpoint = request.nextUrl.pathname
    const method = request.method

    try {
      const response = await handler(request)
      const duration = Date.now() - startTime

      // Record successful request
      const apiMonitor = ApiPerformanceMonitor.getInstance()
      apiMonitor.recordRequest(endpoint, method, duration, response.status)

      // Add performance headers
      response.headers.set('X-Response-Time', `${duration}ms`)
      response.headers.set('X-Performance-Monitor', 'enabled')

      return response
    } catch (error) {
      const duration = Date.now() - startTime

      // Record failed request
      const apiMonitor = ApiPerformanceMonitor.getInstance()
      apiMonitor.recordRequest(endpoint, method, duration, 500)

      // Record error
      const perfMonitor = PerformanceMonitor.getInstance()
      perfMonitor.recordError(error as Error, `API:${endpoint}`)

      throw error
    }
  }
}

// Export singletons
export const performanceMonitor = PerformanceMonitor.getInstance()
export const apiPerformanceMonitor = ApiPerformanceMonitor.getInstance()

// Utility functions
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>,
  tags: Record<string, string> = {}
): T | Promise<T> {
  const startTime = performance.now()
  
  const result = fn()
  
  if (result instanceof Promise) {
    return result.then(value => {
      const duration = performance.now() - startTime
      performanceMonitor.recordMetric(name, duration, 'ms', tags)
      return value
    })
  } else {
    const duration = performance.now() - startTime
    performanceMonitor.recordMetric(name, duration, 'ms', tags)
    return result
  }
}

export function measureAsyncPerformance<T>(
  name: string,
  fn: () => Promise<T>,
  tags: Record<string, string> = {}
): Promise<T> {
  const startTime = performance.now()
  
  return fn().then(value => {
    const duration = performance.now() - startTime
    performanceMonitor.recordMetric(name, duration, 'ms', tags)
    return value
  }).catch(error => {
    const duration = performance.now() - startTime
    performanceMonitor.recordMetric(name, duration, 'ms', { ...tags, error: 'true' })
    throw error
  })
}

// Performance monitoring hook for React components
export function usePerformanceMonitoring(componentName: string) {
  React.useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const duration = performance.now() - startTime
      performanceMonitor.recordMetric(`component_render_${componentName}`, duration, 'ms')
    }
  })
}

// Import React for hooks
import React from 'react'
