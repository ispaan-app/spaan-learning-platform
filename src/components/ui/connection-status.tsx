'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, CheckCircle, AlertTriangle, X, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConnectionStatusProps {
  className?: string
}

export function ConnectionStatus({ className }: ConnectionStatusProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [showNotification, setShowNotification] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setRetryCount(0)
      setShowNotification(true)
      setIsVisible(true)
      
      // Auto-hide after 4 seconds
      setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => setShowNotification(false), 300)
      }, 4000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowNotification(true)
      setIsVisible(true)
    }

    // Listen for online/offline events
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = async () => {
    if (isRetrying) return // Prevent multiple simultaneous retries
    
    setIsRetrying(true)
    setRetryCount(prev => prev + 1)
    
    try {
      // Try to fetch a small resource to test connectivity
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      // If successful, trigger online event
      window.dispatchEvent(new Event('online'))
    } catch (error) {
      // Still offline, keep showing notification
      console.log('Connection test failed:', error)
    } finally {
      setIsRetrying(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => setShowNotification(false), 300)
  }

  if (!showNotification) return null

  return (
    <div className={cn("fixed top-4 right-4 z-50", className)}>
      <div
        className={cn(
          "transform transition-all duration-300 ease-in-out",
          isVisible 
            ? "translate-x-0 opacity-100 scale-100" 
            : "translate-x-full opacity-0 scale-95"
        )}
      >
        <div
          className={cn(
            "flex items-center space-x-3 px-4 py-3 rounded-xl shadow-xl border backdrop-blur-md max-w-sm",
            isOnline
              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800"
              : "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 text-orange-800"
          )}
        >
          <div className="flex-shrink-0">
            {isOnline ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">
              {isOnline ? 'Connection Restored' : 'You\'re Offline'}
            </p>
            <p className="text-xs opacity-90 mt-0.5">
              {isOnline 
                ? 'All your actions have been synced successfully.' 
                : 'Your work is saved locally and will sync when connection is restored.'
              }
            </p>
            {!isOnline && retryCount > 0 && (
              <p className="text-xs opacity-75 mt-1">
                Retry attempts: {retryCount}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {!isOnline && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className={cn(
                  "flex-shrink-0 p-1.5 rounded-full transition-all duration-200",
                  "hover:bg-orange-100 text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed",
                  isRetrying && "animate-spin"
                )}
                title="Retry connection"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
            
            <button
              onClick={handleDismiss}
              className={cn(
                "flex-shrink-0 p-1.5 rounded-full transition-colors",
                isOnline
                  ? "hover:bg-green-100 text-green-600"
                  : "hover:bg-orange-100 text-orange-600"
              )}
              title="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}