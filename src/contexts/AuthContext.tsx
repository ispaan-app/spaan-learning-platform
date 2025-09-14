'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  userRole: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        // Get user role from custom claims or Firestore
        // For now, we'll use a simple approach based on email
        const role = await getUserRole(user.uid)
        setUserRole(role)
      } else {
        // Check for test login data in localStorage
        const testRole = localStorage.getItem('userRole')
        if (testRole) {
          setUserRole(testRole)
          // Create a mock user object for test login
          setUser({
            uid: 'test-user',
            email: 'test@example.com',
            displayName: localStorage.getItem('userName') || 'Test User'
          } as any)
        } else {
          setUserRole(null)
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`
      })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      // Clear test login data
      localStorage.removeItem('userRole')
      localStorage.removeItem('userName')
      setUser(null)
      setUserRole(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getUserRole = async (uid: string): Promise<string> => {
    try {
      // First check localStorage for current session
      const storedRole = localStorage.getItem('userRole')
      if (storedRole) {
        return storedRole
      }
      
      // Try to fetch from Firestore for authenticated users
      if (uid && uid !== 'test-user') {
        try {
          const { doc, getDoc } = await import('firebase/firestore')
          const { db } = await import('@/lib/firebase')
          const userDoc = await getDoc(doc(db, 'users', uid))
          
          if (userDoc.exists()) {
            const userData = userDoc.data()
            const role = userData.role
            
            // Store in localStorage for future use
            localStorage.setItem('userRole', role)
            if (userData.displayName) {
              localStorage.setItem('userName', userData.displayName)
            }
            if (userData.permissions) {
              localStorage.setItem('userPermissions', JSON.stringify(userData.permissions))
            }
            
            return role
          }
        } catch (firestoreError) {
          console.warn('Could not fetch user role from Firestore:', firestoreError)
        }
      }
      
      // Fallback to email-based role detection
      const user = auth.currentUser
      if (user?.email) {
        // Special case for known super admin emails
        if (user.email === 'developer@ispaan.com') {
          localStorage.setItem('userRole', 'super-admin')
          localStorage.setItem('userName', 'iSpaan Developer')
          return 'super-admin'
        }
        
        if (user.email.includes('admin') || user.email.includes('super')) {
          const role = user.email.includes('super') ? 'super-admin' : 'admin'
          localStorage.setItem('userRole', role)
          return role
        }
        if (user.email.includes('applicant')) {
          return 'applicant'
        }
        if (user.email.includes('learner')) {
          return 'learner'
        }
      }
      
      return 'learner' // Default role
    } catch (error) {
      console.error('Error getting user role:', error)
      return 'learner'
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout,
    userRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

