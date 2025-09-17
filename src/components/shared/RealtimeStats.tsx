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
  variant?: 'default' | 'hero'
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        
        // Fetch active learners (users with role 'learner' and status 'active')
        const learnersQuery = query(
          collection(db, 'users'),
          where('role', '==', 'learner'),
          where('status', '==', 'active')
        )
        const learnersSnapshot = await getDocs(learnersQuery)
        const activeLearners = learnersSnapshot.size

        // Fetch total applications
        const applicationsSnapshot = await getDocs(collection(db, 'applications'))
        const totalApplications = applicationsSnapshot.size

        // Fetch programs
        const programsSnapshot = await getDocs(collection(db, 'programs'))
        const totalPrograms = programsSnapshot.size

        // Fetch completed placements
        const placementsQuery = query(
          collection(db, 'placements'),
          where('status', '==', 'completed')
        )
        const placementsSnapshot = await getDocs(placementsQuery)
        const completedPlacements = placementsSnapshot.size

        // Calculate success rate (completed placements / total applications * 100)
        const successRate = totalApplications > 0 
          ? Math.round((completedPlacements / totalApplications) * 100)
          : 0

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

        setStats({
          activeLearners,
          successRate,
          totalPrograms,
          totalApplications,
          completedPlacements,
          averageRating
        })
      } catch (error) {
        console.error('Error fetching platform stats:', error)
        // Fallback to default values
        setStats({
          activeLearners: 0,
          successRate: 0,
          totalPrograms: 0,
          totalApplications: 0,
          completedPlacements: 0,
          averageRating: 0
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchStats, 30000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    const isHero = variant === 'hero'
    return (
      <div className={`flex items-center space-x-8 ${isHero ? 'pt-8' : 'grid grid-cols-2 md:grid-cols-4 gap-8'}`}>
        {[...Array(isHero ? 3 : 4)].map((_, i) => (
          <div key={i} className="text-center">
            <div className={`${isHero ? 'text-3xl' : 'text-5xl'} font-bold ${isHero ? 'text-blue-600' : 'text-white'} mb-2 animate-pulse`}>
              <div className={`h-8 ${isHero ? 'bg-blue-300' : 'bg-blue-300'} rounded`}></div>
            </div>
            <div className={`text-sm ${isHero ? 'text-gray-600' : 'text-blue-100 text-lg'} animate-pulse`}>
              <div className={`h-4 ${isHero ? 'bg-gray-300' : 'bg-blue-200'} rounded`}></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const isHero = variant === 'hero'
  
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


