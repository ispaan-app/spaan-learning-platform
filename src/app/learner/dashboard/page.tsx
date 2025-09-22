'use client'

import { LearnerDashboardClient } from './learner-dashboard-client'
import { getLearnerDashboardData } from '@/lib/learner-dashboard-helpers'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { redirect } from 'next/navigation'
import { LearnerDashboardData } from '@/lib/learner-dashboard-helpers'
import { PageLoader } from '@/components/ui/loading'

export default function LearnerDashboardPage() {
  const { user, userRole, loading } = useAuth()
  const [dashboardData, setDashboardData] = useState<LearnerDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (loading) return

    if (!user) {
      redirect('/login')
      return
    }

    if (userRole !== 'learner') {
      redirect('/unauthorized')
      return
    }

    // Fetch dashboard data
    const loadDashboardData = async () => {
      try {
        setIsLoading(true)
        const data = await getLearnerDashboardData(user.uid)
        setDashboardData(data)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [user?.uid, userRole, loading]) // Only depend on user.uid to prevent unnecessary re-renders

  if (loading || isLoading) {
    return <PageLoader message="Loading your learner dashboard..." />
  }

  if (!dashboardData) {
  return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  return (
    <LearnerDashboardClient 
      initialData={dashboardData}
      user={user!} // We know user is not null at this point due to the redirect check above
    />
  )
}