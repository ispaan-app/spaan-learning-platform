// Comprehensive data migration system for schema updates and data transformations

import { DatabaseMigration, Migration } from './database-schema'

interface MigrationConfig {
  batchSize: number
  timeout: number
  retryAttempts: number
  rollbackOnError: boolean
  validateData: boolean
}

interface MigrationResult {
  success: boolean
  recordsProcessed: number
  recordsSkipped: number
  recordsFailed: number
  errors: string[]
  duration: number
}

interface DataTransformation {
  sourceField: string
  targetField: string
  transform: (value: any) => any
  validation?: (value: any) => boolean
}

class MigrationManager {
  private static instance: MigrationManager
  private config: MigrationConfig
  private migrationHistory: Map<string, MigrationResult> = new Map()

  constructor() {
    this.config = {
      batchSize: 1000,
      timeout: 300000, // 5 minutes
      retryAttempts: 3,
      rollbackOnError: true,
      validateData: true
    }
  }

  static getInstance(): MigrationManager {
    if (!MigrationManager.instance) {
      MigrationManager.instance = new MigrationManager()
    }
    return MigrationManager.instance
  }

  async createMigration(
    name: string,
    version: string,
    upFunction: () => Promise<void>,
    downFunction: () => Promise<void>
  ): Promise<Migration> {
    const migration: Migration = {
      name,
      version,
      up: upFunction,
      down: downFunction
    }

    const migrationManager = DatabaseMigration.getInstance()
    migrationManager.addMigration(migration)

    return migration
  }

  async runDataMigration(
    sourceCollection: string,
    targetCollection: string,
    transformations: DataTransformation[],
    filters?: Record<string, any>
  ): Promise<MigrationResult> {
    const startTime = Date.now()
    const result: MigrationResult = {
      success: false,
      recordsProcessed: 0,
      recordsSkipped: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0
    }

    try {
      // Get source data
      const sourceData = await this.getSourceData(sourceCollection, filters)
      
      // Process data in batches
      const batches = this.createBatches(sourceData, this.config.batchSize)
      
      for (const batch of batches) {
        const batchResult = await this.processBatch(
          batch,
          targetCollection,
          transformations
        )
        
        result.recordsProcessed += batchResult.processed
        result.recordsSkipped += batchResult.skipped
        result.recordsFailed += batchResult.failed
        result.errors.push(...batchResult.errors)
      }

      result.success = result.recordsFailed === 0
      result.duration = Date.now() - startTime

      // Store migration history
      this.migrationHistory.set(`${sourceCollection}_to_${targetCollection}`, result)

      return result
    } catch (error) {
      result.success = false
      result.errors.push(error instanceof Error ? error.message : 'Unknown error')
      result.duration = Date.now() - startTime
      
      if (this.config.rollbackOnError) {
        await this.rollbackMigration(targetCollection)
      }
      
      return result
    }
  }

  private async getSourceData(
    collection: string,
    filters?: Record<string, any>
  ): Promise<any[]> {
    // In a real implementation, this would query the actual database
    // For now, we'll simulate data retrieval
    return []
  }

