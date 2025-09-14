'use server'

import { adminDb as db } from '@/lib/firebase-admin'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { revalidatePath } from 'next/cache'

export async function resolveStipendReportAction(reportId: string) {
  try {
    const reportRef = doc(db as any, 'stipendReports', reportId)
    
    // Update the report status
    await updateDoc(reportRef, {
      status: 'resolved',
      resolvedAt: new Date(),
      resolvedBy: 'super-admin' // In a real app, this would be the current user's ID
    })

    revalidatePath('/super-admin/stipend-reports')
    revalidatePath('/learner/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Error resolving stipend report:', error)
    return { success: false, error: 'Failed to resolve stipend report' }
  }
}

export async function getStipendReportsAction(status?: 'pending' | 'resolved') {
  try {
    // This would normally fetch from Firestore
    // For now, returning mock data
    const mockReports = [
      {
        id: '1',
        learnerId: 'learner1',
        learnerName: 'John Doe',
        placementId: 'placement1',
        companyName: 'Tech Corp',
        month: 'January',
        year: 2024,
        status: 'pending',
        submittedAt: new Date('2024-01-15'),
        notes: 'Learner reported missing stipend payment'
      },
      {
        id: '2',
        learnerId: 'learner2',
        learnerName: 'Jane Smith',
        placementId: 'placement2',
        companyName: 'Innovation Ltd',
        month: 'December',
        year: 2023,
        status: 'resolved',
        submittedAt: new Date('2023-12-20'),
        resolvedAt: new Date('2023-12-22'),
        resolvedBy: 'admin@example.com',
        notes: 'Payment processed successfully'
      }
    ]

    if (status) {
      return mockReports.filter(report => report.status === status)
    }

    return mockReports
  } catch (error) {
    console.error('Error fetching stipend reports:', error)
    return []
  }
}
