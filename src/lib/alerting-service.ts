import { performanceMonitor } from './performance-monitoring'
import { emailService } from './email-service'
import { smsService } from './sms-service'
import { notificationService } from './notification-service'

interface AlertRule {
  id: string
  name: string
  condition: (metrics: any) => boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  channels: ('email' | 'sms' | 'push' | 'webhook')[]
  cooldown: number // minutes
  enabled: boolean
}

interface Alert {
  id: string
  ruleId: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date
  resolved: boolean
  resolvedAt?: Date
  metadata: any
}

class AlertingService {
  private static instance: AlertingService
  private alerts: Map<string, Alert> = new Map()
  private alertRules: Map<string, AlertRule> = new Map()
  private lastAlertTimes: Map<string, Date> = new Map()
  private isMonitoring = false

  private constructor() {
    this.initializeDefaultRules()
  }

  static getInstance(): AlertingService {
    if (!AlertingService.instance) {
      AlertingService.instance = new AlertingService()
    }
    return AlertingService.instance
  }

  // Initialize default alert rules
  private initializeDefaultRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'high_error_rate',
        name: 'High Error Rate',
        condition: (metrics) => metrics.errorRate > 0.05, // 5% error rate
        severity: 'high',
        channels: ['email', 'push'],
        cooldown: 15,
        enabled: true
      },
      {
        id: 'high_response_time',
        name: 'High Response Time',
        condition: (metrics) => metrics.avgResponseTime > 2000, // 2 seconds
        severity: 'medium',
        channels: ['email'],
        cooldown: 30,
        enabled: true
      },
      {
        id: 'low_memory',
        name: 'Low Memory',
        condition: (metrics) => metrics.memoryUsage > 0.9, // 90% memory usage
        severity: 'critical',
        channels: ['email', 'sms', 'push'],
        cooldown: 5,
        enabled: true
      },
      {
        id: 'high_cpu',
        name: 'High CPU Usage',
        condition: (metrics) => metrics.cpuUsage > 0.8, // 80% CPU usage
        severity: 'high',
        channels: ['email', 'push'],
        cooldown: 10,
        enabled: true
      },
      {
        id: 'database_connection_failed',
        name: 'Database Connection Failed',
        condition: (metrics) => metrics.databaseErrors > 0,
        severity: 'critical',
        channels: ['email', 'sms', 'push'],
        cooldown: 0,
        enabled: true
      },
      {
        id: 'backup_failed',
        name: 'Backup Failed',
        condition: (metrics) => metrics.backupStatus === 'failed',
        severity: 'high',
        channels: ['email', 'push'],
        cooldown: 60,
        enabled: true
      }
    ]

    defaultRules.forEach(rule => {
      this.alertRules.set(rule.id, rule)
    })
  }

  // Start monitoring
  startMonitoring(): void {
    if (this.isMonitoring) {
      console.log('Alerting service is already monitoring')
      return
    }

    this.isMonitoring = true
    
    // Check alerts every 30 seconds
    setInterval(() => {
      this.checkAlerts()
    }, 30000)

    console.log('Alerting service started monitoring')
  }

  // Stop monitoring
  stopMonitoring(): void {
    this.isMonitoring = false
    console.log('Alerting service stopped monitoring')
  }

  // Check all alert rules
  private async checkAlerts(): Promise<void> {
    try {
      const metrics = await this.getCurrentMetrics()
      
      for (const [ruleId, rule] of Array.from(this.alertRules.entries())) {
        if (!rule.enabled) continue

        // Check cooldown
        const lastAlertTime = this.lastAlertTimes.get(ruleId)
        if (lastAlertTime) {
          const timeSinceLastAlert = Date.now() - lastAlertTime.getTime()
          if (timeSinceLastAlert < rule.cooldown * 60 * 1000) {
            continue
          }
        }

        // Check condition
        if (rule.condition(metrics)) {
          await this.triggerAlert(rule, metrics)
        }
      }
    } catch (error) {
      console.error('Error checking alerts:', error)
    }
  }

  // Get current system metrics
  private async getCurrentMetrics(): Promise<any> {
    const perfStats = performanceMonitor.getStats()
    
    return {
      errorRate: perfStats.errorRate,
      avgResponseTime: perfStats.averageResponseTime,
      memoryUsage: perfStats.memoryUsage,
      cpuUsage: perfStats.cpuUsage,
      databaseErrors: 0, // Mock value since it's not in PerformanceStats
      backupStatus: 'success', // This would come from backup service
      timestamp: new Date()
    }
  }

  // Trigger an alert
  private async triggerAlert(rule: AlertRule, metrics: any): Promise<void> {
    const alertId = `alert_${Date.now()}_${rule.id}`
    const alert: Alert = {
      id: alertId,
      ruleId: rule.id,
      message: `${rule.name}: ${this.formatAlertMessage(rule, metrics)}`,
      severity: rule.severity,
      timestamp: new Date(),
      resolved: false,
      metadata: metrics
    }

    this.alerts.set(alertId, alert)
    this.lastAlertTimes.set(rule.id, new Date())

    console.log(`Alert triggered: ${alert.message}`)

    // Send alerts through configured channels
    for (const channel of rule.channels) {
      try {
        await this.sendAlert(alert, channel)
      } catch (error) {
        console.error(`Failed to send alert through ${channel}:`, error)
      }
    }
  }

  // Send alert through specific channel
  private async sendAlert(alert: Alert, channel: string): Promise<void> {
    const message = alert.message
    const recipients = this.getAlertRecipients(alert.severity)

    switch (channel) {
      case 'email':
        await emailService.sendEmail({
          to: recipients.email,
          subject: `[${alert.severity.toUpperCase()}] ${alert.message}`,
          body: this.formatEmailAlert(alert)
        })
        break

      case 'sms':
        if (recipients.sms) {
          await smsService.sendSMS({
            to: recipients.sms,
            message: message
          })
        }
        break

      case 'push':
        // Send push notification to all users
        await notificationService.sendMultiChannelNotification(
          'system',
          'System Alert',
          alert.message,
          {
            type: 'error',
            category: 'system',
            priority: alert.severity === 'critical' ? 'urgent' : 'high',
            actionUrl: '/admin/monitoring',
            actionText: 'View Details'
          }
        )
        break

      case 'webhook':
        await this.sendWebhookAlert(alert)
        break
    }
  }

  // Get alert recipients based on severity
  private getAlertRecipients(severity: string): { email: string; sms?: string } {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ispaan.co.za'
    const adminSms = process.env.ADMIN_SMS

    return {
      email: adminEmail,
      sms: adminSms
    }
  }

  // Format alert message
  private formatAlertMessage(rule: AlertRule, metrics?: any): string {
    const timestamp = new Date().toISOString()
    
    switch (rule.id) {
      case 'high_error_rate':
        return `Error rate is ${(metrics?.errorRate * 100).toFixed(2)}% (threshold: 5%)`
      case 'high_response_time':
        return `Average response time is ${metrics?.avgResponseTime}ms (threshold: 2000ms)`
      case 'low_memory':
        return `Memory usage is ${(metrics?.memoryUsage * 100).toFixed(2)}% (threshold: 90%)`
      case 'high_cpu':
        return `CPU usage is ${(metrics?.cpuUsage * 100).toFixed(2)}% (threshold: 80%)`
      case 'database_connection_failed':
        return `Database connection failed ${metrics?.databaseErrors} times`
      case 'backup_failed':
        return `Backup process failed`
      default:
        return `Alert condition met for ${rule.name}`
    }
  }

  // Format email alert
  private formatEmailAlert(alert: Alert): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${this.getSeverityColor(alert.severity)};">
          🚨 System Alert - ${alert.severity.toUpperCase()}
        </h2>
        <p><strong>Alert:</strong> ${alert.message}</p>
        <p><strong>Time:</strong> ${alert.timestamp.toISOString()}</p>
        <p><strong>Rule:</strong> ${alert.ruleId}</p>
        
        <h3>System Metrics:</h3>
        <ul>
          <li>Error Rate: ${(alert.metadata?.errorRate * 100 || 0).toFixed(2)}%</li>
          <li>Avg Response Time: ${alert.metadata?.avgResponseTime || 0}ms</li>
          <li>Memory Usage: ${(alert.metadata?.memoryUsage * 100 || 0).toFixed(2)}%</li>
          <li>CPU Usage: ${(alert.metadata?.cpuUsage * 100 || 0).toFixed(2)}%</li>
        </ul>
        
        <p style="color: #666; font-size: 12px;">
          This is an automated alert from the iSpaan monitoring system.
        </p>
      </div>
    `
  }

  // Get severity color
  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'low': return '#28a745'
      case 'medium': return '#ffc107'
      case 'high': return '#fd7e14'
      case 'critical': return '#dc3545'
      default: return '#6c757d'
    }
  }

  // Send webhook alert
  private async sendWebhookAlert(alert: Alert): Promise<void> {
    const webhookUrl = process.env.ALERT_WEBHOOK_URL
    if (!webhookUrl) return

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `🚨 ${alert.severity.toUpperCase()}: ${alert.message}`,
          attachments: [{
            color: this.getSeverityColor(alert.severity),
            fields: [
              { title: 'Alert', value: alert.message, short: false },
              { title: 'Time', value: alert.timestamp.toISOString(), short: true },
              { title: 'Severity', value: alert.severity, short: true }
            ]
          }]
        })
      })
    } catch (error) {
      console.error('Webhook alert failed:', error)
    }
  }

  // Resolve an alert
  resolveAlert(alertId: string): void {
    const alert = this.alerts.get(alertId)
    if (alert) {
      alert.resolved = true
      alert.resolvedAt = new Date()
      console.log(`Alert resolved: ${alertId}`)
    }
  }

  // Get all alerts
  getAlerts(): Alert[] {
    return Array.from(this.alerts.values()).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    )
  }

  // Get active alerts
  getActiveAlerts(): Alert[] {
    return this.getAlerts().filter(alert => !alert.resolved)
  }

  // Add custom alert rule
  addAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule)
    console.log(`Alert rule added: ${rule.name}`)
  }

  // Remove alert rule
  removeAlertRule(ruleId: string): void {
    this.alertRules.delete(ruleId)
    console.log(`Alert rule removed: ${ruleId}`)
  }

  // Get alert statistics
  getAlertStats(): {
    totalAlerts: number
    activeAlerts: number
    alertsBySeverity: Record<string, number>
    averageResolutionTime: number
  } {
    const alerts = this.getAlerts()
    const activeAlerts = alerts.filter(alert => !alert.resolved)
    
    const alertsBySeverity = alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const resolvedAlerts = alerts.filter(alert => alert.resolved && alert.resolvedAt)
    const averageResolutionTime = resolvedAlerts.length > 0
      ? resolvedAlerts.reduce((sum, alert) => {
          const resolutionTime = alert.resolvedAt!.getTime() - alert.timestamp.getTime()
          return sum + resolutionTime
        }, 0) / resolvedAlerts.length
      : 0

    return {
      totalAlerts: alerts.length,
      activeAlerts: activeAlerts.length,
      alertsBySeverity,
      averageResolutionTime
    }
  }
}

// Export singleton instance
export const alertingService = AlertingService.getInstance()

// Auto-start monitoring if enabled
if (process.env.ALERTING_ENABLED === 'true') {
  alertingService.startMonitoring()
}

// Export types
export type { AlertRule, Alert }
