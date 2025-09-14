'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bell, 
  Check, 
  CheckCheck, 
  ExternalLink, 
  MoreHorizontal,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  FileText,
  Building,
  Calendar,
  BookOpen,
  Settings,
  Shield,
  Award,
  Target,
  MessageSquare
} from 'lucide-react'
import { 
  Notification, 
  NotificationType,
  NotificationCategory,
  NotificationPriority
} from '@/types/notifications'
import { notificationService } from '@/services/notificationService'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { toast as sonnerToast } from 'sonner'
import { cn } from '@/lib/utils'

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className }: NotificationBellProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    // Load initial notifications
    loadNotifications()

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
      const notificationsData = await notificationService.getNotifications(user.uid, 10)
      setNotifications(notificationsData)
      setUnreadCount(notificationsData.filter(n => !n.read).length)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markNotificationRead(notificationId)
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
      sonnerToast.error('Failed to mark as read')
    }
  }

  const handleMarkAllAsRead = async () => {
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

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      await handleMarkAsRead(notification.id)
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    } else {
      // Navigate to inbox
      router.push('/admin/inbox')
    }
  }

  const getNotificationIcon = (type: NotificationType) => {
    const iconMap: Record<NotificationType, React.ReactNode> = {
      'application_received': <FileText className="w-4 h-4" />,
      'application_approved': <CheckCircle className="w-4 h-4" />,
      'application_rejected': <AlertCircle className="w-4 h-4" />,
      'placement_assigned': <Building className="w-4 h-4" />,
      'placement_updated': <Building className="w-4 h-4" />,
      'session_scheduled': <Calendar className="w-4 h-4" />,
      'session_reminder': <Clock className="w-4 h-4" />,
      'hours_logged': <BookOpen className="w-4 h-4" />,
      'issue_reported': <AlertTriangle className="w-4 h-4" />,
      'issue_resolved': <CheckCircle className="w-4 h-4" />,
      'announcement': <Bell className="w-4 h-4" />,
      'message_received': <MessageSquare className="w-4 h-4" />,
      'system_maintenance': <Settings className="w-4 h-4" />,
      'profile_updated': <Info className="w-4 h-4" />,
      'password_changed': <Shield className="w-4 h-4" />,
      'security_alert': <Shield className="w-4 h-4" />,
      'welcome': <Info className="w-4 h-4" />,
      'reminder': <Clock className="w-4 h-4" />,
      'achievement': <Award className="w-4 h-4" />,
      'deadline_approaching': <Target className="w-4 h-4" />
    }

    return iconMap[type] || <Info className="w-4 h-4" />
  }

  const getPriorityColor = (priority: NotificationPriority) => {
    const colorMap: Record<NotificationPriority, string> = {
      'low': 'text-gray-500',
      'medium': 'text-blue-500',
      'high': 'text-orange-500',
      'urgent': 'text-red-500'
    }
    return colorMap[priority]
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`
    
    return date.toLocaleDateString()
  }

  const recentNotifications = notifications.slice(0, 5)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("h-9 w-9 relative", className)}>
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-6 px-2 text-xs"
              >
                <CheckCheck className="w-3 h-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <ScrollArea className="h-96">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="p-4 text-center">
              <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No notifications</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentNotifications.map((notification) => (
                <DropdownMenuItem 
                  key={notification.id} 
                  className={cn(
                    "flex flex-col items-start p-3 cursor-pointer",
                    !notification.read && "bg-blue-50 border-l-2 border-l-blue-500"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start w-full space-x-3">
                    <div className={cn(
                      "p-2 rounded-lg flex-shrink-0",
                      notification.read ? "bg-gray-100" : "bg-blue-100"
                    )}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={cn(
                          "text-sm font-medium truncate",
                          !notification.read && "font-semibold"
                        )}>
                          {notification.title}
                        </h4>
                        <span className={cn(
                          "text-xs ml-2",
                          getPriorityColor(notification.priority)
                        )}>
                          {notification.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        {notification.senderName && (
                          <span className="text-xs text-gray-500 truncate ml-2">
                            From: {notification.senderName}
                          </span>
                        )}
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>

        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => router.push('/admin/inbox')}
          className="text-center justify-center"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}





