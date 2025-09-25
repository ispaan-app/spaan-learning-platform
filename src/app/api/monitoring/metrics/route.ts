import { NextRequest, NextResponse } from 'next/server'
import { performanceMonitor } from '@/lib/performance-monitoring'
import { alertingService } from '@/lib/alerting-service'
import { backupService } from '@/lib/backup-service'
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

    // Get performance metrics
    const perfStats = performanceMonitor.getStats()
    
    // Get alert data
    const alerts = alertingService.getAlerts()
    const alertStats = alertingService.getAlertStats()
    
    // Get backup stats
    const backupStats = await backupService.getBackupStats()
    
    // Calculate system health score
    const healthScore = calculateHealthScore(perfStats, alertStats)
    
    const metrics = {
      // Performance metrics
      errorRate: perfStats.errorRate,
      avgResponseTime: perfStats.averageResponseTime,
      memoryUsage: perfStats.memoryUsage,
      cpuUsage: perfStats.cpuUsage,
      databaseErrors: 0, // Mock value since it's not in PerformanceStats
      
      // Alert metrics
      activeAlerts: alertStats.activeAlerts,
      totalAlerts: alertStats.totalAlerts,
      alertsBySeverity: alertStats.alertsBySeverity,
      
      // Backup metrics
      backupStatus: backupStats.totalBackups > 0 ? 'success' : 'unknown',
      lastBackup: backupStats.newestBackup?.toISOString() || null,
      totalBackups: backupStats.totalBackups,
      failedBackups: backupStats.failedBackups,
      
      // System metrics
      uptime: process.uptime(),
      healthScore,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      metrics,
      alerts: alerts.slice(0, 10), // Return last 10 alerts
      alertStats,
      backupStats
    })
  } catch (error) {
    console.error('Monitoring metrics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch monitoring metrics' },
      { status: 500 }
    )
  }
}

// Calculate overall system health score (0-100)
function calculateHealthScore(perfStats: any, alertStats: any): number {
  let score = 100
  
  // Deduct points for high error rate
  if (perfStats.errorRate > 0.05) score -= 30
  else if (perfStats.errorRate > 0.02) score -= 15
  else if (perfStats.errorRate > 0.01) score -= 5
  
  // Deduct points for high response time
  if (perfStats.averageResponseTime > 2000) score -= 25
  else if (perfStats.averageResponseTime > 1000) score -= 10
  else if (perfStats.averageResponseTime > 500) score -= 5
  
  // Deduct points for high memory usage
  if (perfStats.memoryUsage > 0.9) score -= 20
  else if (perfStats.memoryUsage > 0.8) score -= 10
  else if (perfStats.memoryUsage > 0.7) score -= 5
  
  // Deduct points for high CPU usage
  if (perfStats.cpuUsage > 0.8) score -= 15
  else if (perfStats.cpuUsage > 0.6) score -= 8
  else if (perfStats.cpuUsage > 0.4) score -= 3
  
  // Deduct points for database errors (mock value)
  const databaseErrors = 0
  if (databaseErrors > 0) score -= 20
  
  // Deduct points for active alerts
  if (alertStats.activeAlerts > 0) {
    score -= Math.min(alertStats.activeAlerts * 5, 30)
  }
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score))
}
