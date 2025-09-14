'use client'

import { useState, useEffect, useCallback } from 'react'
import { User, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface UserProfileData {
  firstName?: string
  lastName?: string
  role?: string
  profileImage?: string
  avatar?: string
  email?: string
}

interface AuthState {
  user: User | null
  loading: boolean
  role: string | null
  userData: UserProfileData | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    role: null,
    userData: null
  })

  const fetchUserProfileData = useCallback(async (user: User) => {
    try {
      // First get basic user data from users collection
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      const userData = userDoc.data()
      const userRole = userData?.role || null
      
      // Then get detailed profile data based on role
      let profileData = null
      if (userRole === 'learner') {
        // For learners, get detailed profile from learnerProfiles collection
        const profileDoc = await getDoc(doc(db, 'learnerProfiles', user.uid))
        if (profileDoc.exists()) {
          profileData = profileDoc.data()
        }
      } else if (userRole === 'admin' || userRole === 'super-admin') {
        // For admins, profile data is already in userData from users collection
        profileData = userData
      }
      
      return {
        user,
        loading: false,
        role: userRole,
        userData: {
          firstName: profileData?.firstName || userData?.firstName || user.displayName?.split(' ')[0] || '',
          lastName: profileData?.lastName || userData?.lastName || user.displayName?.split(' ').slice(1).join(' ') || '',
          role: userRole,
          profileImage: profileData?.profileImage || userData?.profileImage || user.photoURL || null,
          avatar: userData?.avatar || null, // For admin users
          email: userData?.email || user.email || ''
        }
      }
    } catch (error) {
      console.error('Error fetching user profile data:', error)
      return {
        user,
        loading: false,
        role: null,
        userData: null
      }
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const authState = await fetchUserProfileData(user)
        setAuthState(authState)
      } else {
        setAuthState({
          user: null,
          loading: false,
          role: null,
          userData: null
        })
      }
    })

    return () => unsubscribe()
  }, [fetchUserProfileData])

  const signInWithCustomToken = async (token: string) => {
    try {
      const { signInWithCustomToken: firebaseSignIn } = await import('firebase/auth')
      await firebaseSignIn(auth, token)
      return { success: true }
    } catch (error) {
      console.error('Custom token sign-in error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
    }
  }

  const signOut = async () => {
    try {
      await auth.signOut()
      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
    }
  }

  const logout = async () => {
    try {
      await auth.signOut()
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
    }
  }

  return {
    ...authState,
    signInWithCustomToken,
    signOut,
    logout
  }
}
