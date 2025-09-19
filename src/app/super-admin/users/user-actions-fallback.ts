'use server'

import { db, auth } from '@/lib/firebase'
import { collection, addDoc, doc, updateDoc, setDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { revalidatePath } from 'next/cache'
import { SUPER_ADMIN_PERMISSIONS, ADMIN_PERMISSIONS } from '@/lib/permissions'

interface CreateUserData {
  email: string
  firstName: string
  lastName: string
  role: 'applicant' | 'learner' | 'admin' | 'super-admin'
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  phone?: string
  department?: string
  position?: string
  activeProgram?: string
  assignedPrograms?: string[]
  password?: string
}

interface CreateUserResult {
  success: boolean
  userId?: string
  password?: string
  error?: string
}

// Generate a secure random password
function generatePassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  
  // Ensure at least one character from each required type
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*'
  
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// Get permissions based on role
function getRolePermissions(role: string): string[] {
  switch (role) {
    case 'super-admin':
      return SUPER_ADMIN_PERMISSIONS
    case 'admin':
      return ADMIN_PERMISSIONS
    default:
      return []
  }
}

export async function createUserWithPasswordFallback(data: CreateUserData): Promise<CreateUserResult> {
  try {
    // Generate password if not provided
    const password = data.password || generatePassword()
    
    // Get permissions for the role
    const permissions = getRolePermissions(data.role)

    // Step 1: Create Firebase Authentication user
    let authUser = null
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, password)
      authUser = userCredential.user
      
      // Update the user's display name in Firebase Auth
      await updateProfile(authUser, {
        displayName: `${data.firstName} ${data.lastName}`
      })
      
      console.log('Firebase Auth user created successfully:', authUser.uid)
    } catch (authError: any) {
      console.error('Error creating Firebase Auth user:', authError)
      
      let authErrorMessage = 'Failed to create authentication user'
      if (authError.code === 'auth/email-already-in-use') {
        authErrorMessage = 'Email address is already in use by another account'
      } else if (authError.code === 'auth/invalid-email') {
        authErrorMessage = 'Invalid email address format'
      } else if (authError.code === 'auth/weak-password') {
        authErrorMessage = 'Password is too weak. Please use a stronger password'
      } else if (authError.message) {
        authErrorMessage = authError.message
      }
      
      return {
        success: false,
        error: authErrorMessage
      }
    }

    // Step 2: Create Firestore user document with the Auth UID
    const userData = {
      uid: authUser?.uid, // Link to Firebase Auth UID
      email: data.email,
      displayName: `${data.firstName} ${data.lastName}`,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      status: data.status,
      activeProgram: data.activeProgram || '',
      assignedPrograms: data.assignedPrograms || [],
      permissions: permissions,
      profile: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || '',
        department: data.department || '',
        position: data.position || ''
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'super-admin',
      passwordSet: true,
      authCreated: true, // Flag that Firebase Auth user was created
      needsPasswordReset: false // User can login with provided password
    }

    // Create Firestore document with Auth UID as document ID for consistency
    const docRef = await setDoc(doc(db, 'users', authUser!.uid), userData)

    // Log the user creation
    await addDoc(collection(db, 'audit-logs'), {
      action: 'USER_CREATED',
      adminId: 'super-admin',
      adminName: 'Super Admin',
      targetUserId: authUser!.uid,
      targetUserEmail: data.email,
      details: {
        role: data.role,
        status: data.status,
        method: 'auth_and_firestore_creation',
        authUid: authUser!.uid
      },
      timestamp: new Date().toISOString()
    })

    revalidatePath('/super-admin/users')
    
    return {
      success: true,
      userId: authUser!.uid,
      password: password
    }

  } catch (error: any) {
    console.error('Error creating user with fallback method:', error)
    
    let errorMessage = 'Failed to create user'
    if (error.code === 'permission-denied') {
      errorMessage = 'Permission denied. Please check your Firestore rules.'
    } else if (error.code === 'unavailable') {
      errorMessage = 'Firebase service is currently unavailable. Please try again later.'
    } else if (error.message) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    }
    
    return {
      success: false,
      error: errorMessage
    }
  }
}

export async function resetUserPasswordFallback(userId: string): Promise<CreateUserResult> {
  try {
    // Generate new password
    const newPassword = generatePassword()
    
    // Note: Firebase Auth doesn't allow updating passwords from server-side
    // without the user being logged in. This is a security feature.
    // We'll store the new password in Firestore and the user will need to
    // reset their password through the standard Firebase Auth flow.
    
    // Update Firestore document with new temporary password
    await updateDoc(doc(db, 'users', userId), {
      temporaryPassword: newPassword,
      needsPasswordReset: true,
      updatedAt: new Date().toISOString(),
      lastPasswordReset: new Date().toISOString(),
      passwordResetRequired: true
    })

    // Log the password reset
    await addDoc(collection(db, 'audit-logs'), {
      action: 'PASSWORD_RESET',
      adminId: 'super-admin',
      adminName: 'Super Admin',
      targetUserId: userId,
      details: {
        method: 'firestore_temporary_password',
        note: 'User will need to reset password through Firebase Auth flow'
      },
      timestamp: new Date().toISOString()
    })

    revalidatePath('/super-admin/users')
    
    return {
      success: true,
      userId: userId,
      password: newPassword
    }

  } catch (error: any) {
    console.error('Error resetting user password with fallback method:', error)
    
    let errorMessage = 'Failed to reset password'
    if (error.code === 'permission-denied') {
      errorMessage = 'Permission denied. Please check your Firestore rules.'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return {
      success: false,
      error: errorMessage
    }
  }
}
