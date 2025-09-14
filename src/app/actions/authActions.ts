'use server'

import { adminDb } from '@/lib/firebase-admin'
import { verifyPinFlow } from '@/ai/flows/securePinFlow'
import { findUserByIdNumberFlow } from '@/ai/flows/findUserByIdNumber'
import { getAuth } from 'firebase-admin/auth'

export async function loginWithPin(idNumber: string, pin: string) {
  try {
    // Find user by ID number - using direct Firestore query for now
    const usersSnapshot = await adminDb
      .collection('users')
      .where('idNumber', '==', idNumber)
      .limit(1)
      .get()

    if (usersSnapshot.empty) {
      return {
        success: false,
        error: 'Invalid ID number or PIN. Please check your credentials.'
      }
    }

    const userDoc = usersSnapshot.docs[0]
    const userData = userDoc.data()

    // Verify PIN using direct hash comparison
    const crypto = await import('crypto')
    const hash = crypto.createHash('sha256').update(pin).digest('hex')

    if (hash !== userData.hashedPin) {
      return {
        success: false,
        error: 'Invalid ID number or PIN. Please check your credentials.'
      }
    }

    // Create custom token for Firebase Auth
    const auth = getAuth()
    const customToken = await auth.createCustomToken(userDoc.id)

    return {
      success: true,
      customToken,
      userRole: userData.role,
      userId: userDoc.id
    }

  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}

export async function resetUserPin(userId: string, adminId: string) {
  try {
    // Generate new 6-digit PIN
    const newPin = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Hash the new PIN
    const crypto = await import('crypto')
    const hashedPin = crypto.createHash('sha256').update(newPin).digest('hex')
    
    // Update user document in Firestore
    await adminDb.collection('users').doc(userId).update({
      hashedPin: hashedPin,
      lastPinReset: new Date(),
      resetBy: adminId
    })

    // Create audit log entry
    await adminDb.collection('audit-logs').add({
      action: 'PIN_RESET',
      adminId,
      userId,
      timestamp: new Date(),
      details: 'User PIN was reset by administrator'
    })

    return {
      success: true,
      newPin: newPin
    }

  } catch (error) {
    console.error('PIN reset error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}