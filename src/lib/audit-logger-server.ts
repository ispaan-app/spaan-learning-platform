// Server-side only audit logger
import { adminDb } from '@/lib/firebase-admin'

interface AuditLogEntry {
  id?: string
  action: string
  userId: string
  userRole: string
  timestamp: Date
  details?: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
  ip?: string
  userAgent?: string
}

class ServerAuditLogger {
  private static instance: ServerAuditLogger
  private logQueue: AuditLogEntry[] = []
  private readonly BATCH_SIZE = 10
  private readonly FLUSH_INTERVAL = 5000 // 5 seconds

  private constructor() {
    // Start periodic flush
    setInterval(() => {
      this.flushLogs()
    }, this.FLUSH_INTERVAL)
  }

  static getInstance(): ServerAuditLogger {
    if (!ServerAuditLogger.instance) {
      ServerAuditLogger.instance = new ServerAuditLogger()
    }
    return ServerAuditLogger.instance
  }

  async logAuth(action: string, userId: string, userRole: string, details?: Record<string, any>): Promise<void> {
    await this.log({
      action,
      userId,
      userRole,
      timestamp: new Date(),
      details,
      severity: 'medium'
    })
  }

  async logSecurity(action: string, userId: string, userRole: string, details?: Record<string, any>): Promise<void> {
    await this.log({
      action,
      userId,
      userRole,
      timestamp: new Date(),
      details,
      severity: 'high'
    })
  }

  async logData(action: string, userId: string, userRole: string, details?: Record<string, any>): Promise<void> {
    await this.log({
      action,
      userId,
      userRole,
      timestamp: new Date(),
      details,
      severity: 'low'
    })
  }

  async logSystem(action: string, userId: string, userRole: string, details?: Record<string, any>): Promise<void> {
    await this.log({
      action,
      userId,
      userRole,
      timestamp: new Date(),
      details,
      severity: 'medium'
    })
  }

  async logUserAction(action: string, userId: string, userRole: string, details?: Record<string, any>): Promise<void> {
    await this.log({
      action,
      userId,
      userRole,
      timestamp: new Date(),
      details,
      severity: 'low'
    })
  }

  private async log(entry: AuditLogEntry): Promise<void> {
    try {
      this.logQueue.push(entry)

      // Flush if queue is full
      if (this.logQueue.length >= this.BATCH_SIZE) {
        await this.flushLogs()
      }
    } catch (error) {
      console.error('Audit logging error:', error)
    }
  }

  private async flushLogs(): Promise<void> {
    if (this.logQueue.length === 0) return

    try {
      const logsToFlush = [...this.logQueue]
      this.logQueue = []

      // Batch write to Firestore
      const batch = adminDb.batch()
      
      logsToFlush.forEach(log => {
        const docRef = adminDb.collection('audit-logs').doc()
        batch.set(docRef, {
          ...log,
          id: docRef.id
        })
      })

      await batch.commit()
    } catch (error) {
      console.error('Failed to flush audit logs:', error)
      // Re-queue logs for retry
      this.logQueue.unshift(...this.logQueue)
    }
  }

  async getLogs(filters?: {
    userId?: string
    action?: string
    severity?: string
    startDate?: Date
    endDate?: Date
    limit?: number
  }): Promise<AuditLogEntry[]> {
    try {
      let query = adminDb.collection('audit-logs').orderBy('timestamp', 'desc')

      if (filters?.userId) {
        query = query.where('userId', '==', filters.userId)
      }

      if (filters?.action) {
        query = query.where('action', '==', filters.action)
      }

      if (filters?.severity) {
        query = query.where('severity', '==', filters.severity)
      }

      if (filters?.startDate) {
        query = query.where('timestamp', '>=', filters.startDate)
      }

      if (filters?.endDate) {
        query = query.where('timestamp', '<=', filters.endDate)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const snapshot = await query.get()
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AuditLogEntry))
    } catch (error) {
      console.error('Failed to get audit logs:', error)
      return []
    }
  }

  async getRecentLogs(limit: number = 50): Promise<AuditLogEntry[]> {
    return this.getLogs({ limit })
  }

  async getLogsByUser(userId: string, limit: number = 50): Promise<AuditLogEntry[]> {
    return this.getLogs({ userId, limit })
  }

  async getSecurityLogs(limit: number = 50): Promise<AuditLogEntry[]> {
    return this.getLogs({ severity: 'high', limit })
  }

  // Force flush remaining logs
  async flush(): Promise<void> {
    await this.flushLogs()
  }
}

// Export singleton instance
export const serverAuditLogger = ServerAuditLogger.getInstance()

// Export types
export type { AuditLogEntry }

