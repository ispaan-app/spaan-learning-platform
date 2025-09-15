'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  MoreHorizontal,
  Search,
  Filter,
  Plus,
  MessageSquare,
  Users,
  Archive,
  Pin,
  Star,
  Trash2,
  Edit,
  Reply,
  Forward,
  Download,
  Eye,
  EyeOff,
  Clock,
  Check,
  CheckCheck
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
  Message, 
  Conversation, 
  MessageType,
  ConversationType
} from '@/types/notifications'
import { notificationService } from '@/services/notificationService'
import { useAuth } from '@/hooks/useAuth'
import { toast as sonnerToast } from 'sonner'
import { cn } from '@/lib/utils'

interface MessagingSystemProps {
  className?: string
}

export function MessagingSystem({ className }: MessagingSystemProps) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!user) return

    loadConversations()

    // Auto-scroll to bottom when new messages arrive
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id)
    }
  }, [activeConversation])

  const loadConversations = async () => {
    if (!user) return

    try {
      setLoading(true)
      const conversationsData = await notificationService.getConversations(user.uid)
      setConversations(conversationsData)
      
      // Set first conversation as active if none selected
      if (conversationsData.length > 0 && !activeConversation) {
        setActiveConversation(conversationsData[0])
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
      sonnerToast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const messagesData = await notificationService.getConversationMessages(conversationId)
      setMessages(messagesData)
    } catch (error) {
      console.error('Error loading messages:', error)
      sonnerToast.error('Failed to load messages')
    }
  }

  const handleSendMessage = async () => {
    if (!user || !activeConversation || !newMessage.trim() || sending) return

    try {
      setSending(true)
      
      const messageData: Omit<Message, 'id' | 'createdAt' | 'updatedAt'> = {
        conversationId: activeConversation.id,
        senderId: user.uid,
        senderName: user.displayName || user.email || 'Unknown',
        senderAvatar: user.photoURL || undefined,
        recipientId: activeConversation.participants.find(p => p !== user.uid) || '',
        recipientName: activeConversation.participantNames[activeConversation.participants.find(p => p !== user.uid) || ''] || 'Unknown',
        recipientAvatar: activeConversation.participantAvatars[activeConversation.participants.find(p => p !== user.uid) || ''],
        content: newMessage.trim(),
        type: 'text',
        read: false
      }

      await notificationService.createMessage(messageData)
      setNewMessage('')
      
      // Refresh messages
      await loadMessages(activeConversation.id)
      
      sonnerToast.success('Message sent')
    } catch (error) {
      console.error('Error sending message:', error)
      sonnerToast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    
    return date.toLocaleDateString()
  }

  const getOtherParticipant = (conversation: Conversation) => {
    if (!user) return null
    const otherId = conversation.participants.find(p => p !== user.uid)
    return otherId ? {
      id: otherId,
      name: conversation.participantNames[otherId] || 'Unknown',
      avatar: conversation.participantAvatars[otherId]
    } : null
  }

  const filteredConversations = conversations.filter(conversation => {
    const otherParticipant = getOtherParticipant(conversation)
    return otherParticipant?.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className={cn("flex h-full", className)}>
      {/* Conversations Sidebar */}
      <div className="w-80 border-r bg-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Archive className="w-4 h-4 mr-2" />
                    Archive All
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation)
                const unreadCount = conversation.unreadCount[user?.uid || ''] || 0
                
                return (
                  <div
                    key={conversation.id}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50",
                      activeConversation?.id === conversation.id && "bg-blue-50 border-l-4 border-l-blue-500"
                    )}
                    onClick={() => setActiveConversation(conversation)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={otherParticipant?.avatar} />
                        <AvatarFallback>
                          {otherParticipant?.name.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium truncate">
                            {otherParticipant?.name || 'Unknown'}
                          </h3>
                          {unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </p>
                        {conversation.lastMessageAt && (
                          <p className="text-xs text-gray-400">
                            {formatTime(conversation.lastMessageAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={getOtherParticipant(activeConversation)?.avatar} />
                    <AvatarFallback>
                      {getOtherParticipant(activeConversation)?.name.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">
                      {getOtherParticipant(activeConversation)?.name || 'Unknown'}
                    </h3>
                    <p className="text-xs text-gray-500">Online</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Video className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Pin className="w-4 h-4 mr-2" />
                        Pin Conversation
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Star className="w-4 h-4 mr-2" />
                        Add to Favorites
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwn = message.senderId === user?.uid
                  
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        isOwn ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                          isOwn
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className={cn(
                          "flex items-center justify-end space-x-1 mt-1 text-xs",
                          isOwn ? "text-blue-100" : "text-gray-500"
                        )}>
                          <span>{formatTime(message.createdAt)}</span>
                          {isOwn && (
                            <div>
                              {message.read ? (
                                <CheckCheck className="w-3 h-3" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <Textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="min-h-[40px] max-h-32 resize-none"
                    rows={1}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}








