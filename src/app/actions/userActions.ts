import { logUserCreated, logUserStatusUpdated } from './auditLogActions'
'use server'

import { adminDb, adminAuth } from '@/lib/firebase-admin'
import { z } from 'zod'

const ApplicationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  age: z.string().min(1, 'Age is required'),
  gender: z.string().min(1, 'Gender is required'),
  idNumber: z.string().min(13, 'ID number must be exactly 13 characters').max(13, 'ID number must be exactly 13 characters'),
  nationality: z.string().min(1, 'Nationality is required'),
  streetAddress: z.string().min(1, 'Street address is required'),
  suburb: z.string().min(1, 'Suburb/Township is required'),
  province: z.string().min(1, 'Province is required'),
  program: z.string().min(1, 'Please select a program'),
  highestQualification: z.string().min(1, 'Highest qualification is required'),
  fieldOfStudy: z.string().min(1, 'Field of study is required'),
  yearsOfExperience: z.string().min(1, 'Years of experience is required'),
})

export async function createUser(formData: FormData) {
  try {
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      age: formData.get('age') as string,
      gender: formData.get('gender') as string,
      idNumber: formData.get('idNumber') as string,
      nationality: formData.get('nationality') as string,
      streetAddress: formData.get('streetAddress') as string,
      suburb: formData.get('suburb') as string,
      province: formData.get('province') as string,
      program: formData.get('program') as string,
      highestQualification: formData.get('highestQualification') as string,
      fieldOfStudy: formData.get('fieldOfStudy') as string,
      yearsOfExperience: formData.get('yearsOfExperience') as string,
    }

    // Validate the data
    const validatedData = ApplicationSchema.parse(data)

    // Generate a random 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString()

    // Create Firebase Auth user using Admin SDK
    const userRecord = await adminAuth.createUser({
      email: validatedData.email,
      password: pin, // Use PIN as initial password
      displayName: `${validatedData.firstName} ${validatedData.lastName}`,
      uid: undefined // Let Firebase generate the UID
    })

    const user = userRecord

    // Hash the PIN for secure storage
    const crypto = await import('crypto')
    const hashedPin = crypto.createHash('sha256').update(pin).digest('hex')

    // Save user data to Firestore
    await adminDb.collection('users').doc(user.uid).set({
      ...validatedData,
      uid: user.uid,
      role: 'applicant',
      status: 'pending_review',
      pin: pin, // Keep plain PIN for initial display
      hashedPin: hashedPin, // Store hashed version for security
      createdAt: new Date(),
      updatedAt: new Date(),
      documents: {
        certifiedId: { status: 'pending', uploadedAt: null },
        cv: { status: 'pending', uploadedAt: null },
        qualifications: { status: 'pending', uploadedAt: null },
        references: { status: 'pending', uploadedAt: null },
      },
      applicationStatus: 'pending_review',
      approvedAt: null,
    })

    // Audit log: user created
    await logUserCreated(user.uid, 'applicant', { email: validatedData.email })

    return { 
      success: true, 
      userId: user.uid,
      pin: pin,
      message: 'Application submitted successfully! Please save your PIN for login.'
    }
  } catch (error) {
    console.error('User creation error:', error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    // Handle specific Firebase errors
    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as any
      switch (firebaseError.code) {
        case 'auth/email-already-exists':
          return { success: false, error: 'An account with this email already exists' }
        case 'auth/invalid-email':
          return { success: false, error: 'Invalid email address' }
        case 'auth/weak-password':
          return { success: false, error: 'Password is too weak' }
        case 'auth/operation-not-allowed':
          return { success: false, error: 'User creation is not enabled' }
        default:
          return { success: false, error: `Firebase error: ${firebaseError.message || 'Unknown error'}` }
      }
    }
    
    return { success: false, error: `Failed to create user account: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

export async function updateUserStatus(userId: string, status: string, role?: string) {
  try {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    }

    if (role) {
      updateData.role = role
    }

    if (status === 'active' && role === 'learner') {
      updateData.approvedAt = new Date()
    }

  await adminDb.collection('users').doc(userId).update(updateData)

  // Audit log: user status updated
  await logUserStatusUpdated(userId, role || 'unknown', status)

  return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update user status' }
  }
}

export async function getUserById(userId: string) {
  try {
    const userDoc = await adminDb.collection('users').doc(userId).get()
    
    if (!userDoc.exists) {
      return { success: false, error: 'User not found' }
    }

    return { success: true, user: userDoc.data() }
  } catch (error) {
    return { success: false, error: 'Failed to fetch user' }
  }
}

export async function getAllApplicants() {
  try {
    const applicantsSnapshot = await adminDb
      .collection('users')
      .where('role', '==', 'applicant')
      .orderBy('createdAt', 'desc')
      .get()

    const applicants = applicantsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[]

    return { success: true, applicants }
  } catch (error) {
    return { success: false, error: 'Failed to fetch applicants' }
  }
}
