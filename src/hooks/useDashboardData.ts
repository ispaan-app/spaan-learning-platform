'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { collection, query, where, onSnapshot, getDocs, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface DashboardStats {
  pendingApplicants: number
  totalLearners: number
  activePlacements: number
  assignedLearners: number
  attendanceRate: number
  totalSessions: number
  presentToday: number
  absentToday: number
}

interface RecentApplicant {
  id: string
  firstName: string
  lastName: string
  email: string
  program: string
  applicationDate: string
  status: string
}

interface DashboardData {
  stats: DashboardStats
  recentApplicants: RecentApplicant[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    stats: {
      pendingApplicants: 0,
      totalLearners: 0,
      activePlacements: 0,
      assignedLearners: 0,
      attendanceRate: 0,
      totalSessions: 0,
      presentToday: 0,
      absentToday: 0
    },
    recentApplicants: [],
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

  // Fetch basic dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      const dashboardData = await cachedFetch('/api/diagnose-admin')
      const attendanceData = await cachedFetch('/api/attendance-stats')
      
      return {
        pendingApplicants: dashboardData.queries?.['Pending Applicants']?.count || 0,
        totalLearners: dashboardData.queries?.['Total Learners']?.count || 0,
        activePlacements: dashboardData.queries?.['Active Placements']?.count || 0,
        assignedLearners: dashboardData.queries?.['Assigned Placements']?.count || 0,
        attendanceRate: attendanceData.queries?.['Attendance Rate']?.count || 0,
        totalSessions: attendanceData.queries?.['Total Sessions']?.count || 0,
        presentToday: attendanceData.queries?.['Present Today']?.count || 0,
        absentToday: attendanceData.queries?.['Absent Today']?.count || 0
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw error
    }
  }, [cachedFetch])

  // Fetch recent applicants with real-time updates
  const fetchRecentApplicants = useCallback(async () => {
    try {
      const applicantsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'applicant'),
        limit(5)
      )
      
      const snapshot = await getDocs(applicantsQuery)
      const applicants: RecentApplicant[] = []
      
      snapshot.forEach((doc) => {
        const data = doc.data()
        applicants.push({
          id: doc.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          program: data.program || 'Unknown',
          applicationDate: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          status: data.status || 'pending-review'
        })
      })
      
      return applicants.sort((a, b) => 
        new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime()
      )
    } catch (error) {
      console.error('Error fetching recent applicants:', error)
      return []
    }
  }, [])

  // Set up real-time listeners
  const setupRealtimeListeners = useCallback(() => {
    // Clear existing listeners
    listenersRef.current.forEach(unsubscribe => unsubscribe())
    listenersRef.current = []

    // Listen for changes in applicants
    const applicantsQuery = query(
      collection(db, 'users'),
      where('role', '==', 'applicant')
    )
    
    const unsubscribeApplicants = onSnapshot(applicantsQuery, async () => {
      try {
        const recentApplicants = await fetchRecentApplicants()
        setData(prev => ({
          ...prev,
          recentApplicants,
          lastUpdated: new Date()
        }))
      } catch (error) {
        console.error('Error updating recent applicants:', error)
      }
    })
    
    listenersRef.current.push(unsubscribeApplicants)

    // Listen for changes in learners
    const learnersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'learner')
    )
    
    const unsubscribeLearners = onSnapshot(learnersQuery, async () => {
      try {
        const stats = await fetchDashboardStats()
        setData(prev => ({
          ...prev,
          stats,
          lastUpdated: new Date()
        }))
      } catch (error) {
        console.error('Error updating dashboard stats:', error)
      }
    })
    
    listenersRef.current.push(unsubscribeLearners)
  }, [fetchDashboardStats, fetchRecentApplicants])

  // Initial data fetch
  useEffect(() => {
    let isMounted = true

    const fetchInitialData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }))
        
        const [stats, recentApplicants] = await Promise.all([
          fetchDashboardStats(),
          fetchRecentApplicants()
        ])
        
        if (isMounted) {
          setData({
            stats,
            recentApplicants,
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
  }, [fetchDashboardStats, fetchRecentApplicants, setupRealtimeListeners])

  // Manual refresh function
  const refresh = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }))
      
      // Clear cache to force fresh data
      cache.clear()
      
      const [stats, recentApplicants] = await Promise.all([
        fetchDashboardStats(),
        fetchRecentApplicants()
      ])
      
      setData({
        stats,
        recentApplicants,
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
  }, [fetchDashboardStats, fetchRecentApplicants])

  return {
    ...data,
    refresh
  }
}
