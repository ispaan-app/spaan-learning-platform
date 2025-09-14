'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { X, Bell, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  dismissible?: boolean
  timestamp: Date
}

interface NotificationBannerProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
  className?: string
}

export function NotificationBanner({ notifications, onDismiss, className }: NotificationBannerProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Show only the latest 3 notifications
    setVisibleNotifications(notifications.slice(0, 3))
  }, [notifications])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  if (visibleNotifications.length === 0) {
    return null
  }

  return (
    <div className={cn("space-y-2", className)}>
      {visibleNotifications.map((notification) => (
        <Alert
          key={notification.id}
          className={cn(
            "relative animate-in slide-in-from-top duration-300",
            getNotificationStyles(notification.type)
          )}
        >
          <div className="flex items-start space-x-2">
            {getNotificationIcon(notification.type)}
            <div className="flex-1 min-w-0">
              <AlertDescription className="font-medium text-sm">
                {notification.title}
              </AlertDescription>
              <AlertDescription className="text-xs mt-1">
                {notification.message}
              </AlertDescription>
              {notification.action && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={notification.action.onClick}
                  className="mt-2 text-xs"
                >
                  {notification.action.label}
                </Button>
              )}
            </div>
            {notification.dismissible !== false && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(notification.id)}
                className="absolute top-2 right-2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </Alert>
      ))}
    </div>
  )
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAllNotifications
  }
}








