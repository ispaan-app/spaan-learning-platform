import { NextRequest, NextResponse } from 'next/server'
import { performanceManager } from '@/lib/performance-optimization-manager'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'metrics':
        return NextResponse.json({
          success: true,
          data: performanceManager.getMetrics(),
          timestamp: new Date().toISOString()
        })

      case 'health':
        return NextResponse.json({
          success: true,
          data: performanceManager.getHealthStatus(),
          timestamp: new Date().toISOString()
        })

      case 'recommendations':
        return NextResponse.json({
          success: true,
          data: performanceManager.getOptimizationRecommendations(),
          timestamp: new Date().toISOString()
        })

      case 'status':
        return NextResponse.json({
          success: true,
          data: {
            initialized: true,
            monitoring: true,
            config: performanceManager.getConfig()
          },
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({
          success: true,
          data: {
            message: 'Performance API endpoint',
            availableActions: ['metrics', 'health', 'recommendations', 'status'],
            usage: '/api/performance?action=metrics'
          },
          timestamp: new Date().toISOString()
        })
    }
  } catch (error) {
    console.error('Performance API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch performance data',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, config } = body

    switch (action) {
      case 'optimize':
        await performanceManager.forceOptimization()
        return NextResponse.json({
          success: true,
          message: 'Performance optimization completed',
          timestamp: new Date().toISOString()
        })

      case 'updateConfig':
        if (config) {
          performanceManager.updateConfig(config)
          return NextResponse.json({
            success: true,
            message: 'Configuration updated',
            timestamp: new Date().toISOString()
          })
        } else {
          return NextResponse.json({
            success: false,
            error: 'Configuration is required',
            timestamp: new Date().toISOString()
          }, { status: 400 })
        }

      case 'initialize':
        await performanceManager.initialize()
        return NextResponse.json({
          success: true,
          message: 'Performance manager initialized',
          timestamp: new Date().toISOString()
        })

      case 'destroy':
        await performanceManager.destroy()
        return NextResponse.json({
          success: true,
          message: 'Performance manager destroyed',
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          timestamp: new Date().toISOString()
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Performance API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process performance request',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