  private createBatches(data: any[], batchSize: number): any[][] {
    const batches: any[][] = []
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize))
    }
    return batches
  }

  private async processBatch(
    batch: any[],
    targetCollection: string,
    transformations: DataTransformation[]
  ): Promise<{
    processed: number
    skipped: number
    failed: number
    errors: string[]
  }> {
    let processed = 0
    let skipped = 0
    let failed = 0
    const errors: string[] = []

    for (const record of batch) {
      try {
        // Transform data
        const transformedRecord = this.transformRecord(record, transformations)
        
        // Validate data if enabled
        if (this.config.validateData) {
          const isValid = await this.validateRecord(transformedRecord, targetCollection)
          if (!isValid) {
            skipped++
            continue
          }
        }

        // Save to target collection
        await this.saveRecord(targetCollection, transformedRecord)
        processed++
      } catch (error) {
        failed++
        errors.push(error instanceof Error ? error.message : 'Unknown error')
      }
    }

    return { processed, skipped, failed, errors }
  }

  private transformRecord(
    record: any,
    transformations: DataTransformation[]
  ): any {
    const transformed: any = { ...record }

    for (const transformation of transformations) {
      try {
        const sourceValue = record[transformation.sourceField]
        const transformedValue = transformation.transform(sourceValue)
        
        if (transformation.validation && !transformation.validation(transformedValue)) {
          throw new Error(`Validation failed for field ${transformation.targetField}`)
        }
        
        transformed[transformation.targetField] = transformedValue
      } catch (error) {
        throw new Error(`Transformation failed for field ${transformation.sourceField}: ${error}`)
      }
    }

    return transformed
  }

  private async validateRecord(record: any, collection: string): Promise<boolean> {
    // In a real implementation, this would validate against the schema
    return true
  }

  private async saveRecord(collection: string, record: any): Promise<void> {
    // In a real implementation, this would save to the actual database
    console.log(`Saving record to ${collection}:`, record)
  }

  private async rollbackMigration(collection: string): Promise<void> {
    // In a real implementation, this would rollback the migration
    console.log(`Rolling back migration for ${collection}`)
  }

  getMigrationHistory(): Map<string, MigrationResult> {
    return new Map(this.migrationHistory)
  }

  getMigrationStats(): {
    totalMigrations: number
    successfulMigrations: number
    failedMigrations: number
    totalRecordsProcessed: number
    averageDuration: number
  } {
    const results = Array.from(this.migrationHistory.values())
    
    return {
      totalMigrations: results.length,
      successfulMigrations: results.filter(r => r.success).length,
      failedMigrations: results.filter(r => !r.success).length,
      totalRecordsProcessed: results.reduce((sum, r) => sum + r.recordsProcessed, 0),
      averageDuration: results.reduce((sum, r) => sum + r.duration, 0) / results.length
    }
  }
}

// Specific migration implementations
export class UserMigration {
  static async migrateUserRoles(): Promise<Migration> {
    return MigrationManager.getInstance().createMigration(
      'migrate_user_roles',
      '1.0.0',
      async () => {
        const transformations: DataTransformation[] = [
          {
            sourceField: 'role',
            targetField: 'role',
            transform: (value: string) => {
              const roleMap: Record<string, string> = {
                'student': 'learner',
                'instructor': 'admin',
                'supervisor': 'admin',
                'coordinator': 'admin'
              }
              return roleMap[value] || value
            },
            validation: (value: string) => 
              ['applicant', 'learner', 'admin', 'super-admin'].includes(value)
          }
        ]

        await MigrationManager.getInstance().runDataMigration(
          'users_old',
          'users',
          transformations
        )
      },
      async () => {
        // Rollback logic
        console.log('Rolling back user role migration')
      }
    )
  }

  static async migrateUserPreferences(): Promise<Migration> {
    return MigrationManager.getInstance().createMigration(
      'migrate_user_preferences',
      '1.0.1',
      async () => {
        const transformations: DataTransformation[] = [
          {
            sourceField: 'settings',
            targetField: 'preferences',
            transform: (value: any) => {
              return {
                theme: value.theme || 'auto',
                language: value.language || 'en',
                timezone: value.timezone || 'UTC',
                notifications: {
                  email: value.emailNotifications !== false,
                  push: value.pushNotifications !== false,
                  sms: value.smsNotifications === true,
                  categories: value.notificationCategories || {}
                },
                accessibility: {
                  highContrast: value.highContrast === true,
                  largeText: value.largeText === true,
                  reducedMotion: value.reducedMotion === true,
                  screenReader: value.screenReader === true,
                  keyboardNavigation: value.keyboardNavigation === true
                },
                dashboard: {
                  widgets: value.dashboardWidgets || {},
                  layout: value.dashboardLayout || 'default',
                  refreshInterval: value.refreshInterval || 30000
                }
              }
            }
          }
        ]

        await MigrationManager.getInstance().runDataMigration(
          'users',
          'users',
          transformations
        )
      },
      async () => {
        console.log('Rolling back user preferences migration')
      }
    )
  }
}

