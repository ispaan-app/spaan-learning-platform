'use server'

import { adminDb } from '@/lib/firebase-admin'

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'super-admin' | 'learner' | 'applicant'
  firstName?: string
  lastName?: string
  avatar?: string
  status?: 'active' | 'inactive'
}

export async function searchUsers(searchTerm: string): Promise<User[]> {
  try {
    if (!searchTerm || searchTerm.length < 2) {
      return []
    }

    // Search users by name or email
    const usersSnapshot = await adminDb
      .collection('users')
      .where('email', '>=', searchTerm)
      .where('email', '<=', searchTerm + '\uf8ff')
      .limit(10)
      .get()

    const users: User[] = []
    
    // Add users found by email
    usersSnapshot.docs.forEach(doc => {
      const data = doc.data()
      users.push({
        id: doc.id,
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email,
        email: data.email,
        role: data.role || 'applicant',
        firstName: data.firstName,
        lastName: data.lastName,
        avatar: data.avatar,
        status: data.status || 'active'
      })
    })

    // Also search by name if we have enough results
    if (users.length < 10) {
      const nameSnapshot = await adminDb
        .collection('users')
        .where('firstName', '>=', searchTerm)
        .where('firstName', '<=', searchTerm + '\uf8ff')
        .limit(10 - users.length)
        .get()

      nameSnapshot.docs.forEach(doc => {
        const data = doc.data()
        const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim()
        
        // Avoid duplicates
        if (!users.find(u => u.id === doc.id)) {
          users.push({
            id: doc.id,
            name: fullName || data.email,
            email: data.email,
            role: data.role || 'applicant',
            firstName: data.firstName,
            lastName: data.lastName,
            avatar: data.avatar,
            status: data.status || 'active'
          })
        }
      })
    }

    return users
  } catch (error) {
    console.error('Error searching users:', error)
    return []
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const usersSnapshot = await adminDb
      .collection('users')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get()

    return usersSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email,
        email: data.email,
        role: data.role || 'applicant',
        firstName: data.firstName,
        lastName: data.lastName,
        avatar: data.avatar,
        status: data.status || 'active'
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const userDoc = await adminDb.collection('users').doc(userId).get()
    
    if (!userDoc.exists) {
      return null
    }

    const data = userDoc.data()!
    return {
      id: userDoc.id,
      name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email,
      email: data.email,
      role: data.role || 'applicant',
      firstName: data.firstName,
      lastName: data.lastName,
      avatar: data.avatar,
      status: data.status || 'active'
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}




