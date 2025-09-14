// Real database query functions for iSpaan
import { adminDb } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

// User queries
export async function getUserById(userId: string) {
  try {
    const userDoc = await adminDb.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      return null
    }
    return { id: userDoc.id, ...userDoc.data() }
  } catch (error) {
    console.error('Error getting user by ID:', error)
    throw error
  }
}

export async function getUserByIdNumber(idNumber: string) {
  try {
    const usersSnapshot = await adminDb
      .collection('users')
      .where('idNumber', '==', idNumber)
      .limit(1)
      .get()

    if (usersSnapshot.empty) {
      return null
    }

    const userDoc = usersSnapshot.docs[0]
    return { id: userDoc.id, ...userDoc.data() }
  } catch (error) {
    console.error('Error getting user by ID number:', error)
    throw error
  }
}

export async function getUsersByRole(role: string, limit: number = 50) {
  try {
    const usersSnapshot = await adminDb
      .collection('users')
      .where('role', '==', role)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get()

    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting users by role:', error)
    throw error
  }
}

export async function updateUserStatus(userId: string, status: string, updatedBy: string) {
  try {
    await adminDb.collection('users').doc(userId).update({
      status,
      updatedAt: new Date(),
      updatedBy
    })
    return true
  } catch (error) {
    console.error('Error updating user status:', error)
    throw error
  }
}

// Application queries
export async function getApplications(status?: string, limit: number = 50) {
  try {
    let query = adminDb.collection('applications').orderBy('submittedAt', 'desc')
    
    if (status) {
      query = query.where('status', '==', status)
    }
    
    const applicationsSnapshot = await query.limit(limit).get()
    
    return applicationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting applications:', error)
    throw error
  }
}

export async function getApplicationById(applicationId: string) {
  try {
    const applicationDoc = await adminDb.collection('applications').doc(applicationId).get()
    if (!applicationDoc.exists) {
      return null
    }
    return { id: applicationDoc.id, ...applicationDoc.data() }
  } catch (error) {
    console.error('Error getting application by ID:', error)
    throw error
  }
}

// Document queries
export async function getDocumentsByUser(userId: string) {
  try {
    const documentsSnapshot = await adminDb
      .collection('documents')
      .where('userId', '==', userId)
      .orderBy('uploadedAt', 'desc')
      .get()

    return documentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting documents by user:', error)
    throw error
  }
}

export async function getPendingDocuments(limit: number = 50) {
  try {
    const documentsSnapshot = await adminDb
      .collection('documents')
      .where('status', '==', 'pending')
      .orderBy('uploadedAt', 'asc')
      .limit(limit)
      .get()

    return documentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting pending documents:', error)
    throw error
  }
}

// Dashboard statistics
export async function getDashboardStats() {
  try {
    const [
      pendingApplicantsSnapshot,
      totalLearnersSnapshot,
      activePlacementsSnapshot,
      assignedLearnersSnapshot
    ] = await Promise.all([
      adminDb.collection('users').where('role', '==', 'applicant').where('status', '==', 'pending_review').get(),
      adminDb.collection('users').where('role', '==', 'learner').get(),
      adminDb.collection('placements').where('status', '==', 'active').get(),
      adminDb.collection('placements').where('assignedLearners', '>', 0).get()
    ])

    return {
      pendingApplicants: pendingApplicantsSnapshot.size,
      totalLearners: totalLearnersSnapshot.size,
      activePlacements: activePlacementsSnapshot.size,
      assignedLearners: assignedLearnersSnapshot.size
    }
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    throw error
  }
}

// Recent activity queries
export async function getRecentActivity(limit: number = 10) {
  try {
    const activitySnapshot = await adminDb
      .collection('audit-logs')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get()

    return activitySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting recent activity:', error)
    throw error
  }
}

// Placement queries
export async function getPlacements(status?: string, limit: number = 50) {
  try {
    let query = adminDb.collection('placements').orderBy('createdAt', 'desc')
    
    if (status) {
      query = query.where('status', '==', status)
    }
    
    const placementsSnapshot = await query.limit(limit).get()
    
    return placementsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting placements:', error)
    throw error
  }
}

