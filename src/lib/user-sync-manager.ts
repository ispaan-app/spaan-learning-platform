'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import { onSnapshot, doc, collection, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { User } from 'firebase/auth'

export interface UserSyncState {
  isOnline: boolean
  lastSync: Date | null
  pendingChanges: number
  syncErrors: string[]
}

export interface UserDataChange {
  collection: string
  docId: string
  changeType: 'added' | 'modified' | 'removed'
  timestamp: Date
  data?: any
}

export class UserSyncManager {
  private static instance: UserSyncManager
  private subscriptions: Map<string, () => void> = new Map()
  private changeListeners: Set<(change: UserDataChange) => void> = new Set()
  private syncState: UserSyncState = {
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
    lastSync: null,
    pendingChanges: 0,
    syncErrors: []
  }

  private constructor() {
    // Only add event listeners on client side
    if (typeof window !== 'undefined') {
      // Listen for online/offline events
      window.addEventListener('online', () => {
        this.syncState.isOnline = true
        this.notifyStateChange()
      })

      window.addEventListener('offline', () => {
        this.syncState.isOnline = false
        this.notifyStateChange()
      })
    }
  }

  static getInstance(): UserSyncManager {
    if (!UserSyncManager.instance) {
      UserSyncManager.instance = new UserSyncManager()
    }
    return UserSyncManager.instance
  }

  /**
   * Subscribe to user data changes across all collections
   */
  subscribeToUserChanges(userId: string, onDataChange: (change: UserDataChange) => void) {
    // Subscribe to user document changes
    const userUnsubscribe = onSnapshot(
      doc(db, 'users', userId),
      (doc) => {
        if (doc.exists()) {
          const change: UserDataChange = {
            collection: 'users',
            docId: doc.id,
            changeType: 'modified',
            timestamp: new Date(),
            data: doc.data()
          }
          onDataChange(change)
          this.notifyChangeListeners(change)
        }
      },
      (error) => {
        console.error('Error listening to user changes:', error)
        this.addSyncError(`User sync error: ${error.message}`)
        
        // Don't crash on network errors, just log them
        if (error.code === 'unavailable' || error.code === 'deadline-exceeded') {
          console.warn('Network error in user changes listener, will retry automatically')
        }
      }
    )

    // Subscribe to learner profile changes
    const learnerUnsubscribe = onSnapshot(
      doc(db, 'learnerProfiles', userId),
      (doc) => {
        if (doc.exists()) {
          const change: UserDataChange = {
            collection: 'learnerProfiles',
            docId: doc.id,
            changeType: 'modified',
            timestamp: new Date(),
            data: doc.data()
          }
          onDataChange(change)
          this.notifyChangeListeners(change)
        }
      },
      (error) => {
        console.error('Error listening to learner profile changes:', error)
        this.addSyncError(`Learner profile sync error: ${error.message}`)
      }
    )

    // Subscribe to application changes
    const applicationsQuery = query(
      collection(db, 'applications'),
      where('userId', '==', userId),
      orderBy('submittedAt', 'desc')
    )
    const applicationsUnsubscribe = onSnapshot(
      applicationsQuery,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const changeData: UserDataChange = {
            collection: 'applications',
            docId: change.doc.id,
            changeType: change.type as 'added' | 'modified' | 'removed',
            timestamp: new Date(),
            data: change.doc.data()
          }
          onDataChange(changeData)
          this.notifyChangeListeners(changeData)
        })
      },
      (error) => {
        console.error('Error listening to application changes:', error)
        this.addSyncError(`Application sync error: ${error.message}`)
      }
    )

    // Subscribe to placement changes
    const placementsQuery = query(
      collection(db, 'placements'),
      where('learnerId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const placementsUnsubscribe = onSnapshot(
      placementsQuery,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const changeData: UserDataChange = {
            collection: 'placements',
            docId: change.doc.id,
            changeType: change.type as 'added' | 'modified' | 'removed',
            timestamp: new Date(),
            data: change.doc.data()
          }
          onDataChange(changeData)
          this.notifyChangeListeners(changeData)
        })
      },
      (error) => {
        console.error('Error listening to placement changes:', error)
        this.addSyncError(`Placement sync error: ${error.message}`)
      }
    )

    // Store all unsubscribe functions
    const unsubscribeAll = () => {
      userUnsubscribe()
      learnerUnsubscribe()
      applicationsUnsubscribe()
      placementsUnsubscribe()
    }

    this.subscriptions.set(`user-${userId}`, unsubscribeAll)
    return unsubscribeAll
  }

  /**
   * Subscribe to role changes for real-time role updates
   */
  subscribeToRoleChanges(userId: string, onRoleChange: (newRole: string) => void) {
    const unsubscribe = onSnapshot(
      doc(db, 'users', userId),
      (doc) => {
        if (doc.exists()) {
          const userData = doc.data()
          const newRole = userData.role
          if (newRole) {
            onRoleChange(newRole)
          }
        }
      },
      (error) => {
        console.error('Error listening to role changes:', error)
        this.addSyncError(`Role sync error: ${error.message}`)
        
        // Don't crash on network errors, just log them
        if (error.code === 'unavailable' || error.code === 'deadline-exceeded') {
          console.warn('Network error in role changes listener, will retry automatically')
        }
      }
    )

    this.subscriptions.set(`role-${userId}`, unsubscribe)
    return unsubscribe
  }

  /**
   * Add a change listener
   */
  addChangeListener(listener: (change: UserDataChange) => void) {
    this.changeListeners.add(listener)
  }

  /**
   * Remove a change listener
   */
  removeChangeListener(listener: (change: UserDataChange) => void) {
    this.changeListeners.delete(listener)
  }

  /**
   * Get current sync state
   */
  getSyncState(): UserSyncState {
    return { ...this.syncState }
  }

  /**
   * Clear sync errors
   */
  clearSyncErrors() {
    this.syncState.syncErrors = []
  }

  /**
   * Unsubscribe from all user changes
   */
  unsubscribeFromUser(userId: string) {
    const userUnsubscribe = this.subscriptions.get(`user-${userId}`)
    const roleUnsubscribe = this.subscriptions.get(`role-${userId}`)
    
    if (userUnsubscribe) {
      userUnsubscribe()
      this.subscriptions.delete(`user-${userId}`)
    }
    
    if (roleUnsubscribe) {
      roleUnsubscribe()
      this.subscriptions.delete(`role-${userId}`)
    }
  }

  /**
   * Unsubscribe from all changes
   */
  unsubscribeAll() {
    this.subscriptions.forEach((unsubscribe) => unsubscribe())
    this.subscriptions.clear()
  }

  private notifyChangeListeners(change: UserDataChange) {
    this.changeListeners.forEach((listener) => {
      try {
        listener(change)
      } catch (error) {
        console.error('Error in change listener:', error)
      }
    })
  }

  private notifyStateChange() {
    // Notify listeners of sync state changes
    this.changeListeners.forEach((listener) => {
      try {
        // Create a special change event for state updates
        const stateChange: UserDataChange = {
          collection: 'syncState',
          docId: 'state',
          changeType: 'modified',
          timestamp: new Date(),
          data: this.syncState
        }
        listener(stateChange)
      } catch (error) {
        console.error('Error in state change listener:', error)
      }
    })
  }

  private addSyncError(error: string) {
    this.syncState.syncErrors.push(error)
    if (this.syncState.syncErrors.length > 10) {
      this.syncState.syncErrors.shift() // Keep only last 10 errors
    }
    this.notifyStateChange()
  }
}

