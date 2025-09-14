'use server'

import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { revalidatePath } from 'next/cache'

export async function enrollLearnerAction(placementId: string, learnerId: string) {
  try {
    // Get placement details
    const placementRef = adminDb.collection('placements').doc(placementId)
    const placementDoc = await placementRef.get()
    
    if (!placementDoc.exists) {
      return { success: false, error: 'Placement not found' }
    }

    const placementData = placementDoc.data()!
    
    // Check if placement is at capacity
    if (placementData.assignedLearners >= placementData.capacity) {
      return { success: false, error: 'Placement is at full capacity' }
    }

    // Get learner details
    const learnerRef = adminDb.collection('users').doc(learnerId)
    const learnerDoc = await learnerRef.get()
    
    if (!learnerDoc.exists) {
      return { success: false, error: 'Learner not found' }
    }

    const learnerData = learnerDoc.data()!
    
    // Check if learner is already assigned
    if (learnerData.placementId) {
      return { success: false, error: 'Learner is already assigned to a placement' }
    }

    // Check if learner is in the correct program
    if (learnerData.programId !== placementData.programId) {
      return { success: false, error: 'Learner is not enrolled in the correct program' }
    }

    // Update learner with placement assignment
    await learnerRef.update({
      placementId: placementId,
      placementCompany: placementData.companyName,
      placementStartDate: new Date(),
      updatedAt: new Date()
    })

    // Update placement with new assignment
    await placementRef.update({
      assignedLearners: FieldValue.increment(1),
      updatedAt: new Date()
    })

    // Check if placement is now full
    const newAssignedCount = placementData.assignedLearners + 1
    if (newAssignedCount >= placementData.capacity) {
      await placementRef.update({
        status: 'full'
      })
    }

    revalidatePath('/admin/placements')
    revalidatePath(`/admin/placements/${placementId}`)
    revalidatePath('/learner/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Error enrolling learner:', error)
    return { success: false, error: 'Failed to enroll learner' }
  }
}

export async function unenrollLearnerAction(placementId: string, learnerId: string) {
  try {
    // Get placement details
    const placementRef = adminDb.collection('placements').doc(placementId)
    const placementDoc = await placementRef.get()
    
    if (!placementDoc.exists) {
      return { success: false, error: 'Placement not found' }
    }

    const placementData = placementDoc.data()!
    
    // Get learner details
    const learnerRef = adminDb.collection('users').doc(learnerId)
    const learnerDoc = await learnerRef.get()
    
    if (!learnerDoc.exists) {
      return { success: false, error: 'Learner not found' }
    }

    const learnerData = learnerDoc.data()!
    
    // Check if learner is assigned to this placement
    if (learnerData.placementId !== placementId) {
      return { success: false, error: 'Learner is not assigned to this placement' }
    }

    // Remove placement assignment from learner
    await learnerRef.update({
      placementId: null,
      placementCompany: null,
      placementStartDate: null,
      updatedAt: new Date()
    })

    // Update placement with removed assignment
    await placementRef.update({
      assignedLearners: FieldValue.increment(-1),
      status: 'active', // Reset to active since we removed a learner
      updatedAt: new Date()
    })

    revalidatePath('/admin/placements')
    revalidatePath(`/admin/placements/${placementId}`)
    revalidatePath('/learner/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Error unenrolling learner:', error)
    return { success: false, error: 'Failed to unenroll learner' }
  }
}
