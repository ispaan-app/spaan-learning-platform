'use server'

import { adminDb } from '@/lib/firebase-admin'

export interface AdminStats {
  pendingApplicants: number
  totalLearners: number
  activePlacements: number
  assignedLearners: number
  totalApplications: number
  approvedApplications: number
  rejectedApplications: number
  activeClasses: number
}

export interface RecentApplicant {
  id: string
  firstName: string
  lastName: string
  email: string
  program: string
  applicationDate: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface RecentLearner {
  id: string
  firstName: string
  lastName: string
  email: string
  program: string
  joinedDate: string
  status: 'active' | 'inactive' | 'graduated'
  progress: number
}

export interface RecentActivity {
  id: string
  type: 'application' | 'placement' | 'class' | 'system'
  title: string
  description: string
  timestamp: string
  user?: string
}

export interface AdminDashboardData {
  stats: AdminStats
  recentApplicants: RecentApplicant[]
  recentLearners: RecentLearner[]
  recentActivities: RecentActivity[]
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  try {
    // Get all users
    const usersSnapshot = await adminDb.collection('users').get()
    const allUsers = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }))

    // Get applications
    const applicationsSnapshot = await adminDb.collection('applications').get()
    const allApplications = applicationsSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        submittedAt: data.submittedAt?.toDate() || new Date()
      }
    })

    // Get placements
    const placementsSnapshot = await adminDb.collection('placements').get()
    const allPlacements = placementsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }))

    // Get class sessions
    const classSessionsSnapshot = await adminDb.collection('classSessions').get()
    const allClassSessions = classSessionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }))

    // Calculate stats
    const stats: AdminStats = {
      pendingApplicants: allApplications.filter(app => (app as any).status === 'pending').length,
      totalLearners: allUsers.filter(user => (user as any).role === 'learner').length,
      activePlacements: allPlacements.filter(placement => (placement as any).status === 'active').length,
      assignedLearners: allPlacements.filter(placement => (placement as any).learnerId).length,
      totalApplications: allApplications.length,
      approvedApplications: allApplications.filter(app => (app as any).status === 'approved').length,
      rejectedApplications: allApplications.filter(app => (app as any).status === 'rejected').length,
      activeClasses: allClassSessions.filter(session => (session as any).status === 'active').length
    }

    // Get recent applicants (last 5)
    const recentApplicants: RecentApplicant[] = allApplications
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
      .slice(0, 5)
      .map(app => ({
        id: app.id,
        firstName: (app as any).firstName || 'Unknown',
        lastName: (app as any).lastName || 'Unknown',
        email: (app as any).email || 'No email',
        program: (app as any).program || 'Unknown Program',
        applicationDate: app.submittedAt.toISOString().split('T')[0],
        status: (app as any).status || 'pending'
      }))

    // Get recent learners (last 5)
    const recentLearners: RecentLearner[] = allUsers
      .filter(user => (user as any).role === 'learner')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map(user => ({
        id: user.id,
        firstName: (user as any).firstName || 'Unknown',
        lastName: (user as any).lastName || 'Unknown',
        email: (user as any).email || 'No email',
        program: (user as any).program || 'Unknown Program',
        joinedDate: user.createdAt.toISOString().split('T')[0],
        status: (user as any).status || 'active',
        progress: Math.floor(Math.random() * 100) // Mock progress for now
      }))

    // Get recent activities from audit logs
    const auditLogsSnapshot = await adminDb
      .collection('auditLogs')
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get()

    const recentActivities: RecentActivity[] = auditLogsSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        type: getActivityType(data.action),
        title: data.action || 'Unknown Action',
        description: data.description || 'No description available',
        timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
        user: data.userEmail || data.userId
      }
    })

    return {
      stats,
      recentApplicants,
      recentLearners,
      recentActivities
    }
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error)
    throw new Error('Failed to fetch admin dashboard data')
  }
}

function getActivityType(action: string): 'application' | 'placement' | 'class' | 'system' {
  if (action.includes('application') || action.includes('apply')) {
    return 'application'
  }
  if (action.includes('placement') || action.includes('assign')) {
    return 'placement'
  }
  if (action.includes('class') || action.includes('session')) {
    return 'class'
  }
  return 'system'
}
