// Real-time data integration for iSpaan
import { adminDb } from '@/lib/firebase-admin'
import { onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Real-time data hooks for client-side components
export class RealtimeDataManager {
  private subscriptions: Map<string, () => void> = new Map()

  // Subscribe to user data changes
  subscribeToUser(userId: string, callback: (user: any) => void) {
    const unsubscribe = onSnapshot(
      query(collection(db, 'users'), where('__name__', '==', userId)),
      (snapshot) => {
        if (!snapshot.empty) {
          const userDoc = snapshot.docs[0]
          callback({ id: userDoc.id, ...userDoc.data() })
        }
      },
      (error) => {
        console.error('Error in user subscription:', error)
        // Don't crash on network errors
        if (error.code !== 'unavailable' && error.code !== 'deadline-exceeded') {
          throw error
        }
      }
    )

    this.subscriptions.set(`user-${userId}`, unsubscribe)
    return unsubscribe
  }

  // Subscribe to applications for admin dashboard
  subscribeToApplications(callback: (applications: any[]) => void) {
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'users'),
        where('role', '==', 'applicant'),
        orderBy('createdAt', 'desc'),
        limit(10)
      ),
      (snapshot) => {
        const applications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        callback(applications)
      }
    )

    this.subscriptions.set('applications', unsubscribe)
    return unsubscribe
  }

  // Subscribe to learners for admin dashboard
  subscribeToLearners(callback: (learners: any[]) => void) {
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'users'),
        where('role', '==', 'learner'),
        orderBy('createdAt', 'desc'),
        limit(50)
      ),
      (snapshot) => {
        const learners = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        callback(learners)
      }
    )

    this.subscriptions.set('learners', unsubscribe)
    return unsubscribe
  }

  // Subscribe to work hours for a specific learner
  subscribeToWorkHours(learnerId: string, callback: (workHours: any[]) => void) {
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'work-hours'),
        where('learnerId', '==', learnerId),
        orderBy('date', 'desc'),
        limit(30)
      ),
      (snapshot) => {
        const workHours = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        callback(workHours)
      }
    )

    this.subscriptions.set(`work-hours-${learnerId}`, unsubscribe)
    return unsubscribe
  }

  // Subscribe to leave requests for a specific learner
  subscribeToLeaveRequests(learnerId: string, callback: (leaveRequests: any[]) => void) {
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'leave-requests'),
        where('learnerId', '==', learnerId),
        orderBy('requestedAt', 'desc'),
        limit(20)
      ),
      (snapshot) => {
        const leaveRequests = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        callback(leaveRequests)
      }
    )

    this.subscriptions.set(`leave-requests-${learnerId}`, unsubscribe)
    return unsubscribe
  }

  // Subscribe to pending leave requests for admin
  subscribeToPendingLeaveRequests(callback: (leaveRequests: any[]) => void) {
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'leave-requests'),
        where('status', '==', 'pending'),
        orderBy('requestedAt', 'asc'),
        limit(20)
      ),
      (snapshot) => {
        const leaveRequests = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        callback(leaveRequests)
      }
    )

    this.subscriptions.set('pending-leave-requests', unsubscribe)
    return unsubscribe
  }

  // Subscribe to announcements
  subscribeToAnnouncements(targetAudience?: string, callback?: (announcements: any[]) => void) {
    let q = query(
      collection(db, 'announcements'),
      where('published', '==', true),
      orderBy('publishedAt', 'desc'),
      limit(20)
    )

    if (targetAudience && targetAudience !== 'all') {
      q = query(
        collection(db, 'announcements'),
        where('published', '==', true),
        where('targetAudience', 'in', [targetAudience, 'all']),
        orderBy('publishedAt', 'desc'),
        limit(20)
      )
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const announcements = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      if (callback) callback(announcements)
    })

    this.subscriptions.set(`announcements-${targetAudience || 'all'}`, unsubscribe)
    return unsubscribe
  }

  // Subscribe to audit logs for admin dashboards
  subscribeToAuditLogs(callback: (logs: any[]) => void) {
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'audit-logs'),
        orderBy('timestamp', 'desc'),
        limit(20)
      ),
      (snapshot) => {
        const logs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        callback(logs)
      }
    )

    this.subscriptions.set('audit-logs', unsubscribe)
    return unsubscribe
  }

  // Subscribe to documents for a specific user
  subscribeToDocuments(userId: string, callback: (documents: any[]) => void) {
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'documents'),
        where('userId', '==', userId),
        orderBy('uploadedAt', 'desc')
      ),
      (snapshot) => {
        const documents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        callback(documents)
      }
    )

    this.subscriptions.set(`documents-${userId}`, unsubscribe)
    return unsubscribe
  }

  // Subscribe to pending documents for admin
  subscribeToPendingDocuments(callback: (documents: any[]) => void) {
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'documents'),
        where('status', '==', 'pending'),
        orderBy('uploadedAt', 'asc'),
        limit(20)
      ),
      (snapshot) => {
        const documents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        callback(documents)
      }
    )

    this.subscriptions.set('pending-documents', unsubscribe)
    return unsubscribe
  }

  // Subscribe to placements
  subscribeToPlacements(callback: (placements: any[]) => void) {
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'placements'),
        orderBy('createdAt', 'desc'),
        limit(50)
      ),
      (snapshot) => {
        const placements = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        callback(placements)
      }
    )

    this.subscriptions.set('placements', unsubscribe)
    return unsubscribe
  }

  // Subscribe to dashboard statistics
  subscribeToDashboardStats(callback: (stats: any) => void) {
    const unsubscribe = onSnapshot(
      query(collection(db, 'users')),
      (snapshot) => {
        const users = snapshot.docs.map(doc => doc.data())
        
        const stats = {
          totalUsers: users.length,
          totalLearners: users.filter(u => u.role === 'learner').length,
          totalApplicants: users.filter(u => u.role === 'applicant').length,
          totalAdmins: users.filter(u => u.role === 'admin' || u.role === 'super-admin').length,
          pendingApplicants: users.filter(u => u.role === 'applicant' && u.status === 'pending_review').length
        }
        
        callback(stats)
      }
    )

    this.subscriptions.set('dashboard-stats', unsubscribe)
    return unsubscribe
  }

  // Clean up all subscriptions
  cleanup() {
    this.subscriptions.forEach(unsubscribe => unsubscribe())
    this.subscriptions.clear()
  }

  // Clean up specific subscription
  unsubscribe(key: string) {
    const unsubscribe = this.subscriptions.get(key)
    if (unsubscribe) {
      unsubscribe()
      this.subscriptions.delete(key)
    }
  }
}