export class ApplicationMigration {
  static async migrateApplicationStatus(): Promise<Migration> {
    return MigrationManager.getInstance().createMigration(
      'migrate_application_status',
      '1.0.0',
      async () => {
        const transformations: DataTransformation[] = [
          {
            sourceField: 'status',
            targetField: 'status',
            transform: (value: string) => {
              const statusMap: Record<string, string> = {
                'pending': 'submitted',
                'in_review': 'under_review',
                'accepted': 'approved',
                'declined': 'rejected'
              }
              return statusMap[value] || value
            },
            validation: (value: string) => 
              ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn'].includes(value)
          },
          {
            sourceField: 'priority',
            targetField: 'priority',
            transform: (value: string) => {
              const priorityMap: Record<string, string> = {
                '1': 'low',
                '2': 'medium',
                '3': 'high',
                '4': 'urgent'
              }
              return priorityMap[value] || 'medium'
            }
          }
        ]

        await MigrationManager.getInstance().runDataMigration(
          'applications_old',
          'applications',
          transformations
        )
      },
      async () => {
        console.log('Rolling back application status migration')
      }
    )
  }
}

export class DocumentMigration {
  static async migrateDocumentTypes(): Promise<Migration> {
    return MigrationManager.getInstance().createMigration(
      'migrate_document_types',
      '1.0.0',
      async () => {
        const transformations: DataTransformation[] = [
          {
            sourceField: 'documentType',
            targetField: 'type',
            transform: (value: string) => {
              const typeMap: Record<string, string> = {
                'resume': 'cv',
                'id_card': 'id',
                'cert': 'certificate',
                'transcript': 'transcript',
                'portfolio': 'portfolio',
                'other': 'other'
              }
              return typeMap[value] || 'other'
            }
          },
          {
            sourceField: 'status',
            targetField: 'status',
            transform: (value: string) => {
              const statusMap: Record<string, string> = {
                'uploaded': 'uploaded',
                'pending_review': 'pending',
                'approved': 'approved',
                'rejected': 'rejected'
              }
              return statusMap[value] || 'uploaded'
            }
          }
        ]

        await MigrationManager.getInstance().runDataMigration(
          'documents_old',
          'documents',
          transformations
        )
      },
      async () => {
        console.log('Rolling back document types migration')
      }
    )
  }
}

// Migration runner utility
export class MigrationRunner {
  private static instance: MigrationRunner
  private migrationManager: MigrationManager

  constructor() {
    this.migrationManager = MigrationManager.getInstance()
  }

  static getInstance(): MigrationRunner {
    if (!MigrationRunner.instance) {
      MigrationRunner.instance = new MigrationRunner()
    }
    return MigrationRunner.instance
  }

  async runAllMigrations(): Promise<void> {
    console.log('Starting migration process...')

    try {
      // Register all migrations
      await UserMigration.migrateUserRoles()
      await UserMigration.migrateUserPreferences()
      await ApplicationMigration.migrateApplicationStatus()
      await DocumentMigration.migrateDocumentTypes()

      // Run migrations
      const migrationManager = DatabaseMigration.getInstance()
      await migrationManager.runMigrations()

      console.log('All migrations completed successfully')
    } catch (error) {
      console.error('Migration failed:', error)
      throw error
    }
  }

  async rollbackAllMigrations(): Promise<void> {
    console.log('Starting rollback process...')

    try {
      const migrationManager = DatabaseMigration.getInstance()
      await migrationManager.rollbackMigrations()

      console.log('All migrations rolled back successfully')
    } catch (error) {
      console.error('Rollback failed:', error)
      throw error
    }
  }

  async getMigrationStatus(): Promise<{
    history: Map<string, MigrationResult>
    stats: {
      totalMigrations: number
      successfulMigrations: number
      failedMigrations: number
      totalRecordsProcessed: number
      averageDuration: number
    }
  }> {
    return {
      history: this.migrationManager.getMigrationHistory(),
      stats: this.migrationManager.getMigrationStats()
    }
  }
}

// Export utilities
export { MigrationManager }
export type { MigrationResult, DataTransformation, MigrationConfig }
