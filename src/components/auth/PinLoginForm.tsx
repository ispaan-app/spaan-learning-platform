'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginWithPin } from '@/app/actions/authActions'
// Removed unused form imports
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingButton } from '@/components/ui/loading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EnhancedSuccessPopup } from '@/components/ui/enhanced-success-popup'

export function PinLoginForm() {
  const [formData, setFormData] = useState({
    idNumber: '',
    pin: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [loginResult, setLoginResult] = useState<{
    userRole: string
    redirectTo: string
  } | null>(null)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Format PIN input to only allow 6 digits
    if (name === 'pin') {
      const numericValue = value.replace(/\D/g, '').slice(0, 6)
      setFormData(prev => ({ ...prev, [name]: numericValue }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const formDataObj = new FormData()
      formDataObj.append('idNumber', formData.idNumber)
      formDataObj.append('pin', formData.pin)

      const result = await loginWithPin(formData.idNumber, formData.pin)
      
      if (result.success && result.customToken) {
        // Store user data in session/localStorage for now
        // In a real app, you'd use proper session management
        const userData = {
          id: result.userId,
          role: result.userRole,
          customToken: result.customToken
        }
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Determine redirect URL based on user role
        let redirectTo = '/applicant/dashboard'
        switch (result.userRole) {
          case 'applicant':
            redirectTo = '/applicant/dashboard'
            break
          case 'learner':
            redirectTo = '/learner/dashboard'
            break
          case 'admin':
            redirectTo = '/admin/dashboard'
            break
          case 'super-admin':
            redirectTo = '/super-admin/dashboard'
            break
          default:
            redirectTo = '/applicant/dashboard'
        }

        // Set login result and show success popup
        setLoginResult({
          userRole: result.userRole,
          redirectTo
        })
        setShowSuccessPopup(true)
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    }
    
    setLoading(false)
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              User Login
            </CardTitle>
            <p className="text-gray-600">
              Enter your ID Number and PIN to access your account
            </p>
          </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div>
                  <label htmlFor="idNumber">ID Number</label>
                  <input
                    id="idNumber"
                    name="idNumber"
                    type="text"
                    required
                    value={formData.idNumber}
                    onChange={handleChange}
                    placeholder="Enter your ID number"
                  />
                </div>

                <div>
                  <label htmlFor="pin">PIN</label>
                  <input
                    id="pin"
                    name="pin"
                    type="password"
                    required
                    value={formData.pin}
                    onChange={handleChange}
                    placeholder="Enter your 6-digit PIN"
                    maxLength={6}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter the 6-digit PIN you received after registration
                  </p>
                </div>

                <LoadingButton
                  type="submit"
                  loading={loading}
                  className="w-full"
                >
                  Sign In
                </LoadingButton>
              </form>

              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <a href="/apply" className="font-medium text-blue-600 hover:text-blue-500">
                    Apply now
                  </a>
                </p>
                <p className="text-sm text-gray-600">
                  Forgot your PIN?{' '}
                  <a href="/reset-pin" className="font-medium text-blue-600 hover:text-blue-500">
                    Reset PIN
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

  {/* Enhanced Success Popup with modern UI/UX */}
  {loginResult && (
    <EnhancedSuccessPopup
      isVisible={showSuccessPopup}
      onClose={() => setShowSuccessPopup(false)}
      title="Welcome Back!"
      message="You have successfully logged in to your account. Your personalized dashboard is ready!"
      redirectTo={loginResult.redirectTo}
      userRole={loginResult.userRole}
      redirectMessage="Preparing your personalized dashboard..."
      redirectDelay={2500}
      stayLabel="Stay Here"
      goLabel="Go to Dashboard"
    />
  )}
    </>
  )
}
