'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SuccessPopupProps {
  isVisible: boolean
  onClose: () => void
  title: string
  message: string
  redirectTo: string
  userRole?: string
  className?: string
}

export function SuccessPopup({
  isVisible,
  onClose,
  title,
  message,
  redirectTo,
  userRole,
  className
}: SuccessPopupProps) {
  const [countdown, setCountdown] = useState(3)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (!isVisible) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsRedirecting(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isVisible])

  useEffect(() => {
    if (isVisible && countdown === 0 && !isRedirecting) {
      setIsRedirecting(true)
      // Small delay before redirect to show the redirecting state
      setTimeout(() => {
        window.location.href = redirectTo
      }, 500)
    }
  }, [countdown, isVisible, redirectTo, isRedirecting])

  if (!isVisible) return null

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'super-admin':
        return 'Super Administrator'
      case 'admin':
        return 'Administrator'
      case 'learner':
        return 'Learner'
      case 'applicant':
        return 'Applicant'
      default:
        return 'User'
    }
  }

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'super-admin':
        return 'text-coral'
      case 'admin':
        return 'text-blue-600'
      case 'learner':
        return 'text-green-600'
      case 'applicant':
        return 'text-purple-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={cn(
        "relative w-full max-w-md mx-4 transform transition-all duration-300",
        isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0",
        className
      )}>
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-coral p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="h-8 w-8 text-coral" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-white/90">{message}</p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center space-y-4">
              {userRole && (
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-sm text-gray-600">Welcome,</span>
                  <span className={cn("font-semibold", getRoleColor(userRole))}>
                    {getRoleDisplayName(userRole)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                {isRedirecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-coral" />
                    <span>Redirecting to your dashboard...</span>
                  </>
                ) : (
                  <>
                    <span>Redirecting in</span>
                    <span className="font-bold text-coral text-lg">{countdown}</span>
                    <span>seconds</span>
                  </>
                )}
              </div>

              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <ArrowRight className="h-3 w-3" />
                <span>You will be taken to your personalized dashboard</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-coral h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: isRedirecting ? '100%' : `${((3 - countdown) / 3) * 100}%` 
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Stay Here
              </button>
              <button
                onClick={() => {
                  setIsRedirecting(true)
                  window.location.href = redirectTo
                }}
                disabled={isRedirecting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-coral rounded-lg hover:bg-coral/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isRedirecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Redirecting...</span>
                  </>
                ) : (
                  <>
                    <span>Go Now</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



