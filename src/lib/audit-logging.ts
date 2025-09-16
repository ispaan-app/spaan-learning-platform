// Comprehensive audit logging system for compliance and security

export interface AuditLogEntry {
  id: string
  timestamp: Date
  userId?: string
  sessionId?: string
  action: AuditAction
  resource: string
  resourceId: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  location?: {
    country: string
    region: string
    city: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  severity: AuditSeverity
  category: AuditCategory
  description: string
  metadata?: Record<string, any>
  tags: string[]
  compliance: ComplianceInfo
  retention: RetentionInfo
}

export type AuditAction = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'login' 
  | 'logout' 
  | 'failed_login' 
  | 'password_change' 
  | 'permission_change' 
  | 'data_export' 
  | 'data_import' 
  | 'backup' 
  | 'restore' 
  | 'system_config' 
  | 'security_event' 
  | 'compliance_event'

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical'

export type AuditCategory = 
  | 'authentication' 
  | 'authorization' 
  | 'data_access' 
  | 'data_modification' 
  | 'system_administration' 
  | 'security' 
  | 'compliance' 
  | 'business_process' 
  | 'user_activity' 
  | 'system_event'

export interface ComplianceInfo {
  gdpr: boolean
  ccpa: boolean
  hipaa: boolean
  sox: boolean
  pci: boolean
  iso27001: boolean
  custom: Record<string, boolean>
}

export interface RetentionInfo {
  retentionPeriod: number // in days
  autoDelete: boolean
  archiveAfter: number // in days
  legalHold: boolean
  encryptionRequired: boolean
}

export interface AuditLogQuery {
  userId?: string
  action?: AuditAction
  category?: AuditCategory
  severity?: AuditSeverity
  resource?: string
  resourceId?: string
  startDate?: Date
  endDate?: Date
  ipAddress?: string
  tags?: string[]
  compliance?: Partial<ComplianceInfo>
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface AuditLogStats {
  totalLogs: number
  logsByAction: Record<AuditAction, number>
  logsByCategory: Record<AuditCategory, number>
  logsBySeverity: Record<AuditSeverity, number>
  logsByUser: Record<string, number>
  logsByResource: Record<string, number>
  logsByDay: Record<string, number>
  complianceStats: {
    gdpr: number
    ccpa: number
    hipaa: number
    sox: number
    pci: number
    iso27001: number
  }
  topUsers: Array<{ userId: string; count: number }>
  topResources: Array<{ resource: string; count: number }>
  topActions: Array<{ action: AuditAction; count: number }>
}

export interface AuditLogReport {
  id: string
  name: string
  description: string
  query: AuditLogQuery
  generatedAt: Date
  generatedBy: string
  format: 'json' | 'csv' | 'pdf' | 'xlsx'
  status: 'pending' | 'generating' | 'completed' | 'failed'
  filePath?: string
  fileSize?: number
  expiresAt?: Date
}

class AuditLogger {
  private static instance: AuditLogger
  private logs: Map<string, AuditLogEntry> = new Map()
  private config: AuditConfig
  private retentionPolicies: Map<string, RetentionPolicy> = new Map()
  private complianceRules: Map<string, ComplianceRule> = new Map()

  constructor() {
    this.config = {
      enabled: true,
      logLevel: 'medium',
      maxLogSize: 1000000, // 1MB
      maxLogs: 1000000,
      batchSize: 100,
      flushInterval: 5000, // 5 seconds
      encryption: true,
      compression: true,
      realTimeAlerts: true,
      complianceMode: true
    }
    
    this.initializeRetentionPolicies()
    this.initializeComplianceRules()
  }

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }

  private initializeRetentionPolicies(): void {
    // GDPR: 6 years for employment records, 3 years for other data
    this.retentionPolicies.set('gdpr', {
      name: 'GDPR',
      retentionPeriod: 2190, // 6 years
      autoDelete: true,
      archiveAfter: 1095, // 3 years
      legalHold: false,
      encryptionRequired: true
    })

    // CCPA: 12 months for personal information
    this.retentionPolicies.set('ccpa', {
      name: 'CCPA',
      retentionPeriod: 365, // 1 year
      autoDelete: true,
      archiveAfter: 180, // 6 months
      legalHold: false,
      encryptionRequired: true
    })

    // HIPAA: 6 years for patient records
    this.retentionPolicies.set('hipaa', {
      name: 'HIPAA',
      retentionPeriod: 2190, // 6 years
      autoDelete: true,
      archiveAfter: 1095, // 3 years
      legalHold: false,
      encryptionRequired: true
    })

    // SOX: 7 years for financial records
    this.retentionPolicies.set('sox', {
      name: 'SOX',
      retentionPeriod: 2555, // 7 years
      autoDelete: true,
      archiveAfter: 1825, // 5 years
      legalHold: false,
      encryptionRequired: true
    })
  }