/**
 * React hook for user data synchronization
 */
export function useUserSync(user: User | null) {
  const syncManager = useRef(UserSyncManager.getInstance())
  const [syncState, setSyncState] = React.useState<UserSyncState>(
    syncManager.current.getSyncState()
  )

  const handleDataChange = useCallback((change: UserDataChange) => {
    // Only log if it's not a syncState change to prevent spam
    if (change.collection !== 'syncState') {
      console.log('User data changed:', change)
    }
    // Update sync state
    setSyncState(syncManager.current.getSyncState())
  }, [])

  const handleRoleChange = useCallback((newRole: string) => {
    console.log('User role changed:', newRole)
    // Disable automatic reload to prevent infinite refresh
    // Role changes will be handled by AuthContext without page reload
    if (user) {
      user.getIdToken(true).then(() => {
        console.log('Token refreshed successfully for role change')
        // Don't reload the page - let AuthContext handle the state update
      }).catch((error) => {
        console.error('Error refreshing token for role change:', error)
        // Don't reload on any errors to prevent infinite refresh
        console.warn('Skipping page reload due to error')
      })
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      syncManager.current.unsubscribeAll()
      return
    }

    // Subscribe to user changes
    const unsubscribeUser = syncManager.current.subscribeToUserChanges(
      user.uid,
      handleDataChange
    )

    // Subscribe to role changes
    const unsubscribeRole = syncManager.current.subscribeToRoleChanges(
      user.uid,
      handleRoleChange
    )

    // Add change listener for sync state updates
    syncManager.current.addChangeListener(handleDataChange)

    return () => {
      unsubscribeUser()
      unsubscribeRole()
      syncManager.current.removeChangeListener(handleDataChange)
    }
  }, [user?.uid]) // Only depend on user.uid, not the entire user object or callbacks

  return {
    syncState,
    clearErrors: () => {
      syncManager.current.clearSyncErrors()
      setSyncState(syncManager.current.getSyncState())
    }
  }
}

