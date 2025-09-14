import { NextRequest, NextResponse } from 'next/server'
import { auditLogger } from '@/lib/auditLogger'
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

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '24h'

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (range) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }

    // Get security stats
    const stats = await auditLogger.getStats(30) // Get last 30 days of data

    // Get recent security events
    const recentEvents = await auditLogger.getSecurityEvents(20)

    // Calculate additional stats
    const totalEvents = stats.totalLogs
    const criticalEvents = stats.bySeverity.critical || 0
    const highEvents = stats.bySeverity.high || 0
    const mediumEvents = stats.bySeverity.medium || 0
    const lowEvents = stats.bySeverity.low || 0

    const response = {
      totalEvents,
      criticalEvents,
      highEvents,
      mediumEvents,
      lowEvents,
      byCategory: stats.byCategory,
      bySeverity: stats.bySeverity,
      topUsers: stats.topUsers,
      recentEvents: recentEvents.map(event => ({
        id: event.id,
        action: event.action,
        userId: event.userId,
        userRole: event.userRole,
        severity: event.severity,
        category: event.category,
        details: event.details,
        timestamp: event.timestamp.toISOString()
      }))
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Security stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch security stats' },
      { status: 500 }
    )
  }
}

