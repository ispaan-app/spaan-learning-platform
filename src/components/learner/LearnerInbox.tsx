'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  MessageSquare, 
  Send, 
  Bell, 
  Clock, 
  Star,
  Reply,
  TrendingUp,
  Activity,
  Zap,
  Shield,
  Mail,
  Users,
  Filter,
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  AlertTriangle,
  Heart,
  ThumbsUp,
  Archive,
  Trash2,
  MoreVertical
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { notificationService } from '@/services/notificationService'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { toast } from 'sonner'

interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  read: boolean
  priority: string
  category: string
  createdAt: string
  senderName?: string
  actionUrl?: string
}

interface LearnerUser {
  id: string
  name: string
  email: string
  firstName?: string
  lastName?: string
  role: string
}

export default function LearnerInbox() {
  const { user } = useAuth()
  const [showCompose, setShowCompose] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [learnerUsers, setLearnerUsers] = useState<LearnerUser[]>([])
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [stats, setStats] = useState({
    totalMessages: 0,
    unreadMessages: 0,
    starredMessages: 0,
    urgentMessages: 0,
    todayMessages: 0
  })
  const [loading, setLoading] = useState(true)

  const [composeData, setComposeData] = useState({
    recipientId: '',
    subject: '',
    content: '',
    priority: 'medium',
    category: 'general'
  })

  // Load notifications and learner users
  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      try {
        setLoading(true)
        
        // Load notifications
        const notificationsData = await notificationService.getNotifications(user.uid, 50)
        setNotifications(notificationsData)
        
        // Load learner users for messaging
        const learnerUsersQuery = query(
          collection(db, 'users'),
          where('role', '==', 'learner')
        )
        const learnerUsersSnapshot = await getDocs(learnerUsersQuery)
        const learnerUsersData = learnerUsersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as LearnerUser[]
        setLearnerUsers(learnerUsersData)
        
        // Update stats
        const unreadCount = notificationsData.filter(n => !n.read).length
        const urgentCount = notificationsData.filter(n => n.priority === 'urgent').length
        const todayCount = notificationsData.filter(n => {
          const notificationDate = new Date(n.createdAt)
          const today = new Date()
          return notificationDate.toDateString() === today.toDateString()
        }).length
        
        setStats({
          totalMessages: notificationsData.length,
          unreadMessages: unreadCount,
          starredMessages: 0, // Not implemented yet
          urgentMessages: urgentCount,
          todayMessages: todayCount
        })
        
      } catch (error) {
        console.error('Error loading inbox data:', error)
        toast.error('Failed to load inbox data')
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // Set up real-time subscription
    const unsubscribe = notificationService.subscribeToNotifications(
      user.uid,
      (realTimeNotifications) => {
        setNotifications(realTimeNotifications)
        
        // Update stats with real-time data
        const unreadCount = realTimeNotifications.filter(n => !n.read).length
        const urgentCount = realTimeNotifications.filter(n => n.priority === 'urgent').length
        const todayCount = realTimeNotifications.filter(n => {
          const notificationDate = new Date(n.createdAt)
          const today = new Date()
          return notificationDate.toDateString() === today.toDateString()
        }).length
        
        setStats({
          totalMessages: realTimeNotifications.length,
          unreadMessages: unreadCount,
          starredMessages: 0,
          urgentMessages: urgentCount,
          todayMessages: todayCount
        })
      },
      (error) => {
        console.error('Real-time subscription error:', error)
      }
    )

    return () => {
      unsubscribe()
    }
  }, [user])

  // Handle sending message/notification
  const handleSendMessage = async () => {
    if (!user || !composeData.recipientId || !composeData.subject || !composeData.content) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      await notificationService.notifyUser(
        composeData.recipientId,
        'message_received' as any,
        composeData.subject,
        composeData.content,
        {
          priority: composeData.priority,
          category: composeData.category,
          fromLearner: true,
          senderId: user.uid
        },
        composeData.priority as any
      )

      toast.success('Message sent successfully')
      setShowCompose(false)
      setComposeData({
        recipientId: '',
        subject: '',
        content: '',
        priority: 'medium',
        category: 'general'
      })
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    }
  }

  // Handle marking notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markNotificationRead(notificationId)
      toast.success('Marked as read')
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('Failed to mark as read')
    }
  }

  // Handle marking all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllNotificationsRead(user!.uid)
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      toast.error('Failed to mark all as read')
    }
  }

  // Handle deleting notification
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId)
      toast.success('Notification deleted')
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Failed to delete notification')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59] to-[#2D5A87] opacity-5 rounded-2xl"></div>
        <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl" style={{ backgroundColor: '#FF6E40' }}>
                  <Mail className="h-6 w-6 text-white" />
                </div>
        <div>
                  <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: '#1E3D59' }}>
                    Learner Inbox
                  </h1>
                  <p className="text-gray-600 text-lg">Manage your notifications and messages</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {stats.unreadMessages > 0 && (
                <Button
                  onClick={handleMarkAllAsRead}
                  variant="outline"
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-semibold">Mark All Read</span>
                </Button>
              )}
              <Button
                onClick={() => setShowCompose(true)}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                style={{ backgroundColor: '#FF6E40' }}
              >
                <MessageSquare className="h-5 w-5" />
                <span className="font-semibold">New Message</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Notifications</p>
                <p className="text-3xl font-bold text-blue-600">{stats.unreadMessages}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-600">
                <Bell className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>Unread messages</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Messages</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalMessages}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-600">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <Activity className="h-4 w-4 mr-1" />
              <span>Total messages</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Conversations</p>
                <p className="text-3xl font-bold text-purple-600">{stats.starredMessages}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-600">
                <Reply className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <Zap className="h-4 w-4 mr-1" />
              <span>Active conversations</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                <p className="text-3xl font-bold" style={{ color: '#FF6E40' }}>{stats.todayMessages}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: '#FF6E40' }}>
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <Activity className="h-4 w-4 mr-1" />
              <span>Last 24 hours</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Conversations Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations Sidebar */}
        <div className="lg:col-span-1">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59]/3 to-[#FF6E40]/3 opacity-30"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 rounded-xl" style={{ backgroundColor: '#1E3D59' }}>
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold" style={{ color: '#1E3D59' }}>
                  Conversations
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6E40] mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-6 rounded-full bg-gray-100/80 backdrop-blur-sm w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Bell className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No notifications yet</h3>
                  <p className="text-gray-500 mb-6">You'll see notifications and messages here</p>
                  <Button 
                    onClick={() => setShowCompose(true)} 
                    className="w-full px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    style={{ backgroundColor: '#FF6E40' }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    <span className="font-semibold">Send Message</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl p-4 cursor-pointer hover:shadow-lg hover:border-[#FF6E40]/30 transition-all duration-300 transform hover:-translate-y-1"
                      onClick={() => setSelectedNotification(notification)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59]/5 to-[#FF6E40]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-start space-x-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10 ring-2 ring-white shadow-lg">
                            <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-[#FF6E40] to-[#FF8C69] text-white">
                              {notification.title?.charAt(0) || 'N'}
                            </AvatarFallback>
                          </Avatar>
                          {!notification.read && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-sm truncate" style={{ color: '#1E3D59' }}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                notification.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                notification.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                notification.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {notification.priority}
                              </span>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-[#FF6E40] rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 truncate mb-2">{notification.message}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <div className="flex items-center space-x-1">
                              {!notification.read && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleMarkAsRead(notification.id)
                                  }}
                                  className="h-6 px-2 text-xs"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteNotification(notification.id)
                                }}
                                className="h-6 px-2 text-xs text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
                </Card>
        </div>

        {/* Main Notification View */}
        <div className="lg:col-span-2">
          <Card className="relative overflow-hidden h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59]/3 to-[#FF6E40]/3 opacity-30"></div>
            <CardContent className="relative p-6 h-full">
              {!selectedNotification ? (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <div className="p-8 rounded-full bg-gray-100/80 backdrop-blur-sm w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                    <Bell className="h-16 w-16 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a notification</h3>
                  <p className="text-gray-500">Choose a notification from the sidebar to view details</p>
                </div>
              ) : (
                <div className="space-y-6 h-full flex flex-col">
                  <div className="flex items-center space-x-4 pb-6 border-b border-gray-200/50">
                    <Avatar className="w-12 h-12 ring-2 ring-white shadow-lg">
                      <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-[#FF6E40] to-[#FF8C69] text-white">
                        {selectedNotification.title?.charAt(0) || 'N'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold" style={{ color: '#1E3D59' }}>{selectedNotification.title}</h3>
                      <p className="text-sm text-gray-600">Type: {selectedNotification.type.replace('_', ' ')}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(selectedNotification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedNotification.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        selectedNotification.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        selectedNotification.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {selectedNotification.priority}
                      </span>
                      {!selectedNotification.read && (
                        <div className="w-3 h-3 bg-[#FF6E40] rounded-full"></div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-6">
                    <div className="bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 p-6 rounded-2xl shadow-lg">
                      <p className="whitespace-pre-wrap leading-relaxed text-gray-700">{selectedNotification.message}</p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                      <div className="flex items-center space-x-3">
                        {!selectedNotification.read && (
                          <Button 
                            size="sm" 
                            onClick={() => handleMarkAsRead(selectedNotification.id)}
                            className="px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            style={{ backgroundColor: '#FF6E40' }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            <span className="font-semibold">Mark as Read</span>
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="px-4 py-2 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300"
                        >
                          <Reply className="h-4 w-4 mr-2" />
                          <span className="font-semibold">Reply</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteNotification(selectedNotification.id)}
                          className="px-4 py-2 rounded-xl border-2 border-red-200 hover:bg-red-50 transition-all duration-300 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          <span className="font-semibold">Delete</span>
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="p-2 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Compose Modal */}
      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent className="max-w-3xl bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-2xl">
          <DialogHeader className="pb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: '#FF6E40' }}>
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold" style={{ color: '#1E3D59' }}>
                Start a Conversation
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>To</span>
              </label>
                <Select value={composeData.recipientId} onValueChange={(value) => 
                  setComposeData(prev => ({ ...prev, recipientId: value }))
                }>
                <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6E40]/20 focus:border-[#FF6E40] transition-all duration-300">
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl">
                    {learnerUsers.map((learnerUser) => (
                    <SelectItem key={learnerUser.id} value={learnerUser.id} className="rounded-lg">
                        {learnerUser.firstName && learnerUser.lastName 
                          ? `${learnerUser.firstName} ${learnerUser.lastName} (${learnerUser.role})`
                          : learnerUser.name || learnerUser.email
                        }
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>Subject</span>
              </label>
                <Input
                  value={composeData.subject}
                  onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Enter message subject"
                className="h-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6E40]/20 focus:border-[#FF6E40] transition-all duration-300"
                />
              </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Message</span>
              </label>
                <Textarea
                  value={composeData.content}
                  onChange={(e) => setComposeData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Type your message here..."
                  rows={6}
                className="border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6E40]/20 focus:border-[#FF6E40] transition-all duration-300"
                />
              </div>
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200/50">
              <Button 
                variant="outline" 
                onClick={() => setShowCompose(false)}
                className="px-6 py-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300"
              >
                Cancel
                </Button>
              <Button
                onClick={handleSendMessage}
                className="px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                style={{ backgroundColor: '#FF6E40' }}
              >
                <Send className="h-4 w-4 mr-2" />
                <span className="font-semibold">Send Message</span>
                </Button>
              </div>
            </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}






