'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Bell, 
  MessageSquare, 
  Search, 
  Filter, 
  Check, 
  CheckCheck, 
  Trash2, 
  MoreHorizontal,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  User,
  Building,
  BookOpen,
  Target,
  Award,
  Settings,
  Shield,
  FileText,
  ExternalLink
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Notification, 
  Message, 
  Conversation, 
  InboxStats,
  NotificationType,
  NotificationCategory,
  NotificationPriority
} from '@/types/notifications'
import { notificationService } from '@/services/notificationService'
import { useAuth } from '@/hooks/useAuth'
import { toast as sonnerToast } from 'sonner'
import { cn } from '@/lib/utils'
import { MessagingInterface } from './MessagingInterface'

interface InboxProps {
  className?: string
}

export function Inbox({ className }: InboxProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('notifications')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [stats, setStats] = useState<InboxStats>({
    totalNotifications: 0,
    unreadNotifications: 0,
    totalMessages: 0,
    unreadMessages: 0,
    unreadConversations: 0,
    recentActivity: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<NotificationCategory | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<NotificationPriority | 'all'>('all')
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user) return

    loadData()

    // Subscribe to real-time updates
    const unsubscribe = notificationService.subscribeToNotifications(user.uid, (notifications) => {
      setNotifications(notifications)
    }, (error) => {
      console.error('Real-time notification subscription error:', error)
      // Don't show error toast for subscription issues
    })

    return () => {
      unsubscribe()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const [notificationsData, conversationsData, statsData] = await Promise.all([
        notificationService.getNotifications(user.uid),
        notificationService.getConversations(user.uid),
        notificationService.getInboxStats(user.uid)
      ])

      setNotifications(notificationsData)
      setConversations(conversationsData)
      setStats(statsData)

      // Load messages for the most recent conversation
      if (conversationsData.length > 0) {
        try {
          const recentConversation = conversationsData[0]
          const messagesData = await notificationService.getConversationMessages(recentConversation.id)
          setMessages(messagesData)
        } catch (messageError) {
          console.error('Error loading conversation messages:', messageError)
          // Don't show error for messages as it's not critical
        }
      }
    } catch (error) {
      console.error('Error loading inbox data:', error)
      // Set default empty data instead of showing error toast
      setNotifications([])
      setConversations([])
      setMessages([])
      setStats({
        totalNotifications: 0,
        unreadNotifications: 0,
        totalMessages: 0,
        unreadMessages: 0,
        unreadConversations: 0,
        recentActivity: 0
      })
      // Only show error if it's a critical error, not just missing data
      if (error instanceof Error && !error.message.includes('permission')) {
        sonnerToast.error('Failed to load inbox data')
      }
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
      sonnerToast.success('Marked as read')
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
      sonnerToast.success('All notifications marked as read')
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      sonnerToast.error('Failed to mark all as read')
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      sonnerToast.success('Notification deleted')
    } catch (error) {
      console.error('Error deleting notification:', error)
      sonnerToast.error('Failed to delete notification')
    }
  }

  const handleDeleteSelected = async () => {
    if (!user || selectedNotifications.size === 0) return

    try {
      const promises = Array.from(selectedNotifications).map(id => 
        notificationService.deleteNotification(id)
      )
      await Promise.all(promises)
      
      setNotifications(prev => prev.filter(n => !selectedNotifications.has(n.id)))
      setSelectedNotifications(new Set())
      sonnerToast.success(`${selectedNotifications.size} notifications deleted`)
    } catch (error) {
      console.error('Error deleting selected notifications:', error)
      sonnerToast.error('Failed to delete notifications')
    }
  }

  const toggleNotificationSelection = (notificationId: string) => {
    const newSelection = new Set(selectedNotifications)
    if (newSelection.has(notificationId)) {
      newSelection.delete(notificationId)
    } else {
      newSelection.add(notificationId)
    }
    setSelectedNotifications(newSelection)
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
      'profile_updated': <User className="w-4 h-4" />,
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

  const getCategoryColor = (category: NotificationCategory) => {
    const colorMap: Record<NotificationCategory, string> = {
      'applications': 'bg-blue-100 text-blue-800',
      'placements': 'bg-green-100 text-green-800',
      'sessions': 'bg-purple-100 text-purple-800',
      'announcements': 'bg-yellow-100 text-yellow-800',
      'messages': 'bg-pink-100 text-pink-800',
      'system': 'bg-gray-100 text-gray-800',
      'security': 'bg-red-100 text-red-800',
      'achievements': 'bg-indigo-100 text-indigo-800',
      'reminders': 'bg-orange-100 text-orange-800'
    }
    return colorMap[category]
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || notification.category === categoryFilter
    const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter
    
    return matchesSearch && matchesCategory && matchesPriority
  })

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
          <p className="text-gray-600">Manage your notifications and messages</p>
        </div>
        <div className="flex items-center space-x-2">
          {selectedNotifications.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedNotifications.size})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={stats.unreadNotifications === 0}
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Notifications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalNotifications}</p>
                {stats.unreadNotifications > 0 && (
                  <Badge variant="destructive" className="mt-1">
                    {stats.unreadNotifications} unread
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMessages}</p>
                {stats.unreadMessages > 0 && (
                  <Badge variant="destructive" className="mt-1">
                    {stats.unreadMessages} unread
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Conversations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unreadConversations}</p>
                <p className="text-xs text-gray-500">unread</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentActivity}</p>
                <p className="text-xs text-gray-500">last 24h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
            {stats.unreadNotifications > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.unreadNotifications}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Messages</span>
            {stats.unreadMessages > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.unreadMessages}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as NotificationCategory | 'all')}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="applications">Applications</SelectItem>
                <SelectItem value="placements">Placements</SelectItem>
                <SelectItem value="sessions">Sessions</SelectItem>
                <SelectItem value="announcements">Announcements</SelectItem>
                <SelectItem value="messages">Messages</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="achievements">Achievements</SelectItem>
                <SelectItem value="reminders">Reminders</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as NotificationPriority | 'all')}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {notifications.length === 0 
                      ? 'No notifications yet' 
                      : 'No notifications found'
                    }
                  </h3>
                  <p className="text-gray-500">
                    {notifications.length === 0 
                      ? 'Notifications will appear here when you receive them.'
                      : searchTerm || categoryFilter !== 'all' || priorityFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'You\'re all caught up!'
                    }
                  </p>
                  {notifications.length === 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-400">
                        This could be because:
                      </p>
                      <ul className="text-sm text-gray-400 mt-2 space-y-1">
                        <li>• No notifications have been sent yet</li>
                        <li>• The notifications collection hasn't been initialized</li>
                        <li>• You don't have permission to view notifications</li>
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={cn(
                    "transition-all duration-200 hover:shadow-md",
                    !notification.read && "border-l-4 border-l-blue-500 bg-blue-50/50",
                    selectedNotifications.has(notification.id) && "ring-2 ring-blue-500"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.has(notification.id)}
                        onChange={() => toggleNotificationSelection(notification.id)}
                        className="mt-1 rounded border-gray-300"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className={cn("p-2 rounded-lg", 
                              notification.read ? "bg-gray-100" : "bg-blue-100"
                            )}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className={cn(
                                  "font-medium text-sm",
                                  !notification.read && "font-semibold"
                                )}>
                                  {notification.title}
                                </h3>
                                <Badge 
                                  variant="secondary" 
                                  className={cn("text-xs", getCategoryColor(notification.category))}
                                >
                                  {notification.category}
                                </Badge>
                                <span className={cn("text-xs", getPriorityColor(notification.priority))}>
                                  {notification.priority}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>{formatTimeAgo(notification.createdAt)}</span>
                                {notification.senderName && (
                                  <span>From: {notification.senderName}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {!notification.read && (
                                <DropdownMenuItem onClick={() => handleMarkAsRead(notification.id)}>
                                  <Check className="w-4 h-4 mr-2" />
                                  Mark as Read
                                </DropdownMenuItem>
                              )}
                              {notification.actionUrl && (
                                <DropdownMenuItem onClick={() => window.open(notification.actionUrl, '_blank')}>
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleDeleteNotification(notification.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <MessagingInterface />
        </TabsContent>
      </Tabs>
    </div>
  )
}



