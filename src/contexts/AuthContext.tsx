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
import { sessionTracker } from '@/lib/session-tracker'

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
    let isMounted = true

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return

      setUser(user)
      if (user) {
        try {
          // Get user role from custom claims or Firestore
          const role = await getUserRole(user.uid)
          if (isMounted) {
            setUserRole(role)
          }
          
          // Initialize session tracking for authenticated users
          try {
            await sessionTracker.initializeSession({
              userId: user.uid,
              userEmail: user.email || '',
              userName: user.displayName || user.email?.split('@')[0] || 'Unknown User',
              userRole: role
            })
          } catch (error) {
            console.error('Error initializing session tracking:', error)
          }
        } catch (error) {
          console.error('Error getting user role:', error)
          if (isMounted) {
            setUserRole(null)
          }
        }
      } else {
        // End session tracking when user logs out
        try {
          await sessionTracker.endSession()
        } catch (error) {
          console.error('Error ending session:', error)
        }
        
        // Check for test login data in localStorage
        const testRole = localStorage.getItem('userRole')
        if (testRole && isMounted) {
          setUserRole(testRole)
          // Create a mock user object for test login
          setUser({
            uid: 'test-user',
            email: 'test@example.com',
            displayName: localStorage.getItem('userName') || 'Test User'
          } as any)
          
          // Initialize session tracking for test user
          try {
            await sessionTracker.initializeSession({
              userId: 'test-user',
              userEmail: 'test@example.com',
              userName: localStorage.getItem('userName') || 'Test User',
              userRole: testRole
            })
          } catch (error) {
            console.error('Error initializing test session tracking:', error)
          }
        } else if (isMounted) {
          setUserRole(null)
        }
      }
      if (isMounted) {
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
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
      // End session tracking before signing out
      await sessionTracker.endSession()
      
      await signOut(auth)
      // Clear test login data
      localStorage.removeItem('userRole')
      localStorage.removeItem('userName')
      localStorage.removeItem('userPermissions')
      setUser(null)
      setUserRole(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getUserRole = async (uid: string): Promise<string> => {
    try {
      // For test users, use localStorage (development only)
      if (uid === 'test-user') {
        const testRole = localStorage.getItem('userRole')
        return testRole || 'learner'
      }
      
      // For authenticated users, verify custom claims first
      const user = auth.currentUser
      if (user && user.uid === uid) {
        try {
          // Get fresh ID token to ensure custom claims are up to date
          const idTokenResult = await user.getIdTokenResult(true)
          const customClaims = idTokenResult.claims
          
          if (customClaims.role) {
            console.log('✅ Role from custom claims:', customClaims.role)
            return customClaims.role as string
          }
        } catch (claimsError) {
          console.warn('Could not fetch custom claims:', claimsError)
        }
      }
      
      // Fallback to Firestore if custom claims not available
      try {
        const { doc, getDoc } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')
        const userDoc = await getDoc(doc(db, 'users', uid))
        
        if (userDoc.exists()) {
          const userData = userDoc.data()
          const role = userData.role || 'learner'
          
          // Update custom claims if they're missing or different
          if (user && user.uid === uid) {
            try {
              const idTokenResult = await user.getIdTokenResult()
              const currentClaims = idTokenResult.claims
              
              if (!currentClaims.role || currentClaims.role !== role) {
                // Update custom claims via server action
                await fetch('/api/update-user-claims', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ uid, role })
                })
              }
            } catch (updateError) {
              console.warn('Could not update custom claims:', updateError)
            }
          }
          
          return role
        }
      } catch (firestoreError) {
        console.warn('Could not fetch user role from Firestore:', firestoreError)
      }
      
      // Final fallback to email-based role detection
      if (user?.email) {
        if (user.email === 'developer@ispaan.com') {
          return 'super-admin'
        }
        
        if (user.email.includes('admin') || user.email.includes('super')) {
          return user.email.includes('super') ? 'super-admin' : 'admin'
        }
        if (user.email.includes('applicant')) {
          return 'applicant'
        }
        if (user.email.includes('learner')) {
          return 'learner'
        }
      }
      
      // Default fallback
      return 'learner'
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

