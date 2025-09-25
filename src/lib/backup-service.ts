import { adminDb } from '@/lib/firebase-admin'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { writeFile, mkdir, readdir, stat, readFile, unlink } from 'fs/promises'
import { join, dirname } from 'path'
import { createHash } from 'crypto'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface BackupConfig {
  enabled: boolean
  schedule: string // cron expression
  retentionDays: number
  storagePath: string
  collections: string[]
  compression: boolean
  encryption: boolean
  encryptionKey?: string
}

interface BackupMetadata {
  id: string
  timestamp: Date
  size: number
  collections: string[]
  checksum: string
  compressed: boolean
  encrypted: boolean
  status: 'success' | 'failed' | 'in_progress'
  error?: string
}

class BackupService {
  private static instance: BackupService
  private config: BackupConfig
  private isRunning = false

  private constructor() {
    this.config = {
      enabled: process.env.BACKUP_ENABLED === 'true',
      schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
      retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
      storagePath: process.env.BACKUP_STORAGE_PATH || './backups',
      collections: [
        'users',
        'learnerProfiles',
        'programs',
        'placements',
        'documents',
        'notifications',
        'audit-logs',
        'sessions',
        'settings',
        'attendance',
        'work-hours',
        'issues',
        'ai-prompts'
      ],
      compression: process.env.BACKUP_COMPRESSION === 'true',
      encryption: process.env.BACKUP_ENCRYPTION === 'true',
      encryptionKey: process.env.BACKUP_ENCRYPTION_KEY
    }
  }

