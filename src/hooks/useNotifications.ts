'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { notificationService } from '@/services/notificationService'
import { Notification, InboxStats } from '@/types/notifications'
import { toast as sonnerToast } from 'sonner'

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [stats, setStats] = useState<InboxStats>({
    totalNotifications: 0,
    unreadNotifications: 0,
    totalMessages: 0,
    unreadMessages: 0,
    unreadConversations: 0,
    recentActivity: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return
    }

    // Load initial data
    loadNotifications()
    loadStats()

    // Subscribe to real-time updates
    const unsubscribe = notificationService.subscribeToNotifications(user.uid, (notifications) => {
      setNotifications(notifications)
      setUnreadCount(notifications.filter(n => !n.read).length)
    })

    return () => {
      unsubscribe()
    }
  }, [user])

  const loadNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      const notificationsData = await notificationService.getNotifications(user.uid)
      setNotifications(notificationsData)
      setUnreadCount(notificationsData.filter(n => !n.read).length)
    } catch (error) {
      console.error('Error loading notifications:', error)
      sonnerToast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    if (!user) return

    try {
      const statsData = await notificationService.getInboxStats(user.uid)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading inbox stats:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markNotificationRead(notificationId)
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
      sonnerToast.success('Marked as read')
    } catch (error) {
      console.error('Error marking notification as read:', error)
      sonnerToast.error('Failed to mark as read')
    }
  }

  const markAllAsRead = async () => {
    if (!user) return

    try {
      await notificationService.markAllNotificationsRead(user.uid)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
      sonnerToast.success('All notifications marked as read')
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      sonnerToast.error('Failed to mark all as read')
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      const deletedNotification = notifications.find(n => n.id === notificationId)
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      sonnerToast.success('Notification deleted')
    } catch (error) {
      console.error('Error deleting notification:', error)
      sonnerToast.error('Failed to delete notification')
    }
  }

  const deleteAllNotifications = async () => {
    if (!user) return

    try {
      await notificationService.deleteAllNotifications(user.uid)
      setNotifications([])
      setUnreadCount(0)
      sonnerToast.success('All notifications deleted')
    } catch (error) {
      console.error('Error deleting all notifications:', error)
      sonnerToast.error('Failed to delete all notifications')
    }
  }

  const refreshNotifications = async () => {
    await loadNotifications()
    await loadStats()
  }

  return {
    notifications,
    unreadCount,
    stats,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refreshNotifications
  }
}


