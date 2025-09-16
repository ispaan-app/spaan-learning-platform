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
import { loginWithPin } from '@/app/actions/authActions'
import { useAuth } from '@/hooks/useAuth'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { SuccessPopup } from '@/components/ui/success-popup'
import { Logo } from '@/components/ui/logo'

const loginSchema = z.object({
  idNumber: z.string()
    .min(1, 'ID number is required')
    .regex(/^\d{13}$/, 'ID number must be 13 digits'),
  pin: z.string()
    .min(6, 'PIN must be 6 digits')
    .max(6, 'PIN must be 6 digits')
    .regex(/^\d{6}$/, 'PIN must be 6 digits')
})

type LoginFormData = z.infer<typeof loginSchema>

export function UserLoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [loginResult, setLoginResult] = useState<{
    userRole: string
    redirectTo: string
  } | null>(null)
  const router = useRouter()
  const { signInWithCustomToken } = useAuth()

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
      const result = await loginWithPin(data.idNumber, data.pin)
      
      if (result.success && result.customToken) {
        // Sign in with custom token
        const signInResult = await signInWithCustomToken(result.customToken)
        
        if (signInResult.success) {
          // Determine redirect URL based on user role
          let redirectTo = '/applicant/dashboard'
          if (result.userRole === 'applicant') {
            redirectTo = '/applicant/dashboard'
          } else if (result.userRole === 'learner') {
            redirectTo = '/learner/dashboard'
          } else if (result.userRole === 'admin') {
            redirectTo = '/admin/dashboard'
          } else if (result.userRole === 'super-admin') {
            redirectTo = '/super-admin/dashboard'
          } else {
            redirectTo = '/'
          }

          // Set login result and show success popup with custom redirect message
          setLoginResult({
            userRole: result.userRole,
            redirectTo
          })
          setShowSuccessPopup(true)
        } else {
          setError(signInResult.error || 'Authentication failed. Please try again.')
        }
      } else {
        setError(result.error || 'Login failed. Please check your credentials.')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="text-center mb-6">
        <Logo size="md" showText={true} />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* ID Number Field */}
        <div className="space-y-2">
          <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700">
            ID Number
          </label>
          <Input
            id="idNumber"
            type="text"
            placeholder="Enter your 13-digit ID number"
            {...register('idNumber')}
            className={errors.idNumber ? 'border-red-500' : ''}
            disabled={isLoading}
          />
          {errors.idNumber && (
            <p className="text-sm text-red-600">{errors.idNumber.message}</p>
          )}
        </div>

        {/* PIN Field */}
        <div className="space-y-2">
          <label htmlFor="pin" className="block text-sm font-medium text-gray-700">
            PIN
          </label>
          <div className="relative">
            <Input
              id="pin"
              type={showPin ? 'text' : 'password'}
              placeholder="Enter your 6-digit PIN"
              {...register('pin')}
              className={errors.pin ? 'border-red-500 pr-10' : 'pr-10'}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              {showPin ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.pin && (
            <p className="text-sm text-red-600">{errors.pin.message}</p>
          )}
        </div>

        {/* Login Button */}
        <LoadingButton
          type="submit"
          loading={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Sign In
        </LoadingButton>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Forgot your PIN? Contact support for assistance.
          </p>
        </div>
      </form>

  {/* Success Popup with custom redirect message */}
  {loginResult && (
    <SuccessPopup
      isVisible={showSuccessPopup}
      onClose={() => setShowSuccessPopup(false)}
      title="Login Successful!"
      message="Welcome back! You have successfully logged in to your account."
      redirectTo={loginResult.redirectTo}
      userRole={loginResult.userRole}
      redirectMessage="You are being securely redirected to your dashboard..."
    />
  )}
    </>
  )
}
