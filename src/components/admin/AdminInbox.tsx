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

interface Message {
  id: string
  senderName: string
  subject: string
  content: string
  timestamp: Date
  isRead: boolean
  isStarred: boolean
}

interface AdminUser {
  id: string
  name: string
  email: string
}

export default function AdminInbox() {
  const { user } = useAuth()
  const [showCompose, setShowCompose] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [stats, setStats] = useState({
    totalMessages: 0,
    unreadMessages: 0,
    starredMessages: 0,
    urgentMessages: 0,
    todayMessages: 0
  })

  const [composeData, setComposeData] = useState({
    recipientId: '',
    subject: '',
    content: '',
    priority: 'normal',
    category: 'general'
  })

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
                    Inbox
                  </h1>
                  <p className="text-gray-600 text-lg">Manage your notifications and messages</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
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
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-6 rounded-full bg-gray-100/80 backdrop-blur-sm w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <MessageSquare className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No conversations yet</h3>
                  <p className="text-gray-500 mb-6">Start a conversation with someone</p>
                  <Button 
                    onClick={() => setShowCompose(true)} 
                    className="w-full px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    style={{ backgroundColor: '#FF6E40' }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    <span className="font-semibold">Start Conversation</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl p-4 cursor-pointer hover:shadow-lg hover:border-[#FF6E40]/30 transition-all duration-300 transform hover:-translate-y-1"
                      onClick={() => setSelectedMessage(message)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59]/5 to-[#FF6E40]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-start space-x-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10 ring-2 ring-white shadow-lg">
                            <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-[#FF6E40] to-[#FF8C69] text-white">
                              {message.senderName?.charAt(0) || 'U'}
                            </AvatarFallback>
                      </Avatar>
                          {!message.isRead && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                      <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-sm truncate" style={{ color: '#1E3D59' }}>
                              {message.senderName}
                            </h4>
                            {message.isStarred && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 truncate mb-2">{message.subject}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {!message.isRead && (
                              <div className="w-2 h-2 bg-[#FF6E40] rounded-full"></div>
                            )}
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
          <Card className="relative overflow-hidden h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59]/3 to-[#FF6E40]/3 opacity-30"></div>
            <CardContent className="relative p-6 h-full">
              {!selectedMessage ? (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <div className="p-8 rounded-full bg-gray-100/80 backdrop-blur-sm w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                    <MessageSquare className="h-16 w-16 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a conversation</h3>
                  <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
                </div>
              ) : (
                <div className="space-y-6 h-full flex flex-col">
                  <div className="flex items-center space-x-4 pb-6 border-b border-gray-200/50">
                    <Avatar className="w-12 h-12 ring-2 ring-white shadow-lg">
                      <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-[#FF6E40] to-[#FF8C69] text-white">
                        {selectedMessage.senderName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold" style={{ color: '#1E3D59' }}>{selectedMessage.senderName}</h3>
                      <p className="text-sm text-gray-600">{selectedMessage.subject}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedMessage.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedMessage.isStarred && (
                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      )}
                      {!selectedMessage.isRead && (
                        <div className="w-3 h-3 bg-[#FF6E40] rounded-full"></div>
            )}
          </div>
                  </div>
                  
                  <div className="flex-1 space-y-6">
                    <div className="bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 p-6 rounded-2xl shadow-lg">
                      <p className="whitespace-pre-wrap leading-relaxed text-gray-700">{selectedMessage.content}</p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                      <div className="flex items-center space-x-3">
                        <Button 
                          size="sm" 
                          className="px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          style={{ backgroundColor: '#FF6E40' }}
                        >
                          <Reply className="h-4 w-4 mr-2" />
                          <span className="font-semibold">Reply</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="px-4 py-2 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300"
                        >
                          <Star className="h-4 w-4 mr-2" />
                          <span className="font-semibold">Star</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="px-4 py-2 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300"
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          <span className="font-semibold">Archive</span>
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
                    {adminUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id} className="rounded-lg">
                        {user.name}
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