// Work hours queries
export async function getWorkHoursByUser(userId: string, month?: string, year?: number) {
  try {
    let query = adminDb
      .collection('work-hours')
      .where('learnerId', '==', userId)
      .orderBy('date', 'desc')

    if (month && year) {
      const startDate = new Date(year, month === 'all' ? 0 : parseInt(month) - 1, 1)
      const endDate = new Date(year, month === 'all' ? 11 : parseInt(month), 0, 23, 59, 59)
      
      query = query
        .where('date', '>=', startDate)
        .where('date', '<=', endDate)
    }

    const workHoursSnapshot = await query.get()
    
    return workHoursSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting work hours by user:', error)
    throw error
  }
}

// Leave requests queries
export async function getLeaveRequestsByUser(userId: string, status?: string) {
  try {
    let query = adminDb
      .collection('leave-requests')
      .where('learnerId', '==', userId)
      .orderBy('requestedAt', 'desc')

    if (status) {
      query = query.where('status', '==', status)
    }

    const leaveRequestsSnapshot = await query.get()
    
    return leaveRequestsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting leave requests by user:', error)
    throw error
  }
}

export async function getPendingLeaveRequests(limit: number = 50) {
  try {
    const leaveRequestsSnapshot = await adminDb
      .collection('leave-requests')
      .where('status', '==', 'pending')
      .orderBy('requestedAt', 'asc')
      .limit(limit)
      .get()

    return leaveRequestsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting pending leave requests:', error)
    throw error
  }
}

// Announcements queries
export async function getAnnouncements(targetAudience?: string, limit: number = 20) {
  try {
    let query = adminDb
      .collection('announcements')
      .where('published', '==', true)
      .orderBy('publishedAt', 'desc')

    if (targetAudience && targetAudience !== 'all') {
      query = query.where('targetAudience', 'in', [targetAudience, 'all'])
    }

    const announcementsSnapshot = await query.limit(limit).get()
    
    return announcementsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting announcements:', error)
    throw error
  }
}

// Analytics queries
export async function getApplicationStatusData() {
  try {
    const [pendingSnapshot, approvedSnapshot, rejectedSnapshot] = await Promise.all([
      adminDb.collection('users').where('role', '==', 'applicant').where('status', '==', 'pending_review').get(),
      adminDb.collection('users').where('role', '==', 'learner').get(),
      adminDb.collection('users').where('role', '==', 'applicant').where('status', '==', 'rejected').get()
    ])

    return {
      pending: pendingSnapshot.size,
      approved: approvedSnapshot.size,
      rejected: rejectedSnapshot.size
    }
  } catch (error) {
    console.error('Error getting application status data:', error)
    throw error
  }
}

export async function getLearnerProgramData() {
  try {
    const learnersSnapshot = await adminDb
      .collection('users')
      .where('role', '==', 'learner')
      .get()

    const programCounts: { [key: string]: number } = {}
    
    learnersSnapshot.docs.forEach(doc => {
      const data = doc.data()
      const program = data.program || 'Unknown'
      programCounts[program] = (programCounts[program] || 0) + 1
    })

    return Object.entries(programCounts).map(([program, count]) => ({
      program,
      count
    }))
  } catch (error) {
    console.error('Error getting learner program data:', error)
    throw error
  }
}

export async function getPlacementStatusData() {
  try {
    const [activeSnapshot, fullSnapshot, inactiveSnapshot] = await Promise.all([
      adminDb.collection('placements').where('status', '==', 'active').get(),
      adminDb.collection('placements').where('status', '==', 'full').get(),
      adminDb.collection('placements').where('status', '==', 'inactive').get()
    ])

    return {
      active: activeSnapshot.size,
      full: fullSnapshot.size,
      inactive: inactiveSnapshot.size
    }
  } catch (error) {
    console.error('Error getting placement status data:', error)
    throw error
  }
}

// Utility function to serialize Firestore data
export function serializeFirestoreData(data: any): any {
  if (data === null || data === undefined) {
    return data
  }
  
  if (data instanceof Timestamp) {
    return data.toDate().toISOString()
  }
  
  if (Array.isArray(data)) {
    return data.map(serializeFirestoreData)
  }
  
  if (typeof data === 'object') {
    const serialized: any = {}
    for (const [key, value] of Object.entries(data)) {
      serialized[key] = serializeFirestoreData(value)
    }
    return serialized
  }
  
  return data
}