  static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService()
    }
    return BackupService.instance
  }

  // Create a full backup of all collections
  async createBackup(): Promise<BackupMetadata> {
    if (this.isRunning) {
      throw new Error('Backup already in progress')
    }

    this.isRunning = true
    const backupId = `backup_${Date.now()}`
    const timestamp = new Date()
    
    const metadata: BackupMetadata = {
      id: backupId,
      timestamp,
      size: 0,
      collections: [],
      checksum: '',
      compressed: this.config.compression,
      encrypted: this.config.encryption,
      status: 'in_progress'
    }

    try {
      // Ensure backup directory exists
      await mkdir(this.config.storagePath, { recursive: true })
      
      const backupData: any = {
        metadata: {
          version: '1.0',
          timestamp: timestamp.toISOString(),
          collections: this.config.collections
        },
        data: {}
      }

      // Backup each collection
      for (const collectionName of this.config.collections) {
        try {
          console.log(`Backing up collection: ${collectionName}`)
          const collectionRef = adminDb.collection(collectionName)
          const snapshot = await collectionRef.get()
          
          const collectionData: any[] = []
          snapshot.forEach(doc => {
            collectionData.push({
              id: doc.id,
              data: doc.data(),
              createdAt: doc.createTime?.toDate()?.toISOString(),
              updatedAt: doc.updateTime?.toDate()?.toISOString()
            })
          })

          backupData.data[collectionName] = collectionData
          metadata.collections.push(collectionName)
          
          console.log(`Backed up ${collectionData.length} documents from ${collectionName}`)
        } catch (error) {
          console.error(`Error backing up collection ${collectionName}:`, error)
          // Continue with other collections
        }
      }

      // Save backup data
      const backupPath = join(this.config.storagePath, `${backupId}.json`)
      const backupJson = JSON.stringify(backupData, null, 2)
      await writeFile(backupPath, backupJson, 'utf8')

      // Calculate file size
      const stats = await stat(backupPath)
      metadata.size = stats.size

      // Calculate checksum
      const fileBuffer = await readFile(backupPath)
      metadata.checksum = createHash('sha256').update(fileBuffer).digest('hex')

      // Compress if enabled
      if (this.config.compression) {
        await this.compressBackup(backupPath)
      }

      // Encrypt if enabled
      if (this.config.encryption && this.config.encryptionKey) {
        await this.encryptBackup(backupPath)
      }

      metadata.status = 'success'
      console.log(`Backup completed successfully: ${backupId}`)

      // Save metadata
      await this.saveBackupMetadata(metadata)

      return metadata

    } catch (error) {
      metadata.status = 'failed'
      metadata.error = error instanceof Error ? error.message : 'Unknown error'
      console.error('Backup failed:', error)
      
      // Save failed metadata
      await this.saveBackupMetadata(metadata)
      
      throw error
    } finally {
      this.isRunning = false
    }
  }

  // Restore from backup
  async restoreBackup(backupId: string): Promise<void> {
    const metadata = await this.getBackupMetadata(backupId)
    if (!metadata) {
      throw new Error(`Backup not found: ${backupId}`)
    }

    const backupPath = join(this.config.storagePath, `${backupId}.json`)
    
    // Decrypt if needed
    if (metadata.encrypted) {
      await this.decryptBackup(backupPath)
    }

    // Decompress if needed
    if (metadata.compressed) {
      await this.decompressBackup(backupPath)
    }

    // Read backup data
    const backupData = JSON.parse(await readFile(backupPath, 'utf8'))

    // Restore each collection
    for (const [collectionName, documents] of Object.entries(backupData.data)) {
      if (Array.isArray(documents)) {
        console.log(`Restoring collection: ${collectionName}`)
        
        for (const docData of documents) {
          try {
            const docRef = adminDb.collection(collectionName).doc(docData.id)
            await docRef.set(docData.data)
          } catch (error) {
            console.error(`Error restoring document ${docData.id} in ${collectionName}:`, error)
          }
        }
        
        console.log(`Restored ${documents.length} documents to ${collectionName}`)
      }
    }
  }

  // List all backups
  async listBackups(): Promise<BackupMetadata[]> {
    try {
      const files = await readdir(this.config.storagePath)
      const backupFiles = files.filter(file => file.startsWith('backup_') && file.endsWith('.json'))
      
      const backups: BackupMetadata[] = []
      for (const file of backupFiles) {
        const backupId = file.replace('.json', '')
        const metadata = await this.getBackupMetadata(backupId)
        if (metadata) {
          backups.push(metadata)
        }
      }
      
      return backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    } catch (error) {
      console.error('Error listing backups:', error)
      return []
    }
  }

  // Clean up old backups
  async cleanupOldBackups(): Promise<void> {
    const backups = await this.listBackups()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays)

    for (const backup of backups) {
      if (backup.timestamp < cutoffDate) {
        try {
          await this.deleteBackup(backup.id)
          console.log(`Deleted old backup: ${backup.id}`)
        } catch (error) {
          console.error(`Error deleting backup ${backup.id}:`, error)
        }
      }
    }
  }

  // Delete a specific backup
  async deleteBackup(backupId: string): Promise<void> {
    const backupPath = join(this.config.storagePath, `${backupId}.json`)
    const metadataPath = join(this.config.storagePath, `${backupId}.metadata.json`)
    
    try {
      await unlink(backupPath)
      await unlink(metadataPath)
    } catch (error) {
      console.error(`Error deleting backup ${backupId}:`, error)
      throw error
    }
  }

  // Private helper methods
  private async compressBackup(filePath: string): Promise<void> {
    const { stdout, stderr } = await execAsync(`gzip -c "${filePath}" > "${filePath}.gz"`)
    if (stderr) {
      console.error('Compression error:', stderr)
    }
  }

  private async decompressBackup(filePath: string): Promise<void> {
    const { stdout, stderr } = await execAsync(`gunzip -c "${filePath}.gz" > "${filePath}"`)
    if (stderr) {
      console.error('Decompression error:', stderr)
    }
  }

  private async encryptBackup(filePath: string): Promise<void> {
    if (!this.config.encryptionKey) {
      throw new Error('Encryption key not provided')
    }
    
    const { stdout, stderr } = await execAsync(
      `openssl enc -aes-256-cbc -salt -in "${filePath}" -out "${filePath}.enc" -k "${this.config.encryptionKey}"`
    )
    if (stderr) {
      console.error('Encryption error:', stderr)
    }
  }

  private async decryptBackup(filePath: string): Promise<void> {
    if (!this.config.encryptionKey) {
      throw new Error('Encryption key not provided')
    }
    
    const { stdout, stderr } = await execAsync(
      `openssl enc -aes-256-cbc -d -in "${filePath}.enc" -out "${filePath}" -k "${this.config.encryptionKey}"`
    )
    if (stderr) {
      console.error('Decryption error:', stderr)
    }
  }

  private async saveBackupMetadata(metadata: BackupMetadata): Promise<void> {
    const metadataPath = join(this.config.storagePath, `${metadata.id}.metadata.json`)
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf8')
  }

  private async getBackupMetadata(backupId: string): Promise<BackupMetadata | null> {
    try {
      const metadataPath = join(this.config.storagePath, `${backupId}.metadata.json`)
      const metadataJson = await readFile(metadataPath, 'utf8')
      const metadata = JSON.parse(metadataJson)
      metadata.timestamp = new Date(metadata.timestamp)
      return metadata
    } catch (error) {
      return null
    }
  }

  // Get backup statistics
  async getBackupStats(): Promise<{
    totalBackups: number
    totalSize: number
    oldestBackup: Date | null
    newestBackup: Date | null
    failedBackups: number
  }> {
    const backups = await this.listBackups()
    
    return {
      totalBackups: backups.length,
      totalSize: backups.reduce((sum, backup) => sum + backup.size, 0),
      oldestBackup: backups.length > 0 ? backups[backups.length - 1].timestamp : null,
      newestBackup: backups.length > 0 ? backups[0].timestamp : null,
      failedBackups: backups.filter(backup => backup.status === 'failed').length
    }
  }
}

// Export singleton instance
export const backupService = BackupService.getInstance()

// Export types
export type { BackupConfig, BackupMetadata }
