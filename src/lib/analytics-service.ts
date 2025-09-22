'use server'

import { adminDb } from '@/lib/firebase-admin'
import { collection, getDocs, query, where, orderBy, limit, startAfter, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface AnalyticsOverview {
  totalUsers: number
  newUsers: number
  activeUsers: number
  totalRevenue: number
  conversionRate: number
  bounceRate: number
}

export interface UserGrowth {
  month: string
  users: number
  revenue: number
}

export interface TopPage {
  page: string
  views: number
  unique: number
  bounce: number
}

export interface UserRole {
  role: string
  count: number
  percentage: number
  color: string
}

export interface RecentActivity {
  action: string
  user: string
  time: string
  type: 'success' | 'warning' | 'info' | 'error'
}

export interface AnalyticsData {
  overview: AnalyticsOverview
  userGrowth: UserGrowth[]
  topPages: TopPage[]
  userRoles: UserRole[]
  recentActivity: RecentActivity[]
}

export async function getAnalyticsData(dateRange: { start: Date; end: Date }): Promise<AnalyticsData> {
  try {
    // Get all users
    const usersSnapshot = await adminDb.collection('users').get()
    const allUsers = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }))

    // Calculate overview metrics
    const totalUsers = allUsers.length
    const newUsers = allUsers.filter(user => 
      user.createdAt >= dateRange.start && user.createdAt <= dateRange.end
    ).length
    const activeUsers = allUsers.filter(user => 
      (user as any).lastLoginAt && 
      (user as any).lastLoginAt.toDate() >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length

    // Calculate user roles
    const roleCounts = allUsers.reduce((acc, user) => {
      const role = (user as any).role || 'unknown'
      acc[role] = (acc[role] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const userRoles: UserRole[] = [
      { role: 'Learners', count: roleCounts.learner || 0, percentage: 0, color: 'bg-blue-500' },
      { role: 'Applicants', count: roleCounts.applicant || 0, percentage: 0, color: 'bg-green-500' },
      { role: 'Admins', count: roleCounts.admin || 0, percentage: 0, color: 'bg-purple-500' },
      { role: 'Super Admins', count: roleCounts['super-admin'] || 0, percentage: 0, color: 'bg-coral' }
    ]

    // Calculate percentages
    userRoles.forEach(role => {
      role.percentage = totalUsers > 0 ? Math.round((role.count / totalUsers) * 100 * 10) / 10 : 0
    })

    // Generate user growth data for the last 6 months
    const userGrowth: UserGrowth[] = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      
      const monthUsers = allUsers.filter(user => 
        user.createdAt >= monthStart && user.createdAt <= monthEnd
      ).length

      userGrowth.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        users: monthUsers,
        revenue: monthUsers * 1000 // Mock revenue calculation
      })
    }

    // Get recent activity from audit logs
    const auditLogsSnapshot = await adminDb
      .collection('auditLogs')
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get()

    const recentActivity: RecentActivity[] = auditLogsSnapshot.docs.map(doc => {
      const data = doc.data()
      const timestamp = data.timestamp?.toDate() || new Date()
      const timeAgo = getTimeAgo(timestamp)
      
      return {
        action: data.action || 'Unknown action',
        user: data.userEmail || data.userId || 'Unknown user',
        time: timeAgo,
        type: getActivityType(data.action)
      }
    })

    // Mock top pages data (would need page analytics implementation)
    const topPages: TopPage[] = [
      { page: '/dashboard', views: Math.floor(Math.random() * 10000) + 5000, unique: Math.floor(Math.random() * 5000) + 3000, bounce: Math.random() * 30 + 20 },
      { page: '/profile', views: Math.floor(Math.random() * 8000) + 3000, unique: Math.floor(Math.random() * 4000) + 2000, bounce: Math.random() * 25 + 15 },
      { page: '/apply', views: Math.floor(Math.random() * 6000) + 2000, unique: Math.floor(Math.random() * 3000) + 1500, bounce: Math.random() * 35 + 25 },
      { page: '/login', views: Math.floor(Math.random() * 5000) + 1000, unique: Math.floor(Math.random() * 2000) + 1000, bounce: Math.random() * 40 + 30 }
    ]

    const overview: AnalyticsOverview = {
      totalUsers,
      newUsers,
      activeUsers,
      totalRevenue: newUsers * 1000, // Mock revenue calculation
      conversionRate: totalUsers > 0 ? Math.round((newUsers / totalUsers) * 100 * 10) / 10 : 0,
      bounceRate: Math.random() * 20 + 30 // Mock bounce rate
    }

    return {
      overview,
      userGrowth,
      topPages,
      userRoles,
      recentActivity
    }
  } catch (error) {
    console.error('Error fetching analytics data:', error)
    throw new Error('Failed to fetch analytics data')
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`
}

function getActivityType(action: string): 'success' | 'warning' | 'info' | 'error' {
  if (action.includes('login') || action.includes('register') || action.includes('complete')) {
    return 'success'
  }
  if (action.includes('error') || action.includes('failed')) {
    return 'error'
  }
  if (action.includes('warning') || action.includes('alert')) {
    return 'warning'
  }
  return 'info'
}
