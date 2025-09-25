'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { collection, query, where, onSnapshot, getDocs, limit, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface GlobalStats {
  totalUsers: number
  pendingApplications: number
  activePlacements: number
  totalAdmins: number
  totalLearners: number
  totalApplicants: number
  systemHealth: number
  uptime: string
}

interface LearnerDistribution {
  program: string
  count: number
}

interface LearnerProvince {
  province: string
  count: number
}

interface SystemMetrics {
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkLatency: number
}

interface RecentActivity {
  id: string
  action: string
  adminName: string
  timestamp: string
  [key: string]: any
}

interface SuperAdminData {
  globalStats: GlobalStats
  learnerDistribution: LearnerDistribution[]
  learnerProvince: LearnerProvince[]
  recentActivity: RecentActivity[]
  systemMetrics: SystemMetrics
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000

export function useSuperAdminData() {
  const [data, setData] = useState<SuperAdminData>({
    globalStats: {
      totalUsers: 0,
      pendingApplications: 0,
      activePlacements: 0,
      totalAdmins: 0,
      totalLearners: 0,
      totalApplicants: 0,
      systemHealth: 98,
      uptime: '99.9%'
    },
    learnerDistribution: [],
    learnerProvince: [],
    recentActivity: [],
    systemMetrics: {
      cpuUsage: 45,
      memoryUsage: 67,
      diskUsage: 23,
      networkLatency: 12
    },
    loading: true,
    error: null,
    lastUpdated: null
  })

  const listenersRef = useRef<(() => void)[]>([])

  // Cached API call function
  const cachedFetch = useCallback(async (url: string, options?: RequestInit) => {
    const cacheKey = `${url}-${JSON.stringify(options)}`
    const cached = cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data
    }

    try {
      const response = await fetch(url, options)
      const data = await response.json()
      
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl: CACHE_TTL
      })
      
      return data
    } catch (error) {
      console.error(`Error fetching ${url}:`, error)
      throw error
    }
  }, [])

  // Fetch comprehensive super admin data
  const fetchSuperAdminData = useCallback(async () => {
    try {
      const response = await cachedFetch('/api/super-admin-data')
      return response.data
    } catch (error) {
      console.error('Error fetching super admin data:', error)
      throw error
    }
  }, [cachedFetch])

  // Set up real-time listeners for critical data
  const setupRealtimeListeners = useCallback(() => {
    // Clear existing listeners
    listenersRef.current.forEach(unsubscribe => unsubscribe())
    listenersRef.current = []

    // Listen for changes in users
    const usersQuery = query(collection(db, 'users'))
    const unsubscribeUsers = onSnapshot(usersQuery, async () => {
      try {
        const superAdminData = await fetchSuperAdminData()
        setData(prev => ({
          ...prev,
          ...superAdminData,
          lastUpdated: new Date()
        }))
      } catch (error) {
        console.error('Error updating super admin data:', error)
      }
    })
    
    listenersRef.current.push(unsubscribeUsers)

    // Listen for changes in applications
    const applicationsQuery = query(collection(db, 'applications'))
    const unsubscribeApplications = onSnapshot(applicationsQuery, async () => {
      try {
        const superAdminData = await fetchSuperAdminData()
        setData(prev => ({
          ...prev,
          ...superAdminData,
          lastUpdated: new Date()
        }))
      } catch (error) {
        console.error('Error updating super admin data:', error)
      }
    })
    
    listenersRef.current.push(unsubscribeApplications)

    // Listen for changes in audit logs (recent activity)
    const auditLogsQuery = query(
      collection(db, 'audit-logs'),
      orderBy('timestamp', 'desc'),
      limit(10)
    )
    const unsubscribeAuditLogs = onSnapshot(auditLogsQuery, async () => {
      try {
        const superAdminData = await fetchSuperAdminData()
        setData(prev => ({
          ...prev,
          ...superAdminData,
          lastUpdated: new Date()
        }))
      } catch (error) {
        console.error('Error updating super admin data:', error)
      }
    })
    
    listenersRef.current.push(unsubscribeAuditLogs)
  }, [fetchSuperAdminData])

  // Initial data fetch
  useEffect(() => {
    let isMounted = true

    const fetchInitialData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }))
        
        const superAdminData = await fetchSuperAdminData()
        
        if (isMounted) {
          setData({
            ...superAdminData,
            loading: false,
            error: null,
            lastUpdated: new Date()
          })
        }
      } catch (error) {
        if (isMounted) {
          setData(prev => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch data'
          }))
        }
      }
    }

    fetchInitialData()
    
    // Set up real-time listeners after initial fetch
    const timer = setTimeout(() => {
      if (isMounted) {
        setupRealtimeListeners()
      }
    }, 1000)

    return () => {
      isMounted = false
      clearTimeout(timer)
      listenersRef.current.forEach(unsubscribe => unsubscribe())
    }
  }, [fetchSuperAdminData, setupRealtimeListeners])

  // Manual refresh function
  const refresh = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }))
      
      // Clear cache to force fresh data
      cache.clear()
      
      const superAdminData = await fetchSuperAdminData()
      
      setData({
        ...superAdminData,
        loading: false,
        error: null,
        lastUpdated: new Date()
      })
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh data'
      }))
    }
  }, [fetchSuperAdminData])

  return {
    ...data,
    refresh
  }
}
