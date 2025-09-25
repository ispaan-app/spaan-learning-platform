import { NextRequest, NextResponse } from 'next/server'

// Application Performance Monitoring (APM) integration
export class APMIntegration {
  private static instance: APMIntegration
  private metrics: Map<string, any> = new Map()
  private performanceEntries: PerformanceEntry[] = []

  private constructor() {
    this.initializePerformanceObserver()
  }

  static getInstance(): APMIntegration {
    if (!APMIntegration.instance) {
      APMIntegration.instance = new APMIntegration()
    }
    return APMIntegration.instance
  }

  private initializePerformanceObserver(): void {
    if (typeof window !== 'undefined') {
      // Monitor performance entries
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.performanceEntries.push(entry)
        }
      })
      
      observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] })
    }
  }

  // Track API performance
  trackAPICall(
    endpoint: string,
    method: string,
    duration: number,
    statusCode: number,
    error?: Error
  ): void {
    const metric = {
      endpoint,
      method,
      duration,
      statusCode,
      error: error?.message,
      timestamp: Date.now()
    }
    
    this.metrics.set(`api:${endpoint}:${Date.now()}`, metric)
  }

  // Track user interactions
  trackUserInteraction(
    action: string,
    component: string,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    const metric = {
      action,
      component,
      duration,
      metadata,
      timestamp: Date.now()
    }
    
    this.metrics.set(`interaction:${action}:${Date.now()}`, metric)
  }

  // Track page performance
  trackPagePerformance(
    page: string,
    loadTime: number,
    renderTime: number,
    metadata?: Record<string, any>
  ): void {
    const metric = {
      page,
      loadTime,
      renderTime,
      metadata,
      timestamp: Date.now()
    }
    
    this.metrics.set(`page:${page}:${Date.now()}`, metric)
  }

  // Get performance metrics
  getMetrics(): {
    apiCalls: any[]
    userInteractions: any[]
    pagePerformance: any[]
    systemMetrics: {
      memoryUsage: number
      cpuUsage: number
      loadTime: number
    }
  } {
    const apiCalls: any[] = []
    const userInteractions: any[] = []
    const pagePerformance: any[] = []
    
    for (const [key, value] of Array.from(this.metrics.entries())) {
      if (key.startsWith('api:')) {
        apiCalls.push(value)
      } else if (key.startsWith('interaction:')) {
        userInteractions.push(value)
      } else if (key.startsWith('page:')) {
        pagePerformance.push(value)
      }
    }
    
    return {
      apiCalls,
      userInteractions,
      pagePerformance,
      systemMetrics: this.getSystemMetrics()
    }
  }

  private getSystemMetrics(): {
    memoryUsage: number
    cpuUsage: number
    loadTime: number
  } {
    if (typeof window !== 'undefined') {
      const memory = (performance as any).memory
      return {
        memoryUsage: memory ? memory.usedJSHeapSize : 0,
        cpuUsage: 0, // Not available in browser
        loadTime: performance.now()
      }
    }
    
    return {
      memoryUsage: 0,
      cpuUsage: 0,
      loadTime: 0
    }
  }

  // Clear old metrics
  clearOldMetrics(maxAge: number = 3600000): void {
    const cutoff = Date.now() - maxAge
    
    for (const [key, value] of Array.from(this.metrics.entries())) {
      if (value.timestamp < cutoff) {
        this.metrics.delete(key)
      }
    }
  }
}

// APM middleware
export function withAPM(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now()
    const apm = APMIntegration.getInstance()
    
    try {
      const response = await handler(request)
      const duration = Date.now() - startTime
      
      // Track successful API call
      apm.trackAPICall(
        request.nextUrl.pathname,
        request.method,
        duration,
        response.status
      )
      
      return response
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Track failed API call
      apm.trackAPICall(
        request.nextUrl.pathname,
        request.method,
        duration,
        500,
        error as Error
      )
      
      throw error
    }
  }
}

export default APMIntegration
