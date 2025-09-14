'use client'

import React from 'react'

// Offline support utilities
export class OfflineManager {
  private static instance: OfflineManager
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true
  private pendingActions: Array<() => Promise<void>> = []
  private syncInProgress: boolean = false

  private constructor() {
    if (typeof window !== 'undefined') {
      this.setupEventListeners()
    }
  }

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager()
    }
    return OfflineManager.instance
  }

  private setupEventListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true
        this.handleOnline()
      })

      window.addEventListener('offline', () => {
        this.isOnline = false
        this.handleOffline()
      })
    }
  }

  private async handleOnline() {
    console.log('Connection restored, syncing pending actions...')
    await this.syncPendingActions()
  }

  private handleOffline() {
    console.log('Connection lost, actions will be queued')
  }

  private async syncPendingActions() {
    if (this.syncInProgress || this.pendingActions.length === 0) {
      return
    }

    this.syncInProgress = true

    try {
      const actions = [...this.pendingActions]
      this.pendingActions = []

      for (const action of actions) {
        try {
          await action()
        } catch (error) {
          console.error('Failed to sync action:', error)
          // Re-queue failed actions
          this.pendingActions.push(action)
        }
      }

      console.log('Sync completed successfully')
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      this.syncInProgress = false
    }
  }

  public isConnected(): boolean {
    return this.isOnline
  }

  public async queueAction(action: () => Promise<void>): Promise<void> {
    if (this.isOnline) {
      try {
        await action()
      } catch (error) {
        console.error('Action failed:', error)
        this.pendingActions.push(action)
      }
    } else {
      this.pendingActions.push(action)
    }
  }

  public getPendingActionsCount(): number {
    return this.pendingActions.length
  }

  public clearPendingActions(): void {
    this.pendingActions = []
  }
}

// Cache management for offline support
export class CacheManager {
  private static instance: CacheManager
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()

  private constructor() {
    this.loadFromStorage()
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem('ispaan-cache')
      if (stored) {
        const parsed = JSON.parse(stored)
        this.cache = new Map(Object.entries(parsed))
      }
    } catch (error) {
      console.error('Failed to load cache from storage:', error)
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return
    
    try {
      const serialized = Object.fromEntries(this.cache)
      localStorage.setItem('ispaan-cache', JSON.stringify(serialized))
    } catch (error) {
      console.error('Failed to save cache to storage:', error)
    }
  }

  public set(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
    this.saveToStorage()
  }

  public get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      this.saveToStorage()
      return null
    }

    return item.data
  }

  public has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      this.saveToStorage()
      return false
    }

    return true
  }

  public delete(key: string): void {
    this.cache.delete(key)
    this.saveToStorage()
  }

  public clear(): void {
    this.cache.clear()
    this.saveToStorage()
  }

  public getSize(): number {
    return this.cache.size
  }
}

// Offline data synchronization
export class OfflineSync {
  private static instance: OfflineSync
  private offlineManager: OfflineManager
  private cacheManager: CacheManager

  private constructor() {
    this.offlineManager = OfflineManager.getInstance()
    this.cacheManager = CacheManager.getInstance()
  }

  static getInstance(): OfflineSync {
    if (!OfflineSync.instance) {
      OfflineSync.instance = new OfflineSync()
    }
    return OfflineSync.instance
  }

  public async syncUserData(userId: string): Promise<void> {
    const action = async () => {
      // In a real implementation, you would sync with your backend
      console.log(`Syncing user data for ${userId}`)
    }

    await this.offlineManager.queueAction(action)
  }

  public async syncWorkHours(learnerId: string): Promise<void> {
    const action = async () => {
      console.log(`Syncing work hours for ${learnerId}`)
    }

    await this.offlineManager.queueAction(action)
  }

  public async syncDocuments(userId: string): Promise<void> {
    const action = async () => {
      console.log(`Syncing documents for ${userId}`)
    }

    await this.offlineManager.queueAction(action)
  }

  public getOfflineStatus() {
    return {
      isOnline: this.offlineManager.isConnected(),
      pendingActions: this.offlineManager.getPendingActionsCount(),
      cacheSize: this.cacheManager.getSize()
    }
  }
}

// Service Worker registration
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered successfully:', registration)
      return registration
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return null
    }
  }
  return null
}

// Offline detection hook
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = React.useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [pendingActions, setPendingActions] = React.useState(0)

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check pending actions periodically
    const interval = setInterval(() => {
      const offlineSync = OfflineSync.getInstance()
      const status = offlineSync.getOfflineStatus()
      setPendingActions(status.pendingActions)
    }, 1000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  return { isOnline, pendingActions }
}

// Offline indicator component - Updated to use better UI
export function OfflineIndicator() {
  const { isOnline, pendingActions } = useOfflineStatus()

  // Only show if actually offline (not just permission errors)
  if (isOnline) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-3 px-4 shadow-lg">
      <div className="flex items-center justify-center space-x-3">
        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">
            You're offline
          </span>
          {pendingActions > 0 && (
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
              {pendingActions} actions queued
            </span>
          )}
        </div>
        <div className="text-xs opacity-80">
          Actions will sync when connection is restored
        </div>
      </div>
    </div>
  )
}

// Export singleton instances
export const offlineManager = OfflineManager.getInstance()
export const cacheManager = CacheManager.getInstance()
export const offlineSync = OfflineSync.getInstance()
