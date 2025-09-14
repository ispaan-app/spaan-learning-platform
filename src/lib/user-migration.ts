// User data migration and management utilities
// This helps you work with existing users from your Firebase backend

import { adminDb, adminAuth } from './firebase-admin'

export interface UserMigrationData {
  uid: string
  email: string
  displayName?: string
  emailVerified: boolean
  disabled: boolean
  createdAt: string
  lastSignInAt?: string
  customClaims?: Record<string, any>
  firestoreData?: Record<string, any>
}

export interface MigrationOptions {
  batchSize?: number
  dryRun?: boolean
  updateExisting?: boolean
  defaultRole?: string
  defaultStatus?: string
}

export class UserMigrationManager {
  // Get all users from Firebase Auth
  static async getAllUsers(): Promise<UserMigrationData[]> {
    try {
      const users: UserMigrationData[] = []
      let nextPageToken: string | undefined

      do {
        const listUsersResult = await adminAuth.listUsers(1000, nextPageToken)
        
        for (const userRecord of listUsersResult.users) {
          // Get Firestore data for this user
          let firestoreData = {}
          try {
            const userDoc = await adminDb.collection('users').doc(userRecord.uid).get()
            if (userDoc.exists) {
              firestoreData = userDoc.data() || {}
            }
          } catch (error) {
            console.warn(`Could not fetch Firestore data for user ${userRecord.uid}:`, error)
          }

          users.push({
            uid: userRecord.uid,
            email: userRecord.email || '',
            displayName: userRecord.displayName,
            emailVerified: userRecord.emailVerified,
            disabled: userRecord.disabled,
            createdAt: userRecord.metadata.creationTime,
            lastSignInAt: userRecord.metadata.lastSignInTime,
            customClaims: userRecord.customClaims,
            firestoreData
          })
        }

        nextPageToken = listUsersResult.pageToken
      } while (nextPageToken)

      return users
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  }

  // Get users by role
  static async getUsersByRole(role: string): Promise<UserMigrationData[]> {
    const allUsers = await this.getAllUsers()
    return allUsers.filter(user => user.firestoreData?.role === role)
  }

  // Get users by status
  static async getUsersByStatus(status: string): Promise<UserMigrationData[]> {
    const allUsers = await this.getAllUsers()
    return allUsers.filter(user => user.firestoreData?.status === status)
  }

  // Update user role in Firestore
  static async updateUserRole(uid: string, role: string, options: MigrationOptions = {}): Promise<boolean> {
    try {
      if (options.dryRun) {
        console.log(`[DRY RUN] Would update user ${uid} role to ${role}`)
        return true
      }

      await adminDb.collection('users').doc(uid).update({
        role,
        updatedAt: new Date().toISOString()
      })

      // Update custom claims
      await adminAuth.setCustomUserClaims(uid, { role })

      console.log(`✅ Updated user ${uid} role to ${role}`)
      return true
    } catch (error) {
      console.error(`❌ Failed to update user ${uid} role:`, error)
      return false
    }
  }

  // Update user status
  static async updateUserStatus(uid: string, status: string, options: MigrationOptions = {}): Promise<boolean> {
    try {
      if (options.dryRun) {
        console.log(`[DRY RUN] Would update user ${uid} status to ${status}`)
        return true
      }

      await adminDb.collection('users').doc(uid).update({
        status,
        updatedAt: new Date().toISOString()
      })

      console.log(`✅ Updated user ${uid} status to ${status}`)
      return true
    } catch (error) {
      console.error(`❌ Failed to update user ${uid} status:`, error)
      return false
    }
  }

  // Create missing Firestore documents for users
  static async createMissingUserDocuments(options: MigrationOptions = {}): Promise<{
    created: number
    errors: number
    details: string[]
  }> {
    const users = await this.getAllUsers()
    const results = {
      created: 0,
      errors: 0,
      details: [] as string[]
    }

    for (const user of users) {
      try {
        // Check if user document exists in Firestore
        const userDoc = await adminDb.collection('users').doc(user.uid).get()
        
        if (!userDoc.exists) {
          if (options.dryRun) {
            results.details.push(`[DRY RUN] Would create document for user ${user.uid}`)
            continue
          }

          // Create user document
          const userData = {
            id: user.uid,
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            email: user.email,
            role: options.defaultRole || 'learner',
            status: options.defaultStatus || 'active',
            createdAt: user.createdAt,
            updatedAt: new Date().toISOString(),
            emailVerified: user.emailVerified
          }

          await adminDb.collection('users').doc(user.uid).set(userData)
          results.created++
          results.details.push(`✅ Created document for user ${user.uid}`)
        } else {
          results.details.push(`ℹ️  Document already exists for user ${user.uid}`)
        }
      } catch (error) {
        results.errors++
        results.details.push(`❌ Error creating document for user ${user.uid}: ${error}`)
      }
    }

    return results
  }

  // Migrate users to new structure
  static async migrateUsersToNewStructure(options: MigrationOptions = {}): Promise<{
    migrated: number
    errors: number
    details: string[]
  }> {
    const users = await this.getAllUsers()
    const results = {
      migrated: 0,
      errors: 0,
      details: [] as string[]
    }

    for (const user of users) {
      try {
        const userDoc = await adminDb.collection('users').doc(user.uid).get()
        
        if (!userDoc.exists) {
          results.details.push(`⚠️  No Firestore document found for user ${user.uid}`)
          continue
        }

        const existingData = userDoc.data() || {}
        
        // Check if user needs migration
        const needsMigration = !existingData.role || 
                              !existingData.status || 
                              !existingData.firstName || 
                              !existingData.lastName

        if (!needsMigration) {
          results.details.push(`ℹ️  User ${user.uid} already migrated`)
          continue
        }

        if (options.dryRun) {
          results.details.push(`[DRY RUN] Would migrate user ${user.uid}`)
          continue
        }

        // Update user document with new structure
        const updateData: any = {
          updatedAt: new Date().toISOString()
        }

        if (!existingData.role) {
          updateData.role = options.defaultRole || 'learner'
        }
        
        if (!existingData.status) {
          updateData.status = options.defaultStatus || 'active'
        }
        
        if (!existingData.firstName && user.displayName) {
          updateData.firstName = user.displayName.split(' ')[0] || ''
        }
        
        if (!existingData.lastName && user.displayName) {
          updateData.lastName = user.displayName.split(' ').slice(1).join(' ') || ''
        }

        await adminDb.collection('users').doc(user.uid).update(updateData)
        
        // Update custom claims
        if (updateData.role) {
          await adminAuth.setCustomUserClaims(user.uid, { role: updateData.role })
        }

        results.migrated++
        results.details.push(`✅ Migrated user ${user.uid}`)
      } catch (error) {
        results.errors++
        results.details.push(`❌ Error migrating user ${user.uid}: ${error}`)
      }
    }

    return results
  }

  // Get migration statistics
  static async getMigrationStats(): Promise<{
    totalUsers: number
    usersWithFirestoreData: number
    usersWithoutFirestoreData: number
    usersByRole: Record<string, number>
    usersByStatus: Record<string, number>
    usersNeedingMigration: number
  }> {
    const users = await this.getAllUsers()
    
    const stats = {
      totalUsers: users.length,
      usersWithFirestoreData: 0,
      usersWithoutFirestoreData: 0,
      usersByRole: {} as Record<string, number>,
      usersByStatus: {} as Record<string, number>,
      usersNeedingMigration: 0
    }

    for (const user of users) {
      if (user.firestoreData && Object.keys(user.firestoreData).length > 0) {
        stats.usersWithFirestoreData++
        
        const role = user.firestoreData.role || 'unknown'
        const status = user.firestoreData.status || 'unknown'
        
        stats.usersByRole[role] = (stats.usersByRole[role] || 0) + 1
        stats.usersByStatus[status] = (stats.usersByStatus[status] || 0) + 1
        
        // Check if user needs migration
        const needsMigration = !user.firestoreData.role || 
                              !user.firestoreData.status || 
                              !user.firestoreData.firstName || 
                              !user.firestoreData.lastName
        
        if (needsMigration) {
          stats.usersNeedingMigration++
        }
      } else {
        stats.usersWithoutFirestoreData++
      }
    }

    return stats
  }

  // Export users to JSON
  static async exportUsers(): Promise<string> {
    const users = await this.getAllUsers()
    return JSON.stringify(users, null, 2)
  }

  // Import users from JSON
  static async importUsers(jsonData: string, options: MigrationOptions = {}): Promise<{
    imported: number
    errors: number
    details: string[]
  }> {
    const users = JSON.parse(jsonData)
    const results = {
      imported: 0,
      errors: 0,
      details: [] as string[]
    }

    for (const user of users) {
      try {
        if (options.dryRun) {
          results.details.push(`[DRY RUN] Would import user ${user.uid}`)
          continue
        }

        await adminDb.collection('users').doc(user.uid).set({
          ...user.firestoreData,
          updatedAt: new Date().toISOString()
        })

        results.imported++
        results.details.push(`✅ Imported user ${user.uid}`)
      } catch (error) {
        results.errors++
        results.details.push(`❌ Error importing user ${user.uid}: ${error}`)
      }
    }

    return results
  }
}




