'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'

export default function UnauthorizedPage() {
  const router = useRouter()
  const { user, userRole } = useAuth()

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!user) {
      router.push('/login')
      return
    }

    // If user is a learner, redirect to their dashboard
    if (userRole === 'learner') {
      router.push('/learner/dashboard')
      return
    }

    // If user is admin, redirect to admin dashboard
    if (userRole === 'admin') {
      router.push('/admin/dashboard')
      return
    }

    // If user is super-admin, redirect to super-admin dashboard
    if (userRole === 'super-admin') {
      router.push('/super-admin/dashboard')
      return
    }
  }, [user, userRole, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <p className="text-gray-600">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-gray-500">
              Please contact your administrator if you believe this is an error.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
            
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>

          {user && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Logged in as: <span className="font-medium">{user.email}</span>
              </p>
              <p className="text-xs text-gray-500">
                Role: <span className="font-medium">{userRole || 'Unknown'}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
