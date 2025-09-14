'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LoadingSpinner } from '@/components/ui/loading'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
  fallbackPath?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallbackPath = '/login' 
}: ProtectedRouteProps) {
  const { user, loading, userRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(fallbackPath)
        return
      }

      if (requiredRole && userRole !== requiredRole) {
        // Redirect to appropriate dashboard based on user role
        switch (userRole) {
          case 'admin':
            router.push('/admin')
            break
          case 'super-admin':
            router.push('/super-admin')
            break
          case 'applicant':
            router.push('/applicant')
            break
          case 'learner':
          default:
            router.push('/learner')
            break
        }
        return
      }
    }
  }, [user, loading, userRole, requiredRole, router, fallbackPath])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (requiredRole && userRole !== requiredRole) {
    return null
  }

  return <>{children}</>
}

