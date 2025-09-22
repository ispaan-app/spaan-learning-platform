// Server-side only audit logger
import { adminDb } from './firebase-admin'

interface AuditLogEntry {
  id?: string
  action: string
  userId: string
  userRole: string
  targetId?: string
  targetType?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'auth' | 'data' | 'security' | 'system' | 'user_action'
}

class AuditLogger {
  private static instance: AuditLogger
  private buffer: AuditLogEntry[] = []
  private flushInterval: NodeJS.Timeout
  private readonly BUFFER_SIZE = 100
  private readonly FLUSH_INTERVAL = 30000 // 30 seconds

  private constructor() {
    // Flush buffer periodically
    this.flushInterval = setInterval(() => {
      this.flush()
    }, this.FLUSH_INTERVAL)
  }

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }

  async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const auditEntry: AuditLogEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date()
    }

    // Add to buffer
    this.buffer.push(auditEntry)

    // Flush if buffer is full
    if (this.buffer.length >= this.BUFFER_SIZE) {
      await this.flush()
    }

    // Log critical events immediately
    if (auditEntry.severity === 'critical') {
      await this.flush()
    }
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) {
      return
    }

    const entries = [...this.buffer]
    this.buffer = []

    try {
      const batch = adminDb.batch()
      
      entries.forEach(entry => {
        const docRef = adminDb.collection('audit-logs').doc(entry.id || '')
        
        // Filter out undefined values to prevent Firestore errors
        const cleanEntry = Object.fromEntries(
          Object.entries(entry).filter(([_, value]) => value !== undefined)
        )
        
        batch.set(docRef, {
          ...cleanEntry,
          timestamp: entry.timestamp
        })
      })

      await batch.commit()
      console.log(`Flushed ${entries.length} audit log entries`)
    } catch (error) {
      console.error('Failed to flush audit logs:', error)
      // Re-add entries to buffer for retry
      this.buffer.unshift(...entries)
    }
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Specific logging methods
  async logAuth(action: string, userId: string, userRole: string, details?: Record<string, any>): Promise<void> {
    await this.log({
      action,
      userId,
      userRole,
      details,
      severity: this.getAuthSeverity(action),
      category: 'auth'
    })
  }

  async logSecurity(action: string, userId: string, userRole: string, details?: Record<string, any>): Promise<void> {
    await this.log({
      action,
      userId,
      userRole,
      details,
      severity: this.getSecuritySeverity(action),
      category: 'security'
    })
  }

  async logData(action: string, userId: string, userRole: string, targetId?: string, targetType?: string, details?: Record<string, any>): Promise<void> {
    await this.log({
      action,
      userId,
      userRole,
      targetId,
      targetType,
      details,
      severity: this.getDataSeverity(action),
      category: 'data'
    })
  }

  async logUserAction(action: string, userId: string, userRole: string, details?: Record<string, any>): Promise<void> {
    await this.log({
      action,
      userId,
      userRole,
      details,
      severity: 'low',
      category: 'user_action'
    })
  }

  async logSystem(action: string, details?: Record<string, any>): Promise<void> {
    await this.log({
      action,
      userId: 'system',
      userRole: 'system',
      details,
      severity: this.getSystemSeverity(action),
      category: 'system'
    })
  }

  // Severity determination
  private getAuthSeverity(action: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalActions = ['LOGIN_FAILED_MULTIPLE', 'ACCOUNT_LOCKED', 'PASSWORD_RESET_ABUSE']
    const highActions = ['LOGIN_FAILED', 'PASSWORD_RESET', 'ACCOUNT_SUSPENDED']
    const mediumActions = ['LOGIN_SUCCESS', 'LOGOUT', 'PASSWORD_CHANGED']

    if (criticalActions.includes(action)) return 'critical'
    if (highActions.includes(action)) return 'high'
    if (mediumActions.includes(action)) return 'medium'
    return 'low'
  }

  private getSecuritySeverity(action: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalActions = ['XSS_ATTACK', 'SQL_INJECTION', 'UNAUTHORIZED_ACCESS', 'DATA_BREACH']
    const highActions = ['RATE_LIMIT_EXCEEDED', 'SUSPICIOUS_ACTIVITY', 'PRIVILEGE_ESCALATION']
    const mediumActions = ['SECURITY_HEADER_MISSING', 'WEAK_PASSWORD', 'SUSPICIOUS_LOGIN']

    if (criticalActions.includes(action)) return 'critical'
    if (highActions.includes(action)) return 'high'
    if (mediumActions.includes(action)) return 'medium'
    return 'low'
  }

  private getDataSeverity(action: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalActions = ['DATA_DELETED', 'BULK_DATA_EXPORT', 'SENSITIVE_DATA_ACCESS']
    const highActions = ['DATA_MODIFIED', 'DATA_EXPORT', 'DATA_IMPORT']
    const mediumActions = ['DATA_VIEWED', 'DATA_CREATED']

    if (criticalActions.includes(action)) return 'critical'
    if (highActions.includes(action)) return 'high'
    if (mediumActions.includes(action)) return 'medium'
    return 'low'
  }

  private getSystemSeverity(action: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalActions = ['SYSTEM_ERROR', 'DATABASE_ERROR', 'SERVICE_DOWN']
    const highActions = ['HIGH_CPU_USAGE', 'MEMORY_WARNING', 'DISK_SPACE_LOW']
    const mediumActions = ['SERVICE_RESTART', 'CONFIGURATION_CHANGE']

    if (criticalActions.includes(action)) return 'critical'
    if (highActions.includes(action)) return 'high'
    if (mediumActions.includes(action)) return 'medium'
    return 'low'
  }

  // Query methods
  async getLogs(filters: {
    userId?: string
    action?: string
    category?: string
    severity?: string
    startDate?: Date
    endDate?: Date
    limit?: number
  } = {}): Promise<AuditLogEntry[]> {
    try {
      let query = adminDb.collection('audit-logs').orderBy('timestamp', 'desc')

      if (filters.userId) {
        query = query.where('userId', '==', filters.userId)
      }

      if (filters.action) {
        query = query.where('action', '==', filters.action)
      }

      if (filters.category) {
        query = query.where('category', '==', filters.category)
      }

      if (filters.severity) {
        query = query.where('severity', '==', filters.severity)
      }

      if (filters.startDate) {
        query = query.where('timestamp', '>=', filters.startDate)
      }

      if (filters.endDate) {
        query = query.where('timestamp', '<=', filters.endDate)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const snapshot = await query.get()
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuditLogEntry[]
    } catch (error) {
      console.error('Failed to query audit logs:', error)
      return []
    }
  }

  async getSecurityEvents(limit: number = 50): Promise<AuditLogEntry[]> {
    return this.getLogs({
      category: 'security',
      limit
    })
  }

  async getUserActivity(userId: string, limit: number = 100): Promise<AuditLogEntry[]> {
    return this.getLogs({
      userId,
      limit
    })
  }

  // Cleanup old logs
  async cleanupOldLogs(daysToKeep: number = 90): Promise<void> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const oldLogs = await adminDb
        .collection('audit-logs')
        .where('timestamp', '<', cutoffDate)
        .get()

      if (oldLogs.empty) {
        return
      }

      const batch = adminDb.batch()
      oldLogs.docs.forEach(doc => {
        batch.delete(doc.ref)
      })

      await batch.commit()
      console.log(`Cleaned up ${oldLogs.docs.length} old audit log entries`)
    } catch (error) {
      console.error('Failed to cleanup old audit logs:', error)
    }
  }

  // Get audit statistics
  async getStats(days: number = 30): Promise<{
    totalLogs: number
    byCategory: Record<string, number>
    bySeverity: Record<string, number>
    byAction: Record<string, number>
    topUsers: Array<{ userId: string; count: number }>
  }> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const logs = await this.getLogs({
        startDate,
        limit: 10000
      })

      const stats = {
        totalLogs: logs.length,
        byCategory: {} as Record<string, number>,
        bySeverity: {} as Record<string, number>,
        byAction: {} as Record<string, number>,
        topUsers: [] as Array<{ userId: string; count: number }>
      }

      const userCounts: Record<string, number> = {}

      logs.forEach(log => {
        // Category stats
        stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1

        // Severity stats
        stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1

        // Action stats
        stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1

        // User stats
        if (log.userId !== 'system') {
          userCounts[log.userId] = (userCounts[log.userId] || 0) + 1
        }
      })

      // Top users
      stats.topUsers = Object.entries(userCounts)
        .map(([userId, count]) => ({ userId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      return stats
    } catch (error) {
      console.error('Failed to get audit stats:', error)
      return {
        totalLogs: 0,
        byCategory: {},
        bySeverity: {},
        byAction: {},
        topUsers: []
      }
    }
  }

  // Force flush and cleanup
  async destroy(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    await this.flush()
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance()

// Convenience functions
export async function logAuth(action: string, userId: string, userRole: string, details?: Record<string, any>) {
  return auditLogger.logAuth(action, userId, userRole, details)
}

export async function logSecurity(action: string, userId: string, userRole: string, details?: Record<string, any>) {
  return auditLogger.logSecurity(action, userId, userRole, details)
}

export async function logData(action: string, userId: string, userRole: string, targetId?: string, targetType?: string, details?: Record<string, any>) {
  return auditLogger.logData(action, userId, userRole, targetId, targetType, details)
}

export async function logUserAction(action: string, userId: string, userRole: string, details?: Record<string, any>) {
  return auditLogger.logUserAction(action, userId, userRole, details)
}

export async function logSystem(action: string, details?: Record<string, any>) {
  return auditLogger.logSystem(action, details)
}
