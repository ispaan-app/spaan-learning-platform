import { NextRequest, NextResponse } from 'next/server'
import { performanceMonitor } from '@/lib/performance-monitoring'
import { requireSuperAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Check if user is super admin
    const authResult = await requireSuperAdmin(request)
    if (!authResult.allowed) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const stats = performanceMonitor.getStats()
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Performance stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance stats' },
      { status: 500 }
    )
  }
}

