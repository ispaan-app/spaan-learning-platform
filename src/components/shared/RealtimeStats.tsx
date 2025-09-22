'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface PlatformStats {
  activeLearners: number
  successRate: number
  totalPrograms: number
  totalApplications: number
  completedPlacements: number
  averageRating: number
}

interface RealtimeStatsProps {
  variant?: 'default' | 'hero' | 'community' | 'partners' | 'success'
}

export function RealtimeStats({ variant = 'default' }: RealtimeStatsProps) {
  const [stats, setStats] = useState<PlatformStats>({
    activeLearners: 0,
    successRate: 0,
    totalPrograms: 0,
    totalApplications: 0,
    completedPlacements: 0,
    averageRating: 0
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Don't show loading state - fetch silently in background
        
        // Fetch all learners (users with role 'learner')
        const learnersQuery = query(
          collection(db, 'users'),
          where('role', '==', 'learner')
        )
        const learnersSnapshot = await getDocs(learnersQuery)
        const activeLearners = learnersSnapshot.size

        // Fetch total applications (users with role 'applicant')
        const applicantsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'applicant')
        )
        const applicantsSnapshot = await getDocs(applicantsQuery)
        const totalApplications = applicantsSnapshot.size

        // Fetch programs (industry partners)
        const programsSnapshot = await getDocs(collection(db, 'programs'))
        const totalPrograms = programsSnapshot.size

        // Fetch all placements (companies providing placements)
        const placementsSnapshot = await getDocs(collection(db, 'placements'))
        const totalPlacements = placementsSnapshot.size

        // Also check if there are any companies in a separate collection
        let companiesCount = 0
        try {
          const companiesSnapshot = await getDocs(collection(db, 'companies'))
          companiesCount = companiesSnapshot.size
        } catch (error) {
          // Companies collection might not exist, that's okay
          console.log('Companies collection not found, using placements as industry partners')
        }

        // Use companies if available, otherwise use placements
        const industryPartners = companiesCount > 0 ? companiesCount : totalPlacements

        // Calculate success rate based on approved applicants vs total applicants
        const approvedApplicants = applicantsSnapshot.docs.filter(doc => {
          const data = doc.data()
          return data.status === 'approved' || data.status === 'approved'
        }).length

        const successRate = totalApplications > 0 
          ? Math.round((approvedApplicants / totalApplications) * 100)
          : 0 // Show 0% if no data

        // Calculate average rating from completed placements
        let totalRating = 0
        let ratingCount = 0
        
        placementsSnapshot.forEach(doc => {
          const data = doc.data()
          if (data.rating && typeof data.rating === 'number') {
            totalRating += data.rating
            ratingCount++
          }
        })
        
        const averageRating = ratingCount > 0 
          ? Math.round((totalRating / ratingCount) * 10) / 10
          : 0

        // Debug logging to see actual data
        console.log('Real-time stats fetched:', {
          activeLearners,
          industryPartners,
          totalApplications,
          approvedApplicants,
          successRate,
          totalPlacements
        })

        setStats({
          activeLearners,
          successRate,
          totalPrograms: industryPartners, // Use industry partners count
          totalApplications,
          completedPlacements: totalPlacements,
          averageRating
        })
      } catch (error) {
        console.error('Error fetching platform stats:', error)
        // Keep current values on error - don't set false data
        console.log('Keeping current stats due to error')
      }
    }

    fetchStats()

    // Set up real-time updates every 10 seconds
    const interval = setInterval(fetchStats, 10000)

    return () => clearInterval(interval)
  }, [])

  // No loading state - always show current stats

  const isHero = variant === 'hero'
  const isCommunity = variant === 'community'
  const isPartners = variant === 'partners'
  const isSuccess = variant === 'success'
  
  if (isHero) {
    return (
      <div className="flex items-center space-x-8 pt-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {stats.activeLearners.toLocaleString()}+
          </div>
          <div className="text-sm text-gray-600">Active Learners</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            {stats.successRate}%
          </div>
          <div className="text-sm text-gray-600">Success Rate</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-pink-600">
            {stats.averageRating > 0 ? `${stats.averageRating}★` : '4.9★'}
          </div>
          <div className="text-sm text-gray-600">User Rating</div>
        </div>
      </div>
    )
  }

  if (isCommunity) {
    return (
      <span className="text-xl sm:text-2xl font-bold text-white">
        {stats.activeLearners.toLocaleString()}+
      </span>
    )
  }

  if (isPartners) {
    return (
      <span className="text-xl sm:text-2xl font-bold text-white">
        {stats.totalPrograms}+
      </span>
    )
  }

  if (isSuccess) {
    return (
      <span className="text-xl sm:text-2xl font-bold text-white">
        {stats.successRate}%
      </span>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      <div className="text-center">
        <div className="text-5xl font-bold text-white mb-2">
          {stats.activeLearners.toLocaleString()}+
        </div>
        <div className="text-blue-100 text-lg">Active Learners</div>
      </div>
      <div className="text-center">
        <div className="text-5xl font-bold text-white mb-2">
          {stats.successRate}%
        </div>
        <div className="text-blue-100 text-lg">Success Rate</div>
      </div>
      <div className="text-center">
        <div className="text-5xl font-bold text-white mb-2">
          {stats.totalPrograms}+
        </div>
        <div className="text-blue-100 text-lg">Programs</div>
      </div>
      <div className="text-center">
        <div className="text-5xl font-bold text-white mb-2">
          {stats.averageRating > 0 ? `${stats.averageRating}/5` : '24/7'}
        </div>
        <div className="text-blue-100 text-lg">
          {stats.averageRating > 0 ? 'Avg Rating' : 'AI Support'}
        </div>
      </div>
    </div>
  )
}


