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
    const { db } = await import('@/lib/firebase')
    const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore')
    
    let q = query(
      collection(db, 'stipendReports'),
      orderBy('submittedAt', 'desc')
    )
    
    if (status) {
      q = query(q, where('status', '==', status))
    }
    
    const snapshot = await getDocs(q)
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate?.() || new Date(),
      resolvedAt: doc.data().resolvedAt?.toDate?.() || null
    }))
    
    return reports
  } catch (error) {
    console.error('Error fetching stipend reports:', error)
    return []
  }
}