  private initializeComplianceRules(): void {
    // GDPR rules
    this.complianceRules.set('gdpr_data_access', {
      name: 'GDPR Data Access',
      description: 'Log all data access for GDPR compliance',
      conditions: {
        action: ['read', 'update', 'delete'],
        resource: ['user', 'application', 'learner', 'placement']
      },
      requirements: {
        logDataAccess: true,
        logDataPurpose: true,
        logDataRetention: true,
        logDataSharing: true
      }
    })

    // HIPAA rules
    this.complianceRules.set('hipaa_phi_access', {
      name: 'HIPAA PHI Access',
      description: 'Log all PHI access for HIPAA compliance',
      conditions: {
        action: ['read', 'update', 'delete'],
        resource: ['learner', 'placement', 'document']
      },
      requirements: {
        logDataAccess: true,
        logDataPurpose: true,
        logDataRetention: true,
        logDataSharing: true,
        logDataDisclosure: true
      }
    })
  }

  async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'compliance' | 'retention'>): Promise<void> {
    if (!this.config.enabled) return

    const auditEntry: AuditLogEntry = {
      ...entry,
      id: this.generateLogId(),
      timestamp: new Date(),
      compliance: this.determineCompliance(entry),
      retention: this.determineRetention(entry)
    }

    // Validate log entry
    this.validateLogEntry(auditEntry)

    // Store log entry
    this.logs.set(auditEntry.id, auditEntry)

    // Check for compliance violations
    await this.checkComplianceViolations(auditEntry)

    // Send real-time alerts if needed
    if (this.config.realTimeAlerts) {
      await this.sendRealTimeAlert(auditEntry)
    }

    // Check if we need to flush logs
    if (this.logs.size >= this.config.batchSize) {
      await this.flushLogs()
    }

    // Check retention policies
    await this.checkRetentionPolicies()
  }

  async queryLogs(query: AuditLogQuery): Promise<AuditLogEntry[]> {
    let results = Array.from(this.logs.values())

    // Apply filters
    if (query.userId) {
      results = results.filter(log => log.userId === query.userId)
    }

    if (query.action) {
      results = results.filter(log => log.action === query.action)
    }

    if (query.category) {
      results = results.filter(log => log.category === query.category)
    }

    if (query.severity) {
      results = results.filter(log => log.severity === query.severity)
    }

    if (query.resource) {
      results = results.filter(log => log.resource === query.resource)
    }

    if (query.resourceId) {
      results = results.filter(log => log.resourceId === query.resourceId)
    }

    if (query.startDate) {
      results = results.filter(log => log.timestamp >= query.startDate!)
    }

    if (query.endDate) {
      results = results.filter(log => log.timestamp <= query.endDate!)
    }

    if (query.ipAddress) {
      results = results.filter(log => log.ipAddress === query.ipAddress)
    }

    if (query.tags && query.tags.length > 0) {
      results = results.filter(log => 
        query.tags!.some(tag => log.tags.includes(tag))
      )
    }

    if (query.compliance) {
      results = results.filter(log => 
        Object.entries(query.compliance!).every(([key, value]) => 
          log.compliance[key as keyof ComplianceInfo] === value
        )
      )
    }

    // Apply sorting
    if (query.sortBy) {
      results.sort((a, b) => {
        const aValue = (a as any)[query.sortBy!]
        const bValue = (b as any)[query.sortBy!]
        
        if (aValue < bValue) return query.sortOrder === 'asc' ? -1 : 1
        if (aValue > bValue) return query.sortOrder === 'asc' ? 1 : -1
        return 0
      })
    }

    // Apply pagination
    if (query.offset) {
      results = results.slice(query.offset)
    }

    if (query.limit) {
      results = results.slice(0, query.limit)
    }

    return results
  }

