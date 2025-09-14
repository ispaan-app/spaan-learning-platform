'use server'

import { adminDb } from '@/lib/firebase-admin'
import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore'
import { revalidatePath } from 'next/cache'

export interface StipendReport {
  id?: string
  learnerId: string
  learnerName: string
  placementId: string
  companyName: string
  month: string
  year: number
  status: 'pending' | 'resolved'
  submittedAt: Date
  resolvedAt?: Date
  resolvedBy?: string
  notes?: string
}

export interface LeaveRequest {
  id?: string
  userId: string
  userName: string
  userEmail: string
  type: 'sick' | 'personal' | 'emergency' | 'other'
  startDate: string
  endDate: string
  days: number
  reason: string
  emergencyContact: string
  emergencyPhone: string
  supportingDocuments?: string
  notes?: string
  placementInfo?: {
    id: string
    companyName: string
    position: string
  } | null
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  submittedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
  adminNotes?: string
  rejectionReason?: string
}

export interface IssueReport {
  id?: string
  userId: string
  userName: string
  userEmail: string
  userRole: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  description: string
  location?: string
  contactMethod: 'email' | 'phone'
  contactInfo: string
  placementInfo?: {
    id: string
    companyName: string
    position: string
  } | null
  deviceInfo: {
    userAgent: string
    platform: string
    language: string
    timezone: string
  }
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  assignedTo?: string
  submittedAt: Date
  updatedAt: Date
  resolvedAt?: Date
  resolution?: string
  adminNotes?: string
}

export async function submitLeaveRequestAction(data: {
  userId: string
  userName: string
  userEmail: string
  type: string
  startDate: string
  endDate: string
  days: number
  reason: string
  emergencyContact: string
  emergencyPhone: string
  supportingDocuments?: string
  notes?: string
  placementInfo?: {
    id: string
    companyName: string
    position: string
  } | null
}) {
  try {
    // Create leave request
    const leaveRequest: Omit<LeaveRequest, 'id'> = {
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      type: data.type as any,
      startDate: data.startDate,
      endDate: data.endDate,
      days: data.days,
      reason: data.reason,
      emergencyContact: data.emergencyContact,
      emergencyPhone: data.emergencyPhone,
      supportingDocuments: data.supportingDocuments,
      notes: data.notes,
      placementInfo: data.placementInfo,
      status: 'pending',
      submittedAt: new Date()
    }

    // Add to Firestore
    const docRef = await adminDb.collection('leaveRequests').add(leaveRequest)

    // Create notification for administrators
    await createLeaveNotification(docRef.id, data)

    revalidatePath('/learner/leave')
    revalidatePath('/admin/leave-requests')
    revalidatePath('/super-admin/leave-requests')

    return { success: true, requestId: docRef.id }
  } catch (error) {
    console.error('Error submitting leave request:', error)
    return { success: false, error: 'Failed to submit leave request' }
  }
}

export async function getLeaveRequestsAction(userId: string): Promise<LeaveRequest[]> {
  try {
    const leaveRequestsRef = collection(db, 'leaveRequests')
    const leaveRequestsQuery = query(
      leaveRequestsRef,
      where('userId', '==', userId),
      orderBy('submittedAt', 'desc')
    )
    const snapshot = await getDocs(leaveRequestsQuery)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt.toDate(),
      reviewedAt: doc.data().reviewedAt?.toDate()
    })) as LeaveRequest[]
  } catch (error) {
    console.error('Error fetching leave requests:', error)
    return []
  }
}

export async function cancelLeaveRequestAction(requestId: string, userId: string) {
  try {
    const leaveRequestRef = doc(db, 'leaveRequests', requestId)
    await updateDoc(leaveRequestRef, {
      status: 'cancelled',
      reviewedAt: new Date()
    })

    revalidatePath('/learner/leave')
    revalidatePath('/admin/leave-requests')
    revalidatePath('/super-admin/leave-requests')

    return { success: true }
  } catch (error) {
    console.error('Error cancelling leave request:', error)
    return { success: false, error: 'Failed to cancel leave request' }
  }
}

async function createLeaveNotification(requestId: string, data: any) {
  try {
    // Get all administrators (admin and super-admin)
    const usersRef = collection(db, 'users')
    const adminQuery = query(
      usersRef,
      where('role', 'in', ['admin', 'super-admin'])
    )
    const adminSnapshot = await getDocs(adminQuery)

    // Create notifications for each administrator
    const notifications = adminSnapshot.docs.map(doc => ({
      userId: doc.id,
      type: 'leave_request',
      title: 'New Leave Request',
      message: `${data.userName} submitted a ${data.type} leave request for ${data.days} day(s)`,
      data: {
        requestId,
        userId: data.userId,
        userName: data.userName,
        type: data.type,
        days: data.days,
        startDate: data.startDate,
        endDate: data.endDate
      },
      read: false,
      createdAt: new Date()
    }))

    // Add notifications to Firestore
    const notificationsRef = collection(db, 'notifications')
    for (const notification of notifications) {
      await addDoc(notificationsRef, notification)
    }

  } catch (error) {
    console.error('Error creating leave notifications:', error)
  }
}

