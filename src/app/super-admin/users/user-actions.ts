'use server'

import { adminAuth, adminDb } from '@/lib/firebase-admin'
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

export async function createUserWithPassword(data: CreateUserData): Promise<CreateUserResult> {
  try {
    // Generate password if not provided
    const password = data.password || generatePassword()
    
    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: data.email,
      password: password,
      displayName: `${data.firstName} ${data.lastName}`,
      emailVerified: false, // User will need to verify email
      disabled: data.status === 'suspended' || data.status === 'inactive'
    })

    // Get permissions for the role
    const permissions = getRolePermissions(data.role)

    // Create user document in Firestore
    const userData = {
      uid: userRecord.uid,
      email: data.email,
      displayName: `${data.firstName} ${data.lastName}`,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      status: data.status,
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
      createdBy: 'super-admin', // Track who created this user
      passwordSet: true
    }

    await adminDb.collection('users').doc(userRecord.uid).set(userData)

    // Log the user creation
    await adminDb.collection('audit-logs').add({
      action: 'USER_CREATED',
      adminId: 'super-admin', // In real app, get from session
      adminName: 'Super Admin',
      targetUserId: userRecord.uid,
      targetUserEmail: data.email,
      details: {
        role: data.role,
        status: data.status,
        method: 'admin_creation'
      },
      timestamp: new Date().toISOString()
    })

    revalidatePath('/super-admin/users')
    
    return {
      success: true,
      userId: userRecord.uid,
      password: password
    }

  } catch (error: any) {
    console.error('Error creating user with password:', error)
    
    let errorMessage = 'Failed to create user'
    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'Email address is already in use'
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address'
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak'
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

export async function resetUserPassword(userId: string): Promise<CreateUserResult> {
  try {
    // Get user from Firebase Auth
    const userRecord = await adminAuth.getUser(userId)
    
    // Generate new password
    const newPassword = generatePassword()
    
    // Update password in Firebase Auth
    await adminAuth.updateUser(userId, {
      password: newPassword
    })

    // Update Firestore document
    await adminDb.collection('users').doc(userId).update({
      updatedAt: new Date().toISOString(),
      lastPasswordReset: new Date().toISOString()
    })

    // Log the password reset
    await adminDb.collection('audit-logs').add({
      action: 'PASSWORD_RESET',
      adminId: 'super-admin',
      adminName: 'Super Admin',
      targetUserId: userId,
      targetUserEmail: userRecord.email,
      details: {
        method: 'admin_reset'
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
    console.error('Error resetting user password:', error)
    
    let errorMessage = 'Failed to reset password'
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'User not found'
    }
    
    return {
      success: false,
      error: errorMessage
    }
  }
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<CreateUserResult> {
  try {
    // Update password in Firebase Auth
    await adminAuth.updateUser(userId, {
      password: newPassword
    })

    // Update Firestore document
    await adminDb.collection('users').doc(userId).update({
      updatedAt: new Date().toISOString(),
      lastPasswordReset: new Date().toISOString()
    })

    // Log the password update
    await adminDb.collection('audit-logs').add({
      action: 'PASSWORD_UPDATED',
      adminId: 'super-admin',
      adminName: 'Super Admin',
      targetUserId: userId,
      details: {
        method: 'admin_update'
      },
      timestamp: new Date().toISOString()
    })

    revalidatePath('/super-admin/users')
    
    return {
      success: true,
      userId: userId
    }

  } catch (error: any) {
    console.error('Error updating user password:', error)
    
    let errorMessage = 'Failed to update password'
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'User not found'
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak'
    }
    
    return {
      success: false,
      error: errorMessage
    }
  }
}
