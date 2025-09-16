import { NextRequest, NextResponse } from 'next/server'
import { captureMetric, captureApiCall } from '@/lib/monitoring'

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    const { metrics } = await request.json()
    
    // Validate metrics data
    if (!Array.isArray(metrics)) {
      return NextResponse.json(
        { error: 'Metrics must be an array' },
        { status: 400 }
      )
    }
    
    // Process and store metrics
    const processedMetrics = metrics.map((metric: any) => {
      // Capture each metric
      captureMetric(
        metric.name,
        metric.value,
        metric.tags || {}
      )
      
      return {
        ...metric,
        processed: true,
        timestamp: new Date().toISOString()
      }
    })
    
    const responseTime = Date.now() - startTime
    
    // Track this API call
    captureApiCall('/api/monitoring/performance', 'POST', responseTime, 200)
    
    return NextResponse.json({
      success: true,
      metricsProcessed: processedMetrics.length,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Performance monitoring error:', error)
    
    const responseTime = Date.now() - Date.now()
    captureApiCall('/api/monitoring/performance', 'POST', responseTime, 500)
    
    return NextResponse.json(
      { error: 'Failed to process performance metrics' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Return current performance metrics (mock data for now)
    const performanceData = {
      timestamp: new Date().toISOString(),
      metrics: {
        apiResponseTime: {
          average: '245ms',
          p95: '450ms',
          p99: '800ms'
        },
        pageLoadTime: {
          average: '1.2s',
          p95: '2.1s',
          p99: '3.5s'
        },
        errorRate: {
          percentage: '0.2%',
          count: 12
        },
        throughput: {
          requestsPerMinute: 1250,
          activeUsers: 45
        }
      },
      uptime: process.uptime(),
      memory: process.memoryUsage()
    }
    
    const responseTime = Date.now() - startTime
    captureApiCall('/api/monitoring/performance', 'GET', responseTime, 200)
    
    return NextResponse.json(performanceData, {
      headers: {
        'Cache-Control': 'public, max-age=60'
      }
    })
    
  } catch (error) {
    console.error('Performance metrics retrieval error:', error)
    
    const responseTime = Date.now() - Date.now()
    captureApiCall('/api/monitoring/performance', 'GET', responseTime, 500)
    
    return NextResponse.json(
      { error: 'Failed to retrieve performance metrics' },
      { status: 500 }
    )
  }
}





