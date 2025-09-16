'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, ArrowRight, Loader2, Sparkles, Shield, Zap, Star, Heart, Crown, Users, Award, Target, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EnhancedSuccessPopupProps {
  isVisible: boolean
  onClose: () => void
  title: string
  message: string
  redirectTo: string
  userRole?: string
  className?: string
  redirectMessage?: string
  redirectDelay?: number
  stayLabel?: string
  goLabel?: string
}

export function EnhancedSuccessPopup({
  isVisible,
  onClose,
  title,
  message,
  redirectTo,
  userRole,
  className,
  redirectMessage,
  redirectDelay = 2000,
  stayLabel = 'Stay Here',
  goLabel = 'Continue',
}: EnhancedSuccessPopupProps): JSX.Element | null {
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const popupRef = useState<HTMLDivElement | null>(null)[0]
  const [lastActive, setLastActive] = useState<HTMLElement | null>(null)

  // Focus management
  useEffect(() => {
    if (isVisible) {
      setLastActive(document.activeElement as HTMLElement)
      setTimeout(() => {
        popupRef?.focus()
      }, 0)
      // Trigger celebration animation
      setTimeout(() => setShowCelebration(true), 300)
    } else if (lastActive) {
      lastActive.focus()
    }
  }, [isVisible, lastActive, popupRef])

  // Escape key closes popup
  useEffect(() => {
    if (!isVisible) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isVisible, onClose])

  // Auto-redirect with progress bar
  useEffect(() => {
    if (!isVisible) {
      setIsRedirecting(false)
      setProgress(0)
      setShowCelebration(false)
      return
    }
    if (isRedirecting) return
    setProgress(0)
    let didRedirect = false
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const percent = Math.min(100, (elapsed / redirectDelay) * 100)
      setProgress(percent)
      if (percent >= 100 && !didRedirect) {
        clearInterval(interval)
        setIsRedirecting(true)
        didRedirect = true
        window.location.href = redirectTo
      }
    }, 30)
    return () => clearInterval(interval)
  }, [isVisible, isRedirecting, redirectTo, redirectDelay])

  if (!isVisible) return null

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'super-admin':
        return <Crown className="w-6 h-6" />
      case 'admin':
        return <Shield className="w-6 h-6" />
      case 'learner':
        return <Brain className="w-6 h-6" />
      case 'applicant':
        return <Users className="w-6 h-6" />
      default:
        return <Award className="w-6 h-6" />
    }
  }

  const getRoleGradient = (role?: string) => {
    switch (role) {
      case 'super-admin':
        return 'from-purple-600 via-pink-600 to-red-500'
      case 'admin':
        return 'from-blue-600 via-cyan-600 to-teal-500'
      case 'learner':
        return 'from-green-600 via-emerald-600 to-teal-500'
      case 'applicant':
        return 'from-indigo-600 via-purple-600 to-pink-500'
      default:
        return 'from-gray-600 via-blue-600 to-purple-500'
    }
  }

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-popup-title"
      aria-describedby="success-popup-message"
      tabIndex={-1}
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div
        ref={popupRef as any}
        className={cn(
          "relative w-full max-w-lg mx-4 transform transition-all duration-500 focus:outline-none",
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0",
          className
        )}
        tabIndex={0}
        aria-label="Success Dialog"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header with Gradient */}
          <div className={`bg-gradient-to-r ${getRoleGradient(userRole)} p-8 text-center relative overflow-hidden`}>
            {/* Floating Elements */}
            {showCelebration && (
              <>
                <div className="absolute top-4 right-4 w-6 h-6 bg-white/20 rounded-full animate-bounce delay-300"></div>
                <div className="absolute top-8 right-8 w-4 h-4 bg-white/20 rounded-full animate-bounce delay-500"></div>
                <div className="absolute top-12 right-12 w-3 h-3 bg-white/20 rounded-full animate-bounce delay-700"></div>
                <div className="absolute top-6 left-6 w-5 h-5 bg-white/20 rounded-full animate-bounce delay-1000"></div>
                <div className="absolute top-10 left-10 w-3 h-3 bg-white/20 rounded-full animate-bounce delay-1200"></div>
              </>
            )}
            
            {/* Success Icon with Animation */}
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300">
                <CheckCircle className="h-10 w-10 text-white animate-pulse" />
              </div>
              {showCelebration && (
                <div className="absolute inset-0 w-20 h-20 mx-auto bg-white/10 rounded-full animate-ping"></div>
              )}
            </div>

            {/* Title with Sparkle Effect */}
            <div className="relative">
              <h2 id="success-popup-title" className="text-3xl font-bold text-white mb-3 flex items-center justify-center">
                <Sparkles className="w-8 h-8 mr-3 animate-spin" />
                {title}
                <Sparkles className="w-8 h-8 ml-3 animate-spin" />
              </h2>
              <p id="success-popup-message" className="text-white/90 text-lg leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* User Role Badge */}
            {userRole && (
              <div className="flex justify-center mb-6">
                <div className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${getRoleGradient(userRole)} text-white rounded-full font-semibold shadow-lg`}>
                  {getRoleIcon(userRole)}
                  <span className="ml-2">{getRoleDisplayName(userRole)}</span>
                </div>
              </div>
            )}

            {/* Redirect Status */}
            <div className="text-center space-y-4 mb-8">
              <div className="flex items-center justify-center space-x-3 text-gray-600">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="font-medium">{redirectMessage || 'Preparing your dashboard...'}</span>
              </div>

              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <ArrowRight className="h-4 w-4" />
                <span>You'll be redirected to your personalized workspace</span>
              </div>
            </div>

            {/* Enhanced Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Loading your dashboard</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`bg-gradient-to-r ${getRoleGradient(userRole)} h-3 rounded-full transition-all duration-300 ease-out relative`}
                  style={{ width: `${progress}%` }}
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  role="progressbar"
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                aria-label={stayLabel}
              >
                {stayLabel}
              </button>
              <button
                onClick={() => {
                  setIsRedirecting(true)
                  window.location.href = redirectTo
                }}
                disabled={isRedirecting}
                className={`flex-1 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r ${getRoleGradient(userRole)} rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
                aria-label={goLabel}
              >
                {isRedirecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Redirecting...</span>
                  </>
                ) : (
                  <>
                    <span>{goLabel}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            {/* Security Note */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-medium">
                <Shield className="w-4 h-4 mr-2" />
                Secure connection established
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
