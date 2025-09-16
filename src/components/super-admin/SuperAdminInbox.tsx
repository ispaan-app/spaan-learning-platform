'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Send, 
  Bell, 
  Clock,
  Star,
  Reply,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  Archive,
  Trash2,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/firebase'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  limit,
  Timestamp
} from 'firebase/firestore'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface Message {
  id: string
  senderId: string
  senderName: string
  senderRole: string
  recipientId: string
  recipientName: string
  subject: string
  content: string
  timestamp: Date
  isRead: boolean
  isStarred: boolean
  priority: 'low' | 'normal' | 'high' | 'urgent'
  category: 'general' | 'system' | 'security' | 'support' | 'escalation'
  status: 'sent' | 'delivered' | 'read' | 'replied'
  attachments?: Array<{
    name: string
    url: string
    size: number
    type: string
  }>
}

interface SuperAdminUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'super-admin'
  department?: string
  isActive: boolean
}

interface InboxStats {
  totalMessages: number
  unreadMessages: number
  starredMessages: number
  urgentMessages: number
  todayMessages: number
  escalatedMessages: number
  systemAlerts: number
}

export default function SuperAdminInbox() {
  const { user } = useAuth()
  const [showCompose, setShowCompose] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([])
  const [superAdminUsers, setSuperAdminUsers] = useState<SuperAdminUser[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set())
  
  const [stats, setStats] = useState<InboxStats>({
    totalMessages: 0,
    unreadMessages: 0,
    starredMessages: 0,
    urgentMessages: 0,
    todayMessages: 0,
    escalatedMessages: 0,
    systemAlerts: 0
  })

  const [composeData, setComposeData] = useState({
    recipientId: '',
    subject: '',
    content: '',
    priority: 'normal',
    category: 'general'
  })

  // Fetch messages from Firebase
  useEffect(() => {
    if (!user?.uid) return

    const unsubscribe = onSnapshot(
      query(
        collection(db, 'superAdminMessages'),
        where('recipientId', '==', user.uid),
        orderBy('timestamp', 'desc')
      ),
      (snapshot) => {
        const messagesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date()
        })) as Message[]
        
        setMessages(messagesData)
        setLoading(false)
        
        // Calculate stats
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        
        const newStats: InboxStats = {
          totalMessages: messagesData.length,
          unreadMessages: messagesData.filter(m => !m.isRead).length,
          starredMessages: messagesData.filter(m => m.isStarred).length,
          urgentMessages: messagesData.filter(m => m.priority === 'urgent').length,
          todayMessages: messagesData.filter(m => m.timestamp >= today).length,
          escalatedMessages: messagesData.filter(m => m.category === 'escalation').length,
          systemAlerts: messagesData.filter(m => m.category === 'system').length
        }
        
        setStats(newStats)
      },
      (error) => {
        console.error('Error fetching messages:', error)
        setError('Failed to load messages')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user?.uid])

  // Fetch super admin users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(
          query(
            collection(db, 'users'),
            where('role', 'in', ['admin', 'super-admin'])
          )
        )
        
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SuperAdminUser[]
        
        setSuperAdminUsers(usersData)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUsers()
  }, [])

  // Filter messages based on search and filters
  useEffect(() => {
    let filtered = messages

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(message =>
        message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.senderName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(message => message.category === filterCategory)
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(message => message.priority === filterPriority)
    }

    setFilteredMessages(filtered)
  }, [messages, searchQuery, filterCategory, filterPriority])

  const handleSendMessage = async () => {
    if (!composeData.recipientId || !composeData.subject || !composeData.content) return

    try {
      const recipient = superAdminUsers.find(u => u.id === composeData.recipientId)
      
      const messageData = {
        senderId: user?.uid,
        senderName: user?.displayName || 'Super Admin',
        senderRole: 'super-admin',
        recipientId: composeData.recipientId,
        recipientName: recipient?.name || 'Unknown',
        subject: composeData.subject,
        content: composeData.content,
        timestamp: new Date(),
        isRead: false,
        isStarred: false,
        priority: composeData.priority,
        category: composeData.category,
        status: 'sent',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await addDoc(collection(db, 'superAdminMessages'), messageData)
      
      // Reset form
      setComposeData({
        recipientId: '',
        subject: '',
        content: '',
        priority: 'normal',
        category: 'general'
      })
      setShowCompose(false)
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to send message')
    }
  }

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await updateDoc(doc(db, 'superAdminMessages', messageId), {
        isRead: true,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const handleStarMessage = async (messageId: string, isStarred: boolean) => {
    try {
      await updateDoc(doc(db, 'superAdminMessages', messageId), {
        isStarred: !isStarred,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error starring message:', error)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteDoc(doc(db, 'superAdminMessages', messageId))
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null)
      }
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  const handleBulkAction = async (action: 'read' | 'star' | 'delete') => {
    const selectedIds = Array.from(selectedMessages)
    
    try {
      for (const messageId of selectedIds) {
        switch (action) {
          case 'read':
            await updateDoc(doc(db, 'superAdminMessages', messageId), {
              isRead: true,
              updatedAt: new Date()
            })
            break
          case 'star':
            const message = messages.find(m => m.id === messageId)
            if (message) {
              await updateDoc(doc(db, 'superAdminMessages', messageId), {
                isStarred: !message.isStarred,
                updatedAt: new Date()
              })
            }
            break
          case 'delete':
            await deleteDoc(doc(db, 'superAdminMessages', messageId))
            break
        }
      }
      setSelectedMessages(new Set())
    } catch (error) {
      console.error('Error performing bulk action:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system': return <Shield className="w-4 h-4" />
      case 'security': return <AlertTriangle className="w-4 h-4" />
      case 'escalation': return <AlertTriangle className="w-4 h-4" />
      case 'support': return <Users className="w-4 h-4" />
      default: return <MessageSquare className="w-4 h-4" />
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>Loading inbox...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Super Admin Inbox</h1>
          <p className="text-gray-600">Manage system-wide notifications and communications</p>
        </div>
        <div className="flex items-center space-x-2">
          {selectedMessages.size > 0 && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleBulkAction('read')}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Read
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleBulkAction('star')}
              >
                <Star className="w-4 h-4 mr-2" />
                Star
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => handleBulkAction('delete')}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </>
          )}
          <Button onClick={() => setShowCompose(true)}>
            <MessageSquare className="w-4 h-4 mr-2" />
            New Message
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Notifications</p>
                <p className="text-2xl font-bold">{stats.unreadMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Messages</p>
                <p className="text-2xl font-bold">{stats.totalMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold">{stats.urgentMessages}</p>
                <p className="text-xs text-gray-500">escalations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                <p className="text-2xl font-bold">{stats.todayMessages}</p>
                <p className="text-xs text-gray-500">last 24h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="escalation">Escalation</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content - Conversations Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                  <p className="text-gray-500 mb-4">Start a conversation with someone</p>
                  <Button onClick={() => setShowCompose(true)} className="w-full">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Start Conversation
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedMessage?.id === message.id ? 'bg-blue-50 border-blue-200' : ''
                      } ${!message.isRead ? 'bg-blue-50' : ''}`}
                      onClick={() => {
                        setSelectedMessage(message)
                        if (!message.isRead) {
                          handleMarkAsRead(message.id)
                        }
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedMessages.has(message.id)}
                          onChange={(e) => {
                            e.stopPropagation()
                            const newSelected = new Set(selectedMessages)
                            if (e.target.checked) {
                              newSelected.add(message.id)
                            } else {
                              newSelected.delete(message.id)
                            }
                            setSelectedMessages(newSelected)
                          }}
                          className="mt-1 rounded border-gray-300"
                        />
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {message.senderName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate">{message.senderName}</h4>
                            <div className="flex items-center space-x-1">
                              {message.isStarred && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                              {!message.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{message.subject}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={`text-xs ${getPriorityColor(message.priority)}`}>
                              {message.priority}
                            </Badge>
                            <span className="text-xs text-gray-400">{formatTimeAgo(message.timestamp)}</span>
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

        {/* Main Conversation View */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="p-6">
              {!selectedMessage ? (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{selectedMessage.senderName?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{selectedMessage.senderName}</h3>
                        <p className="text-sm text-gray-500">{selectedMessage.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(selectedMessage.priority)}>
                        {selectedMessage.priority}
                      </Badge>
                      <Badge variant="outline">
                        {selectedMessage.category}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleStarMessage(selectedMessage.id, selectedMessage.isStarred)}>
                            <Star className="w-4 h-4 mr-2" />
                            {selectedMessage.isStarred ? 'Unstar' : 'Star'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleMarkAsRead(selectedMessage.id)}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark as Read
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteMessage(selectedMessage.id)} className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Reply className="w-4 h-4 mr-2" />
                        Reply
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStarMessage(selectedMessage.id, selectedMessage.isStarred)}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        {selectedMessage.isStarred ? 'Unstar' : 'Star'}
                      </Button>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Start a Conversation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">To</label>
              <Select value={composeData.recipientId} onValueChange={(value) => 
                setComposeData(prev => ({ ...prev, recipientId: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {superAdminUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <Select value={composeData.priority} onValueChange={(value) => 
                  setComposeData(prev => ({ ...prev, priority: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <Select value={composeData.category} onValueChange={(value) => 
                  setComposeData(prev => ({ ...prev, category: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="escalation">Escalation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Subject</label>
              <Input
                value={composeData.subject}
                onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter message subject"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Message</label>
              <Textarea
                value={composeData.content}
                onChange={(e) => setComposeData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Type your message here..."
                rows={6}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCompose(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendMessage}>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
