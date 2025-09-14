'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function OfflineNotification() {
  const [isOnline, setIsOnline] = useState(true)
  const [showNotification, setShowNotification] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setShowNotification(true)
      setIsVisible(true)
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => setShowNotification(false), 300)
      }, 3000)
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

  if (!showNotification) return null

  return (
    <div className="fixed top-4 right-4 z-50">
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
            "flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm max-w-sm",
            isOnline
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-orange-50 border-orange-200 text-orange-800"
          )}
        >
          <div className="flex-shrink-0">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-orange-600" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {isOnline ? 'Connection Restored' : 'You\'re Offline'}
            </p>
            <p className="text-xs opacity-90">
              {isOnline 
                ? 'Your actions have been synced successfully.' 
                : 'Actions will sync when connection is restored.'
              }
            </p>
          </div>

          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(() => setShowNotification(false), 300)
            }}
            className={cn(
              "flex-shrink-0 p-1 rounded-full transition-colors",
              isOnline
                ? "hover:bg-green-100 text-green-600"
                : "hover:bg-orange-100 text-orange-600"
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}



