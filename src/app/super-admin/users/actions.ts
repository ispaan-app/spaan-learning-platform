'use server'

import { db } from '@/lib/firebase'
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore'
import { revalidatePath } from 'next/cache'

interface CreateUserData {
  email: string
  firstName: string
  lastName: string
  role: 'applicant' | 'learner' | 'admin' | 'super-admin'
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  phone?: string
  department?: string
  position?: string
  permissions?: string[]
}

export async function createUser(data: CreateUserData) {
  try {
    const userData = {
      ...data,
      displayName: `${data.firstName} ${data.lastName}`,
      profile: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || '',
        department: data.department || '',
        position: data.position || ''
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const docRef = await addDoc(collection(db, 'users'), userData)
    
    revalidatePath('/super-admin/users')
    
    return { success: true, userId: docRef.id }
  } catch (error) {
    console.error('Error creating user:', error)
    return { success: false, error: 'Failed to create user' }
  }
}

export async function updateUser(userId: string, data: Partial<CreateUserData>) {
  try {
    const userData = {
      ...data,
      displayName: data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : undefined,
      profile: data.firstName && data.lastName ? {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || '',
        department: data.department || '',
        position: data.position || ''
      } : undefined,
      updatedAt: new Date().toISOString()
    }

    // Remove undefined values
    const cleanedData = Object.fromEntries(
      Object.entries(userData).filter(([_, value]) => value !== undefined)
    )

    await updateDoc(doc(db, 'users', userId), cleanedData)
    
    revalidatePath('/super-admin/users')
    
    return { success: true }
  } catch (error) {
    console.error('Error updating user:', error)
    return { success: false, error: 'Failed to update user' }
  }
}

export async function deleteUser(userId: string) {
  try {
    await deleteDoc(doc(db, 'users', userId))
    
    revalidatePath('/super-admin/users')
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { success: false, error: 'Failed to delete user' }
  }
}

export async function toggleUserStatus(userId: string, currentStatus: string) {
  try {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    
    await updateDoc(doc(db, 'users', userId), {
      status: newStatus,
      updatedAt: new Date().toISOString()
    })
    
    revalidatePath('/super-admin/users')
    
    return { success: true, newStatus }
  } catch (error) {
    console.error('Error toggling user status:', error)
    return { success: false, error: 'Failed to toggle user status' }
  }
}

export async function bulkUpdateUsers(userIds: string[], updates: Partial<CreateUserData>) {
  try {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    }

    // Remove undefined values
    const cleanedData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    )

    const promises = userIds.map(userId => 
      updateDoc(doc(db, 'users', userId), cleanedData)
    )

    await Promise.all(promises)
    
    revalidatePath('/super-admin/users')
    
    return { success: true, updatedCount: userIds.length }
  } catch (error) {
    console.error('Error bulk updating users:', error)
    return { success: false, error: 'Failed to bulk update users' }
  }
}

export async function getUsersByRole(role: string) {
  try {
    const usersQuery = query(collection(db, 'users'), where('role', '==', role))
    const usersSnapshot = await getDocs(usersQuery)
    
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return { success: true, users }
  } catch (error) {
    console.error('Error getting users by role:', error)
    return { success: false, error: 'Failed to get users by role' }
  }
}

export async function getUserStats() {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'))
    const users = usersSnapshot.docs.map(doc => doc.data())
    
    const stats = {
      total: users.length,
      active: users.filter((user: any) => user.status === 'active').length,
      pending: users.filter((user: any) => user.status === 'pending').length,
      inactive: users.filter((user: any) => user.status === 'inactive' || user.status === 'suspended').length,
      byRole: {
        'super-admin': users.filter((user: any) => user.role === 'super-admin').length,
        'admin': users.filter((user: any) => user.role === 'admin').length,
        'learner': users.filter((user: any) => user.role === 'learner').length,
        'applicant': users.filter((user: any) => user.role === 'applicant').length
      }
    }
    
    return { success: true, stats }
  } catch (error) {
    console.error('Error getting user stats:', error)
    return { success: false, error: 'Failed to get user stats' }
  }
}