  async getStats(): Promise<AuditLogStats> {
    const logs = Array.from(this.logs.values())
    
    const stats: AuditLogStats = {
      totalLogs: logs.length,
      logsByAction: {} as Record<AuditAction, number>,
      logsByCategory: {} as Record<AuditCategory, number>,
      logsBySeverity: {} as Record<AuditSeverity, number>,
      logsByUser: {},
      logsByResource: {},
      logsByDay: {},
      complianceStats: {
        gdpr: 0,
        ccpa: 0,
        hipaa: 0,
        sox: 0,
        pci: 0,
        iso27001: 0
      },
      topUsers: [],
      topResources: [],
      topActions: []
    }

    // Count by action
    for (const log of logs) {
      stats.logsByAction[log.action] = (stats.logsByAction[log.action] || 0) + 1
    }

    // Count by category
    for (const log of logs) {
      stats.logsByCategory[log.category] = (stats.logsByCategory[log.category] || 0) + 1
    }

    // Count by severity
    for (const log of logs) {
      stats.logsBySeverity[log.severity] = (stats.logsBySeverity[log.severity] || 0) + 1
    }

    // Count by user
    for (const log of logs) {
      if (log.userId) {
        stats.logsByUser[log.userId] = (stats.logsByUser[log.userId] || 0) + 1
      }
    }

    // Count by resource
    for (const log of logs) {
      stats.logsByResource[log.resource] = (stats.logsByResource[log.resource] || 0) + 1
    }

    // Count by day
    for (const log of logs) {
      const day = log.timestamp.toISOString().split('T')[0]
      stats.logsByDay[day] = (stats.logsByDay[day] || 0) + 1
    }

    // Compliance stats
    for (const log of logs) {
      if (log.compliance.gdpr) stats.complianceStats.gdpr++
      if (log.compliance.ccpa) stats.complianceStats.ccpa++
      if (log.compliance.hipaa) stats.complianceStats.hipaa++
      if (log.compliance.sox) stats.complianceStats.sox++
      if (log.compliance.pci) stats.complianceStats.pci++
      if (log.compliance.iso27001) stats.complianceStats.iso27001++
    }

    // Top users
    stats.topUsers = Object.entries(stats.logsByUser)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Top resources
    stats.topResources = Object.entries(stats.logsByResource)
      .map(([resource, count]) => ({ resource, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Top actions
    stats.topActions = Object.entries(stats.logsByAction)
      .map(([action, count]) => ({ action: action as AuditAction, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return stats
  }

  async generateReport(query: AuditLogQuery, format: 'json' | 'csv' | 'pdf' | 'xlsx'): Promise<AuditLogReport> {
    const reportId = this.generateReportId()
    const report: AuditLogReport = {
      id: reportId,
      name: `Audit Report ${new Date().toISOString()}`,
      description: 'Generated audit log report',
      query,
      generatedAt: new Date(),
      generatedBy: 'system',
      format,
      status: 'generating'
    }

    try {
      const logs = await this.queryLogs(query)
      
      // Generate report based on format
      switch (format) {
        case 'json':
          report.filePath = await this.generateJSONReport(logs, reportId)
          break
        case 'csv':
          report.filePath = await this.generateCSVReport(logs, reportId)
          break
        case 'pdf':
          report.filePath = await this.generatePDFReport(logs, reportId)
          break
        case 'xlsx':
          report.filePath = await this.generateXLSXReport(logs, reportId)
          break
      }

      report.status = 'completed'
      report.fileSize = await this.getFileSize(report.filePath!)
      report.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

      return report
    } catch (error) {
      report.status = 'failed'
      throw error
    }
  }

  private generateLogId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private determineCompliance(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'compliance' | 'retention'>): ComplianceInfo {
    const compliance: ComplianceInfo = {
      gdpr: false,
      ccpa: false,
      hipaa: false,
      sox: false,
      pci: false,
      iso27001: false,
      custom: {}
    }

    // Check GDPR compliance
    if (entry.resource === 'user' || entry.resource === 'application' || entry.resource === 'learner') {
      compliance.gdpr = true
    }

    // Check HIPAA compliance
    if (entry.resource === 'learner' || entry.resource === 'placement' || entry.resource === 'document') {
      compliance.hipaa = true
    }

    // Check SOX compliance
    if (entry.resource === 'application' || entry.resource === 'placement' || entry.category === 'system_administration') {
      compliance.sox = true
    }

    return compliance
  }

  private determineRetention(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'compliance' | 'retention'>): RetentionInfo {
    // Default retention policy
    let retentionPeriod = 365 // 1 year
    let autoDelete = true
    let archiveAfter = 180 // 6 months
    let legalHold = false
    let encryptionRequired = true

    // Apply compliance-specific retention policies
    if (entry.resource === 'user' || entry.resource === 'learner') {
      retentionPeriod = 2190 // 6 years for GDPR
    }

    if (entry.resource === 'placement' || entry.resource === 'document') {
      retentionPeriod = 2190 // 6 years for HIPAA
    }

    if (entry.category === 'system_administration') {
      retentionPeriod = 2555 // 7 years for SOX
    }

    return {
      retentionPeriod,
      autoDelete,
      archiveAfter,
      legalHold,
      encryptionRequired
    }
  }

  private validateLogEntry(entry: AuditLogEntry): void {
    if (!entry.action) {
      throw new Error('Audit log entry must have an action')
    }

    if (!entry.resource) {
      throw new Error('Audit log entry must have a resource')
    }

    if (!entry.resourceId) {
      throw new Error('Audit log entry must have a resource ID')
    }

    if (!entry.description) {
      throw new Error('Audit log entry must have a description')
    }
  }

  private async checkComplianceViolations(entry: AuditLogEntry): Promise<void> {
    // Check for suspicious activities
    if (entry.action === 'failed_login' && entry.severity === 'high') {
      await this.alertSecurityTeam(entry, 'Multiple failed login attempts')
    }

    if (entry.action === 'delete' && entry.severity === 'critical') {
      await this.alertSecurityTeam(entry, 'Critical data deletion')
    }

    if (entry.action === 'permission_change' && entry.severity === 'high') {
      await this.alertSecurityTeam(entry, 'High-privilege permission change')
    }
  }

  private async sendRealTimeAlert(entry: AuditLogEntry): Promise<void> {
    if (entry.severity === 'critical') {
      // Send immediate alert for critical events
      console.log(`CRITICAL ALERT: ${entry.description}`, entry)
    }
  }

  private async flushLogs(): Promise<void> {
    // In a real implementation, this would flush logs to persistent storage
    console.log(`Flushing ${this.logs.size} audit logs`)
    this.logs.clear()
  }

  private async checkRetentionPolicies(): Promise<void> {
    const now = new Date()
    const logsToDelete: string[] = []

    for (const [id, log] of Array.from(this.logs.entries())) {
      const ageInDays = (now.getTime() - log.timestamp.getTime()) / (1000 * 60 * 60 * 24)
      
      if (ageInDays > log.retention.retentionPeriod && log.retention.autoDelete) {
        logsToDelete.push(id)
      }
    }

    for (const id of logsToDelete) {
      this.logs.delete(id)
    }

    if (logsToDelete.length > 0) {
      console.log(`Deleted ${logsToDelete.length} expired audit logs`)
    }
  }

  private async generateJSONReport(logs: AuditLogEntry[], reportId: string): Promise<string> {
    const filePath = `./reports/audit_${reportId}.json`
    // In a real implementation, this would write the JSON file
    console.log(`Generating JSON report: ${filePath}`)
    return filePath
  }

  private async generateCSVReport(logs: AuditLogEntry[], reportId: string): Promise<string> {
    const filePath = `./reports/audit_${reportId}.csv`
    // In a real implementation, this would write the CSV file
    console.log(`Generating CSV report: ${filePath}`)
    return filePath
  }

  private async generatePDFReport(logs: AuditLogEntry[], reportId: string): Promise<string> {
    const filePath = `./reports/audit_${reportId}.pdf`
    // In a real implementation, this would generate a PDF report
    console.log(`Generating PDF report: ${filePath}`)
    return filePath
  }

  private async generateXLSXReport(logs: AuditLogEntry[], reportId: string): Promise<string> {
    const filePath = `./reports/audit_${reportId}.xlsx`
    // In a real implementation, this would generate an Excel report
    console.log(`Generating XLSX report: ${filePath}`)
    return filePath
  }

  private async getFileSize(filePath: string): Promise<number> {
    // In a real implementation, this would get the actual file size
    return 1024 * 1024 // 1MB mock size
  }

  private async alertSecurityTeam(entry: AuditLogEntry, reason: string): Promise<void> {
    console.log(`SECURITY ALERT: ${reason}`, entry)
    // In a real implementation, this would send alerts to the security team
  }
}

export interface AuditConfig {
  enabled: boolean
  logLevel: AuditSeverity
  maxLogSize: number
  maxLogs: number
  batchSize: number
  flushInterval: number
  encryption: boolean
  compression: boolean
  realTimeAlerts: boolean
  complianceMode: boolean
}

export interface RetentionPolicy {
  name: string
  retentionPeriod: number
  autoDelete: boolean
  archiveAfter: number
  legalHold: boolean
  encryptionRequired: boolean
}

export interface ComplianceRule {
  name: string
  description: string
  conditions: {
    action?: AuditAction[]
    resource?: string[]
    category?: AuditCategory[]
    severity?: AuditSeverity[]
  }
  requirements: {
    logDataAccess: boolean
    logDataPurpose: boolean
    logDataRetention: boolean
    logDataSharing: boolean
    logDataDisclosure?: boolean
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance()
