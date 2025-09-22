'use server'

import { adminDb } from '@/lib/firebase-admin'
// Mock AI flows - temporarily disabled
// import { verifyPinFlow } from '@/ai/flows/securePinFlow'
// import { findUserByIdNumberFlow } from '@/ai/flows/findUserByIdNumber'
import { getAuth } from 'firebase-admin/auth'

export async function loginWithPin(idNumber: string, pin: string) {
  try {
    // Check if Firebase Admin SDK is properly initialized
    if (!adminDb || typeof adminDb.collection !== 'function') {
      console.error('Firebase Admin SDK not initialized')
      return {
        success: false,
        error: 'Server configuration error. Please contact support.'
      }
    }

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

    // Check if user has a hashed PIN
    if (!userData.hashedPin) {
      return {
        success: false,
        error: 'Account not properly set up. Please contact support.'
      }
    }

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
    
    // Provide more specific error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes('Firebase Admin SDK')) {
        return {
          success: false,
          error: 'Server configuration error. Please contact support.'
        }
      }
      if (error.message.includes('permission')) {
        return {
          success: false,
          error: 'Access denied. Please contact support.'
        }
      }
    }
    
    return {
      success: false,
      error: 'Login service temporarily unavailable. Please try again later.'
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