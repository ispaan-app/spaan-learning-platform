import { NextRequest, NextResponse } from 'next/server'
import { apiPerformanceMonitor } from '@/lib/performance-monitoring'
import { requireSuperAdmin } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

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

    const apiStats = apiPerformanceMonitor.getApiStats()
    
    return NextResponse.json(apiStats)
  } catch (error) {
    console.error('API stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch API stats' },
      { status: 500 }
    )
  }
}

