'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'

interface DashboardStats {
  pendingApplicants: number
  totalLearners: number
  activePlacements: number
  assignedLearners: number
}

export default function StableAdminDashboard() {
  const { user, userData, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    pendingApplicants: 0,
    totalLearners: 0,
    activePlacements: 0,
    assignedLearners: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Memoized function to fetch stats
  const fetchStats = useCallback(async () => {
    if (!user) return

    try {
      setError(null)
      setLoading(true)

      // Fetch all data in parallel
      const [applicantsSnapshot, learnersSnapshot, placementsSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'users'), where('role', '==', 'applicant'))),
        getDocs(query(collection(db, 'users'), where('role', '==', 'learner'))),
        getDocs(collection(db, 'placements'))
      ])

      // Process applicants
      const applicants = applicantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any))
      const pendingApplicants = applicants.filter((app: any) => app.status === 'pending-review').length
      const approvedApplicants = applicants.filter((app: any) => app.status === 'approved').length
      const rejectedApplicants = applicants.filter((app: any) => app.status === 'rejected').length

      // Process learners
      const learners = learnersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any))
      const totalLearners = learners.length

      // Process placements
      const placements = placementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any))
      const activePlacements = placements.filter((placement: any) => placement.status === 'active').length
      const assignedLearners = placements.filter((placement: any) => placement.assignedLearnerId).length

      setStats({
        pendingApplicants,
        totalLearners,
        activePlacements,
        assignedLearners
      })

      setLastUpdate(new Date())
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Load data on mount and when user changes
  useEffect(() => {
    if (user && !authLoading) {
      fetchStats()
    }
  }, [user, authLoading, fetchStats])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      fetchStats()
    }, 30000)

    return () => clearInterval(interval)
  }, [user, fetchStats])

  if (authLoading) {
    return (
      <AdminLayout userRole="admin">
        <div className="p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </AdminLayout>
    )
  }

  if (!user) {
    return (
      <AdminLayout userRole="admin">
        <div className="p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">Please log in to access this page.</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout userRole="admin">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {userData?.firstName || user.email}</p>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-red-800">Error Loading Data</h3>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
            <Button 
              onClick={fetchStats}
              disabled={loading}
              className="mt-3"
              size="sm"
            >
              {loading ? 'Retrying...' : 'Retry'}
            </Button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applicants</CardTitle>
              <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.pendingApplicants}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Learners</CardTitle>
              <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalLearners}</div>
              <p className="text-xs text-muted-foreground">Currently enrolled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Placements</CardTitle>
              <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.activePlacements}</div>
              <p className="text-xs text-muted-foreground">Work opportunities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned Learners</CardTitle>
              <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.assignedLearners}</div>
              <p className="text-xs text-muted-foreground">With placements</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => window.location.href = '/admin/applicants'}
                className="h-20 flex flex-col items-center justify-center"
              >
                <svg className="h-6 w-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Review Applications
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/admin/learners'}
                className="h-20 flex flex-col items-center justify-center"
              >
                <svg className="h-6 w-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Manage Learners
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/admin/placements'}
                className="h-20 flex flex-col items-center justify-center"
              >
                <svg className="h-6 w-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Manage Placements
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <div className="text-center text-sm text-gray-500">
          {loading ? 'Loading...' : `Dashboard updated at ${lastUpdate.toLocaleTimeString()}`}
        </div>
      </div>
    </AdminLayout>
  )
}
