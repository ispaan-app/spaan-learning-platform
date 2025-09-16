'use server'

import { adminDb } from '@/lib/firebase-admin'
import { revalidatePath } from 'next/cache'
import { safeToDate } from '@/lib/date-utils'

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

export async function getIssuesAction(): Promise<IssueReport[]> {
  try {
    const issuesRef = adminDb.collection('issueReports')
    const snapshot = await issuesRef.orderBy('submittedAt', 'desc').get()
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        submittedAt: safeToDate(data.submittedAt),
        updatedAt: safeToDate(data.updatedAt),
        resolvedAt: data.resolvedAt ? safeToDate(data.resolvedAt) : undefined
      }
    }) as IssueReport[]
  } catch (error) {
    console.error('Error fetching issues:', error)
    return []
  }
}

export async function updateIssueStatusAction(issueId: string, status: string) {
  try {
    const issueRef = adminDb.collection('issueReports').doc(issueId)
    
    const updateData: any = {
      status,
      updatedAt: new Date()
    }

    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = new Date()
    }

    await issueRef.update(updateData)

    revalidatePath('/admin/issues')
    revalidatePath('/super-admin/issues')

    return { success: true }
  } catch (error) {
    console.error('Error updating issue status:', error)
    return { success: false, error: 'Failed to update issue status' }
  }
}

export async function assignIssueAction(issueId: string, assignedTo: string) {
  try {
    const issueRef = adminDb.collection('issueReports').doc(issueId)
    await issueRef.update({
      assignedTo,
      status: 'in_progress',
      updatedAt: new Date()
    })

    revalidatePath('/admin/issues')
    revalidatePath('/super-admin/issues')

    return { success: true }
  } catch (error) {
    console.error('Error assigning issue:', error)
    return { success: false, error: 'Failed to assign issue' }
  }
}

export async function addIssueNoteAction(issueId: string, note: string) {
  try {
    const issueRef = adminDb.collection('issueReports').doc(issueId)
    await issueRef.update({
      adminNotes: note,
      updatedAt: new Date()
    })

    revalidatePath('/admin/issues')
    revalidatePath('/super-admin/issues')

    return { success: true }
  } catch (error) {
    console.error('Error adding issue note:', error)
    return { success: false, error: 'Failed to add note' }
  }
}