export async function reportStipendIssueAction(data: {
  learnerId: string
  learnerName: string
  placementId: string
  companyName: string
  month: string
  year: number
}) {
  try {
    // Create stipend report
    const stipendReport: Omit<StipendReport, 'id'> = {
      learnerId: data.learnerId,
      learnerName: data.learnerName,
      placementId: data.placementId,
      companyName: data.companyName,
      month: data.month,
      year: data.year,
      status: 'pending',
      submittedAt: new Date()
    }

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'stipendReports'), stipendReport)

    // Create notification for Super Admins
    await createStipendNotification(docRef.id, data)

    revalidatePath('/learner/dashboard')
    revalidatePath('/super-admin/stipend-reports')

    return { success: true, reportId: docRef.id }
  } catch (error) {
    console.error('Error reporting stipend issue:', error)
    return { success: false, error: 'Failed to report stipend issue' }
  }
}

export async function reportIssueAction(data: {
  userId: string
  userName: string
  userEmail: string
  userRole: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  description: string
  location?: string
  contactMethod: 'email' | 'phone'
  contactInfo: string
  placementInfo?: {
    id: string
    companyName: string
    position: string
  } | null
  deviceInfo: {
    userAgent: string
    platform: string
    language: string
    timezone: string
  }
}) {
  try {
    // Create issue report
    const issueReport: Omit<IssueReport, 'id'> = {
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      userRole: data.userRole,
      category: data.category,
      priority: data.priority,
      title: data.title,
      description: data.description,
      location: data.location,
      contactMethod: data.contactMethod,
      contactInfo: data.contactInfo,
      placementInfo: data.placementInfo,
      deviceInfo: data.deviceInfo,
      status: 'open',
      submittedAt: new Date(),
      updatedAt: new Date()
    }

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'issueReports'), issueReport)

    // Create notification for administrators
    await createIssueNotification(docRef.id, data)

    revalidatePath('/learner/dashboard')
    revalidatePath('/admin/issues')
    revalidatePath('/super-admin/issues')

    return { success: true, issueId: docRef.id }
  } catch (error) {
    console.error('Error reporting issue:', error)
    return { success: false, error: 'Failed to report issue' }
  }
}

async function createStipendNotification(reportId: string, data: any) {
  try {
    // Get all Super Admins
    const usersRef = collection(db, 'users')
    const superAdminQuery = query(
      usersRef,
      where('role', '==', 'super-admin')
    )
    const superAdminSnapshot = await getDocs(superAdminQuery)

    // Create notifications for each Super Admin
    const notifications = superAdminSnapshot.docs.map(doc => ({
      userId: doc.id,
      type: 'stipend_report',
      title: 'New Stipend Issue Reported',
      message: `${data.learnerName} from ${data.companyName} reported a stipend issue for ${data.month} ${data.year}`,
      data: {
        reportId,
        learnerId: data.learnerId,
        learnerName: data.learnerName,
        companyName: data.companyName
      },
      read: false,
      createdAt: new Date()
    }))

    // Add notifications to Firestore
    const notificationsRef = collection(db, 'notifications')
    for (const notification of notifications) {
      await addDoc(notificationsRef, notification)
    }

  } catch (error) {
    console.error('Error creating stipend notifications:', error)
  }
}

async function createIssueNotification(issueId: string, data: any) {
  try {
    // Get all administrators (admin and super-admin)
    const usersRef = collection(db, 'users')
    const adminQuery = query(
      usersRef,
      where('role', 'in', ['admin', 'super-admin'])
    )
    const adminSnapshot = await getDocs(adminQuery)

    // Create notifications for each administrator
    const notifications = adminSnapshot.docs.map(doc => ({
      userId: doc.id,
      type: 'issue_report',
      title: 'New Issue Reported',
      message: `${data.userName} reported a ${data.category} issue: ${data.title}`,
      data: {
        issueId,
        userId: data.userId,
        userName: data.userName,
        category: data.category,
        priority: data.priority
      },
      read: false,
      createdAt: new Date()
    }))

    // Add notifications to Firestore
    const notificationsRef = collection(db, 'notifications')
    for (const notification of notifications) {
      await addDoc(notificationsRef, notification)
    }

  } catch (error) {
    console.error('Error creating issue notifications:', error)
  }
}

export async function getLearnerMonthlyHours(learnerId: string, year: number, month: number): Promise<number> {
  try {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const attendanceRef = collection(db, 'attendance')
    const attendanceQuery = query(
      attendanceRef,
      where('userId', '==', learnerId),
      where('checkInTime', '>=', startDate),
      where('checkInTime', '<=', endDate),
      where('checkOutTime', '!=', null)
    )

    const attendanceSnapshot = await getDocs(attendanceQuery)
    
    let totalHours = 0
    attendanceSnapshot.forEach(doc => {
      const data = doc.data()
      if (data.checkInTime && data.checkOutTime) {
        const checkIn = data.checkInTime.toDate()
        const checkOut = data.checkOutTime.toDate()
        const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)
        totalHours += hours
      }
    })

    return Math.round(totalHours * 10) / 10
  } catch (error) {
    console.error('Error getting monthly hours:', error)
    return 0
  }
}