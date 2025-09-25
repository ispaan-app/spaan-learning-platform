import { CronJob } from 'cron'
import { backupService } from './backup-service'

class BackupScheduler {
  private static instance: BackupScheduler
  private cronJob: CronJob | null = null
  private isRunning = false

  private constructor() {}

  static getInstance(): BackupScheduler {
    if (!BackupScheduler.instance) {
      BackupScheduler.instance = new BackupScheduler()
    }
    return BackupScheduler.instance
  }

  // Start the backup scheduler
  start(): void {
    if (this.isRunning) {
      console.log('Backup scheduler is already running')
      return
    }

    const schedule = process.env.BACKUP_SCHEDULE || '0 2 * * *' // Daily at 2 AM
    
    this.cronJob = new CronJob(
      schedule,
      async () => {
        console.log('Starting scheduled backup...')
        try {
          await backupService.createBackup()
          console.log('Scheduled backup completed successfully')
          
          // Clean up old backups
          await backupService.cleanupOldBackups()
          console.log('Old backups cleaned up')
        } catch (error) {
          console.error('Scheduled backup failed:', error)
        }
      },
      null,
      true, // Start immediately
      'UTC'
    )

    this.isRunning = true
    console.log(`Backup scheduler started with schedule: ${schedule}`)
  }

  // Stop the backup scheduler
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop()
      this.cronJob = null
    }
    this.isRunning = false
    console.log('Backup scheduler stopped')
  }

  // Get scheduler status
  getStatus(): { running: boolean; nextRun?: Date } {
    return {
      running: this.isRunning,
      nextRun: this.cronJob?.nextDate()?.toJSDate()
    }
  }

  // Run backup immediately
  async runBackupNow(): Promise<void> {
    console.log('Running immediate backup...')
    try {
      await backupService.createBackup()
      console.log('Immediate backup completed successfully')
    } catch (error) {
      console.error('Immediate backup failed:', error)
      throw error
    }
  }
}

// Export singleton instance
export const backupScheduler = BackupScheduler.getInstance()

// Auto-start scheduler if enabled
if (process.env.BACKUP_ENABLED === 'true') {
  backupScheduler.start()
}
