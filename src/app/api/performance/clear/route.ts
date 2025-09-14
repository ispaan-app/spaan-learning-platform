import { NextRequest, NextResponse } from 'next/server'
import { performanceMonitor, apiPerformanceMonitor } from '@/lib/performance-monitoring'
import { requireSuperAdmin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Check if user is super admin
    const authResult = await requireSuperAdmin(request)
    if (!authResult.allowed) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Clear all performance data
    performanceMonitor.clearMetrics()
    apiPerformanceMonitor.clearApiMetrics()
    
    return NextResponse.json({ success: true, message: 'Performance data cleared' })
  } catch (error) {
    console.error('Clear performance data error:', error)
    return NextResponse.json(
      { error: 'Failed to clear performance data' },
      { status: 500 }
    )
  }
}

