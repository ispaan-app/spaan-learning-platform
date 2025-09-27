'use client'

import React, { createContext, useContext, useEffect } from 'react'
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { auth, db, initializeClientSideErrorHandling } from '@/lib/firebase'
import { sessionTracker } from '@/lib/session-tracker'
import { useAppStore, UserData } from '@/lib/state-manager'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

interface AuthContextType {
  user: User | null
  userData: UserData | null
  userRole: string | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateUserProfile: (updates: Partial<UserData>) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use individual selectors to prevent unnecessary re-renders
  const user = useAppStore((state) => state.user)
  const userData = useAppStore((state) => state.userData)
  const isAuthenticated = useAppStore((state) => state.isAuthenticated)
  const isLoading = useAppStore((state) => state.isLoading)
  const authError = useAppStore((state) => state.authError)
  const login = useAppStore((state) => state.login)
  const storeLogout = useAppStore((state) => state.logout)
  const updateUserData = useAppStore((state) => state.updateUserData)
  const setLoading = useAppStore((state) => state.setLoading)
  const setAuthError = useAppStore((state) => state.setAuthError)

  useEffect(() => {
    let isMounted = true

    // Initialize client-side error handling
    initializeClientSideErrorHandling()

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return

      if (user) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            const data = userDoc.data() as UserData
            login(user, data)
          } else {
            // Create user document if it doesn't exist
            const newUserData: UserData = {
              id: user.uid,
              firstName: user.displayName?.split(' ')[0] || '',
              lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
              email: user.email || '',
              role: 'applicant',
              status: 'pending',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
            await setDoc(doc(db, 'users', user.uid), {
              ...newUserData,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            })
            login(user, newUserData)
          }
          
          // Initialize session tracking for authenticated users
          try {
            await sessionTracker.initializeSession({
              userId: user.uid,
              userEmail: user.email || '',
              userName: user.displayName || user.email?.split('@')[0] || 'Unknown User',
              userRole: userData?.role || 'applicant'
            })
          } catch (error) {
            console.error('Error initializing session tracking:', error)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          setAuthError('Failed to fetch user data')
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
          const testUserData: UserData = {
            id: 'test-user',
            firstName: localStorage.getItem('userName')?.split(' ')[0] || 'Test',
            lastName: localStorage.getItem('userName')?.split(' ').slice(1).join(' ') || 'User',
            email: 'test@example.com',
            role: testRole as any,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          
          const testUser = {
            uid: 'test-user',
            email: 'test@example.com',
            displayName: localStorage.getItem('userName') || 'Test User'
          } as User
          
          login(testUser, testUserData)
          
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
        } else {
          storeLogout()
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
  }, []) // Remove dependencies to prevent infinite re-renders

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setAuthError(null)
      await signInWithEmailAndPassword(auth, email, password)
      return { success: true }
    } catch (error: any) {
      setAuthError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setLoading(true)
      setAuthError(null)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`
      })
      return { success: true }
    } catch (error: any) {
      setAuthError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
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
      storeLogout()
    } catch (error) {
      console.error('Error signing out:', error)
      setAuthError('Failed to sign out')
    }
  }

  const updateUserProfile = async (updates: Partial<UserData>) => {
    if (!user || !userData) {
      return { success: false, error: 'No user logged in' }
    }

    try {
      const updatedData = { ...userData, ...updates, updatedAt: new Date().toISOString() }
      await setDoc(doc(db, 'users', user.uid), {
        ...updatedData,
        updatedAt: serverTimestamp()
      })
      updateUserData(updates)
      return { success: true }
    } catch (error: any) {
      setAuthError(error.message)
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    userData,
    userRole: userData?.role || null,
    loading: isLoading,
    signIn,
    signUp,
    logout,
    updateUserProfile
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



