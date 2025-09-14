'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingButton } from '@/components/ui/loading'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { LogIn, Mail, Lock } from 'lucide-react'

const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
})

type LoginFormData = z.infer<typeof loginSchema>

interface AdminLoginFormProps {
  selectedRole: 'admin' | 'super-admin'
}

export function AdminLoginForm({ selectedRole }: AdminLoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError('')

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password)
      const user = userCredential.user

      // Fetch user data from Firestore to verify role and permissions
      let userData = null
      let userRole = 'admin' // Default role
      let userName = user.displayName || 'User'
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          userData = userDoc.data()
          userRole = userData.role || 'admin'
          userName = userData.displayName || userData.profile?.firstName + ' ' + userData.profile?.lastName || userName
          
          // For super admin, also check the superAdminProfiles collection for additional data
          if (userRole === 'super-admin') {
            try {
              const superAdminDoc = await getDoc(doc(db, 'superAdminProfiles', user.uid))
              if (superAdminDoc.exists()) {
                const superAdminData = superAdminDoc.data()
                userName = superAdminData.displayName || userName
              }
            } catch (superAdminError) {
              console.warn('Could not fetch super admin profile:', superAdminError)
            }
          }
        } else {
          // Fallback for known super admin email if Firestore doc doesn't exist yet
          if (data.email === 'developer@ispaan.com') {
            userRole = 'super-admin'
            userName = 'iSpaan Developer'
          } else {
            setError('User account not found. Please contact support.')
            await auth.signOut()
            return
          }
        }
      } catch (firestoreError) {
        console.warn('Firestore access failed, using email-based role detection:', firestoreError)
        // Fallback to email-based role detection for known super admin
        if (data.email === 'developer@ispaan.com') {
          userRole = 'super-admin'
          userName = 'iSpaan Developer'
        } else if (user.email?.includes('super') || user.email?.includes('admin')) {
          userRole = user.email.includes('super') ? 'super-admin' : 'admin'
        }
      }

      // Verify role matches selected tab
      if (selectedRole === 'admin' && userRole !== 'admin') {
        setError('You do not have admin privileges. Please select the correct role.')
        await auth.signOut()
        return
      }

      if (selectedRole === 'super-admin' && userRole !== 'super-admin') {
        setError('You do not have super admin privileges. Please select the correct role.')
        await auth.signOut()
        return
      }

      // Store user information in localStorage for session management
      localStorage.setItem('userRole', userRole)
      localStorage.setItem('userName', userName)
      localStorage.setItem('userEmail', user.email || '')
      localStorage.setItem('userId', user.uid)
      
      // Store user permissions if available
      if (userData?.permissions) {
        localStorage.setItem('userPermissions', JSON.stringify(userData.permissions))
      }

      // Redirect based on role
      if (userRole === 'admin') {
        router.push('/admin/dashboard')
      } else if (userRole === 'super-admin') {
        router.push('/super-admin/dashboard')
      } else {
        router.push('/')
      }

    } catch (err: any) {
      console.error('Login error:', err)
      
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.')
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.')
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.')
      } else {
        setError('Login failed. Please check your credentials and try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            {...register('email')}
            className={errors.email ? 'border-red-500 pl-10' : 'pl-10'}
            disabled={isLoading}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            {...register('password')}
            className={errors.password ? 'border-red-500 pl-10' : 'pl-10'}
            disabled={isLoading}
          />
        </div>
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      {/* Login Button */}
      <LoadingButton
        type="submit"
        loading={isLoading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
      >
        <LogIn className="w-4 h-4 mr-2" />
        Sign In as {selectedRole === 'admin' ? 'Admin' : 'Super Admin'}
      </LoadingButton>

      {/* Role Info */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          {selectedRole === 'admin' 
            ? 'Access to learner management and platform operations'
            : 'Full platform control and system administration'
          }
        </p>
      </div>
    </form>
  )
}

