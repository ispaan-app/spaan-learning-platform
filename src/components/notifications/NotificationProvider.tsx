'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { notificationService } from '@/services/notificationService'
import { Notification } from '@/types/notifications'
import { useAppStore } from '@/store/appStore'

interface NotificationContextType {
  // This will be handled by the app store
}

const NotificationContext = createContext<NotificationContextType>({})

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth()
  const { addNotification } = useAppStore()

  useEffect(() => {
    if (!user) return

    // Subscribe to real-time notifications and sync with app store
    const unsubscribe = notificationService.subscribeToNotifications(user.uid, (notifications) => {
      // Get unread notifications
      const unreadNotifications = notifications.filter(n => !n.read)
      
      // Add new unread notifications to app store
      unreadNotifications.forEach(notification => {
        // Check if notification already exists in app store
        const existingNotifications = useAppStore.getState().notifications
        const exists = existingNotifications.some(n => n.id === notification.id)
        
        if (!exists) {
          addNotification({
            title: notification.title,
            message: notification.message,
            type: notification.type as 'info' | 'success' | 'warning' | 'error',
            read: notification.read,
            actionUrl: notification.actionUrl
          })
        }
      })
    })

    return () => {
      unsubscribe()
    }
  }, [user, addNotification])

  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotificationContext = () => useContext(NotificationContext)


