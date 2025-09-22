'use server'

import { adminDb } from '@/lib/firebase-admin'
// import { logUserActivity } from './auditLogActions' // Function not available

export interface CheckInData {
  learnerId: string
  checkInTime: string
  location?: string
  workType?: string
  notes?: string
  checkOutTime?: string
  totalHours?: number
}

export async function createCheckIn(learnerId: string, checkInData: Partial<CheckInData>) {
  try {
    const checkIn = {
      learnerId,
      checkInTime: new Date().toISOString(),
      location: checkInData.location || 'Office',
      workType: checkInData.workType || 'general',
      notes: checkInData.notes || '',
      status: 'checked-in',
      createdAt: new Date().toISOString()
    }

    // Save check-in record
    const docRef = await adminDb.collection('learnerCheckIns').add(checkIn)

    // Create activity record
    await adminDb.collection('learnerActivities').add({
      learnerId,
      type: 'check_in',
      action: 'checked_in',
      timestamp: new Date().toISOString(),
      description: `Checked in at ${checkIn.location}`,
      metadata: {
        checkInId: docRef.id,
        location: checkIn.location,
        workType: checkIn.workType
      }
    })

    // Log the activity
    console.log('Learner checked in:', { learnerId, location: checkIn.location, workType: checkIn.workType })

    return { success: true, checkInId: docRef.id, data: checkIn }
  } catch (error) {
    console.error('Error creating check-in:', error)
    return { success: false, error: 'Failed to create check-in' }
  }
}

export async function createCheckOut(learnerId: string, checkInId: string, notes?: string) {
  try {
    const checkOutTime = new Date()
    
    // Update the check-in record
    const checkInRef = adminDb.collection('learnerCheckIns').doc(checkInId)
    const checkInDoc = await checkInRef.get()
    
    if (!checkInDoc.exists) {
      return { success: false, error: 'Check-in record not found' }
    }

    const checkInData = checkInDoc.data()
    const checkInTime = new Date(checkInData?.checkInTime)
    const totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60) // Hours

    await checkInRef.update({
      checkOutTime: checkOutTime.toISOString(),
      totalHours: Math.round(totalHours * 100) / 100,
      status: 'checked-out',
      notes: notes || ''
    })

    // Create activity record
    await adminDb.collection('learnerActivities').add({
      learnerId,
      type: 'check_out',
      action: 'checked_out',
      timestamp: checkOutTime.toISOString(),
      description: `Checked out after ${Math.round(totalHours * 100) / 100} hours`,
      metadata: {
        checkInId,
        totalHours: Math.round(totalHours * 100) / 100,
        notes
      }
    })

    // Update learner's total hours
    await updateLearnerTotalHours(learnerId, Math.round(totalHours * 100) / 100)

    // Log the activity
    console.log('Learner checked out:', { learnerId, totalHours: Math.round(totalHours * 100) / 100, notes })

    return { 
      success: true, 
      data: {
        checkOutTime: checkOutTime.toISOString(),
        totalHours: Math.round(totalHours * 100) / 100
      }
    }
  } catch (error) {
    console.error('Error creating check-out:', error)
    return { success: false, error: 'Failed to create check-out' }
  }
}

export async function updateLearnerTotalHours(learnerId: string, additionalHours: number) {
  try {
    const learnerRef = adminDb.collection('users').doc(learnerId)
    const learnerDoc = await learnerRef.get()
    
    if (!learnerDoc.exists) {
      return { success: false, error: 'Learner not found' }
    }

    const learnerData = learnerDoc.data()
    const currentHours = learnerData?.totalCompletedHours || 0
    const newTotal = currentHours + additionalHours

    await learnerRef.update({
      totalCompletedHours: newTotal,
      lastActivity: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    return { success: true, totalHours: newTotal }
  } catch (error) {
    console.error('Error updating learner total hours:', error)
    return { success: false, error: 'Failed to update total hours' }
  }
}

export async function getLearnerCheckIns(learnerId: string, limit: number = 50) {
  try {
    const checkInsSnapshot = await adminDb
      .collection('learnerCheckIns')
      .where('learnerId', '==', learnerId)
      .orderBy('checkInTime', 'desc')
      .limit(limit)
      .get()

    const checkIns = checkInsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return { success: true, checkIns }
  } catch (error) {
    console.error('Error fetching learner check-ins:', error)
    return { success: false, error: 'Failed to fetch check-ins' }
  }
}

export async function getLearnerProgress(learnerId: string) {
  try {
    // Get total completed hours
    const learnerDoc = await adminDb.collection('users').doc(learnerId).get()
    const learnerData = learnerDoc.data()
    const totalCompletedHours = learnerData?.totalCompletedHours || 0

    // Get recent check-ins for attendance calculation
    const checkInsSnapshot = await adminDb
      .collection('learnerCheckIns')
      .where('learnerId', '==', learnerId)
      .where('checkInTime', '>=', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .get()

    const totalHours = 160 // Required hours
    const completionRate = (totalCompletedHours / totalHours) * 100
    const attendanceRate = Math.min((checkInsSnapshot.docs.length / 20) * 100, 100) // Assuming 20 expected check-ins per month

    return {
      success: true,
      progress: {
        totalHours,
        completedHours: totalCompletedHours,
        completionRate: Math.round(completionRate * 10) / 10,
        attendanceRate: Math.round(attendanceRate * 10) / 10,
        recentCheckIns: checkInsSnapshot.docs.length
      }
    }
  } catch (error) {
    console.error('Error fetching learner progress:', error)
    return { success: false, error: 'Failed to fetch progress' }
  }
}
