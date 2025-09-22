'use server'

import { adminDb } from '@/lib/firebase-admin'
import { CheckCircle, BookOpen, FileText, Award, Building2, Activity } from 'lucide-react'

export interface LearnerStats {
  workHours: number
  targetHours: number
  completedCourses: number
  certificates: number
  upcomingClasses: number
  leaveRequests: number
  pendingDocuments: number
  placementStatus: 'active' | 'inactive' | 'completed' | 'unplaced' | 'pending'
}

export interface RecentActivity {
  id: string
  type: 'success' | 'info' | 'warning' | 'error'
  title: string
  description: string
  time: string
  icon: React.ElementType
}

export interface UpcomingClass {
  id: string
  title: string
  date: string
  time: string
  location: string
  instructor: string
  type: 'lecture' | 'workshop' | 'seminar' | 'practical'
}

export interface LearnerDashboardData {
  stats: LearnerStats
  recentActivity: RecentActivity[]
  upcomingClasses: UpcomingClass[]
}

export async function getLearnerDashboardData(userId: string): Promise<LearnerDashboardData> {
  try {
    // Get learner data
    const learnerDoc = await adminDb.collection('users').doc(userId).get()
    if (!learnerDoc.exists) {
      throw new Error('Learner not found')
    }

    const learnerData = learnerDoc.data()!

    // Get attendance records for work hours calculation
    const attendanceSnapshot = await adminDb
      .collection('attendance')
      .where('userId', '==', userId)
      .get()

    const totalWorkHours = attendanceSnapshot.docs.reduce((total, doc) => {
      const data = doc.data()
      return total + (data.totalHours || 0)
    }, 0)

    // Get placement data
    const placementSnapshot = await adminDb
      .collection('placements')
      .where('learnerId', '==', userId)
      .get()

    const placementStatus = placementSnapshot.empty ? 'unplaced' : 
      placementSnapshot.docs[0].data().status || 'unplaced'

    // Get leave requests
    const leaveRequestsSnapshot = await adminDb
      .collection('leaveRequests')
      .where('userId', '==', userId)
      .get()

    const leaveRequests = leaveRequestsSnapshot.docs.length

    // Get class sessions
    const classSessionsSnapshot = await adminDb
      .collection('classSessions')
      .where('status', '==', 'active')
      .get()

    const upcomingClasses: UpcomingClass[] = classSessionsSnapshot.docs
      .slice(0, 3)
      .map(doc => {
        const data = doc.data()
        const sessionDate = data.date?.toDate() || new Date()
        return {
          id: doc.id,
          title: data.title || 'Class Session',
          date: sessionDate.toISOString().split('T')[0],
          time: data.time || 'TBD',
          location: data.location || 'TBD',
          instructor: data.instructor || 'TBD',
          type: data.type || 'lecture'
        }
      })

    // Get recent activities from audit logs
    const auditLogsSnapshot = await adminDb
      .collection('auditLogs')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(5)
      .get()

    const recentActivity: RecentActivity[] = auditLogsSnapshot.docs.map(doc => {
      const data = doc.data()
      const timestamp = data.timestamp?.toDate() || new Date()
      const timeAgo = getTimeAgo(timestamp)
      
      return {
        id: doc.id,
        type: getActivityType(data.action),
        title: data.action || 'Activity',
        description: data.description || 'No description',
        time: timeAgo,
        icon: getActivityIcon(data.action)
      }
    })

    const stats: LearnerStats = {
      workHours: totalWorkHours,
      targetHours: 160, // Default target
      completedCourses: 8, // Mock for now
      certificates: 3, // Mock for now
      upcomingClasses: upcomingClasses.length,
      leaveRequests,
      pendingDocuments: 2, // Mock for now
      placementStatus: placementStatus as any
    }

    return {
      stats,
      recentActivity,
      upcomingClasses
    }
  } catch (error) {
    console.error('Error fetching learner dashboard data:', error)
    throw new Error('Failed to fetch learner dashboard data')
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

function getActivityType(action: string): 'success' | 'info' | 'warning' | 'error' {
  if (action.includes('check') || action.includes('complete') || action.includes('earn')) {
    return 'success'
  }
  if (action.includes('error') || action.includes('fail')) {
    return 'error'
  }
  if (action.includes('warning') || action.includes('alert')) {
    return 'warning'
  }
  return 'info'
}

function getActivityIcon(action: string): React.ElementType {
  if (action.includes('check')) return CheckCircle
  if (action.includes('course') || action.includes('class')) return BookOpen
  if (action.includes('document')) return FileText
  if (action.includes('certificate')) return Award
  if (action.includes('placement')) return Building2
  return Activity
}
