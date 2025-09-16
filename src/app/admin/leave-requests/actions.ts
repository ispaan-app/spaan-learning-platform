'use server'

import { adminDb } from '@/lib/firebase-admin'
import { revalidatePath } from 'next/cache'
import { safeToDate } from '@/lib/date-utils'

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

export async function getLeaveRequestsAction(): Promise<LeaveRequest[]> {
  try {
    const leaveRequestsRef = adminDb.collection('leaveRequests')
    const snapshot = await leaveRequestsRef.orderBy('submittedAt', 'desc').get()
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        submittedAt: safeToDate(data.submittedAt),
        reviewedAt: data.reviewedAt ? safeToDate(data.reviewedAt) : undefined
      }
    }) as LeaveRequest[]
  } catch (error) {
    console.error('Error fetching leave requests:', error)
    return []
  }
}

export async function updateLeaveRequestAction(
  requestId: string, 
  status: string, 
  adminNotes?: string,
  rejectionReason?: string
) {
  try {
    const leaveRequestRef = adminDb.collection('leaveRequests').doc(requestId)
    
    const updateData: any = {
      status,
      reviewedAt: new Date(),
      reviewedBy: 'admin' // In a real app, this would be the current user's ID
    }

    if (adminNotes) {
      updateData.adminNotes = adminNotes
    }

    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason
    }

    await leaveRequestRef.update(updateData)

    revalidatePath('/admin/leave-requests')
    revalidatePath('/super-admin/leave-requests')
    revalidatePath('/learner/leave')

    return { success: true }
  } catch (error) {
    console.error('Error updating leave request:', error)
    return { success: false, error: 'Failed to update leave request' }
  }
}

export async function getLeaveRequestByIdAction(requestId: string): Promise<LeaveRequest | null> {
  try {
    const leaveRequestRef = adminDb.collection('leaveRequests').doc(requestId)
    const leaveRequestDoc = await leaveRequestRef.get()
    
    if (!leaveRequestDoc.exists) {
      return null
    }

    const data = leaveRequestDoc.data()!
    return {
      id: leaveRequestDoc.id,
      ...data,
      submittedAt: data.submittedAt.toDate(),
      reviewedAt: data.reviewedAt?.toDate()
    } as LeaveRequest
  } catch (error) {
    console.error('Error fetching leave request:', error)
    return null
  }
}