// Singleton instance
export const realtimeManager = new RealtimeDataManager()

// Server-side real-time data functions
export class ServerRealtimeData {
  // Get real-time user data
  static async getUserData(userId: string) {
    try {
      const userDoc = await adminDb.collection('users').doc(userId).get()
      if (!userDoc.exists) {
        return null
      }
      return { id: userDoc.id, ...userDoc.data() }
    } catch (error) {
      console.error('Error getting user data:', error)
      throw error
    }
  }

  // Get real-time dashboard stats
  static async getDashboardStats() {
    try {
      const [usersSnapshot, placementsSnapshot] = await Promise.all([
        adminDb.collection('users').get(),
        adminDb.collection('placements').get()
      ])

      const users = usersSnapshot.docs.map(doc => doc.data())
      const placements = placementsSnapshot.docs.map(doc => doc.data())

      return {
        totalUsers: users.length,
        totalLearners: users.filter(u => u.role === 'learner').length,
        totalApplicants: users.filter(u => u.role === 'applicant').length,
        totalAdmins: users.filter(u => u.role === 'admin' || u.role === 'super-admin').length,
        pendingApplicants: users.filter(u => u.role === 'applicant' && u.status === 'pending_review').length,
        activePlacements: placements.filter(p => p.status === 'active').length,
        assignedLearners: placements.filter(p => p.assignedLearnerId).length
      }
    } catch (error) {
      console.error('Error getting dashboard stats:', error)
      throw error
    }
  }

  // Get real-time learner data with work hours
  static async getLearnerData(learnerId: string) {
    try {
      const [learnerDoc, workHoursSnapshot, leaveRequestsSnapshot] = await Promise.all([
        adminDb.collection('users').doc(learnerId).get(),
        adminDb.collection('work-hours')
          .where('learnerId', '==', learnerId)
          .orderBy('date', 'desc')
          .limit(30)
          .get(),
        adminDb.collection('leave-requests')
          .where('learnerId', '==', learnerId)
          .orderBy('requestedAt', 'desc')
          .limit(10)
          .get()
      ])

      if (!learnerDoc.exists) {
        return null
      }

      const learner = { id: learnerDoc.id, ...learnerDoc.data() }
      const workHours = workHoursSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      const leaveRequests = leaveRequestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      // Calculate monthly hours
      const currentMonth = new Date()
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

      const monthlyWorkHours = workHours
        .filter(wh => {
          const workDate = (wh as any).date?.toDate()
          return workDate && workDate >= monthStart && workDate <= monthEnd
        })
        .reduce((total, wh) => total + ((wh as any).hours || 0), 0)

      return {
        ...learner,
        workHours,
        leaveRequests,
        monthlyHours: monthlyWorkHours,
        targetHours: 160 // Default target
      }
    } catch (error) {
      console.error('Error getting learner data:', error)
      throw error
    }
  }

  // Get real-time application data
  static async getApplicationData(applicationId: string) {
    try {
      const [applicationDoc, documentsSnapshot] = await Promise.all([
        adminDb.collection('applications').doc(applicationId).get(),
        adminDb.collection('documents')
          .where('applicationId', '==', applicationId)
          .get()
      ])

      if (!applicationDoc.exists) {
        return null
      }

      const application = { id: applicationDoc.id, ...applicationDoc.data() }
      const documents = documentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      return {
        ...application,
        documents
      }
    } catch (error) {
      console.error('Error getting application data:', error)
      throw error
    }
  }
}

// Export types
export interface RealtimeUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface RealtimeWorkHours {
  id: string
  learnerId: string
  date: string
  hours: number
  description: string
  location: string
  verified: boolean
}

export interface RealtimeLeaveRequest {
  id: string
  learnerId: string
  type: string
  startDate: string
  endDate: string
  reason: string
  status: string
  requestedAt: string
}

export interface RealtimeDocument {
  id: string
  userId: string
  type: string
  fileName: string
  status: string
  uploadedAt: string
  reviewedAt?: string
  reviewedBy?: string
}
