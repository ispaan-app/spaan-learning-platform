'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MessageSquare, 
  User, 
  Clock, 
  Check, 
  CheckCheck,
  MoreHorizontal,
  Reply,
  Edit,
  Trash2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Message, MessageType } from '@/types/notifications'
import { messageService } from '@/services/messageService'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface MessageListProps {
  messages: Message[]
  conversationId?: string
  loading?: boolean
  className?: string
}

export function MessageList({
  messages,
  conversationId,
  loading = false,
  className
}: MessageListProps) {
  const { user } = useAuth()
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getMessageIcon = (type: MessageType) => {
    switch (type) {
      case 'image':
        return '🖼️'
      case 'file':
        return '📎'
      case 'system':
        return '🔔'
      default:
        return null
    }
  }

  const isOwnMessage = (message: Message) => {
    return message.senderId === user?.uid
  }

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await messageService.markMessageRead(messageId)
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await messageService.deleteMessage(messageId)
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
        <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
        <p className="text-gray-500">
          Start the conversation by sending a message
        </p>
      </div>
    )
  }

  return (
    <div className={cn("flex-1 overflow-y-auto p-4 space-y-4", className)}>
      {messages.map((message, index) => {
        const isOwn = isOwnMessage(message)
        const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId
        const showTime = index === messages.length - 1 || 
          new Date(messages[index + 1].createdAt).getTime() - new Date(message.createdAt).getTime() > 300000 // 5 minutes

        return (
          <div
            key={message.id}
            className={cn(
              "flex items-start space-x-2 group",
              isOwn && "flex-row-reverse space-x-reverse"
            )}
          >
            {/* Avatar */}
            {showAvatar && (
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={message.senderAvatar} />
                <AvatarFallback>
                  {message.senderName?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
            )}
            
            {/* Message Content */}
            <div className={cn(
              "flex-1 min-w-0",
              !showAvatar && (isOwn ? "ml-10" : "ml-10")
            )}>
              {/* Sender Name (only for first message in group) */}
              {showAvatar && !isOwn && (
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {message.senderName}
                  </span>
                  {message.edited && (
                    <span className="text-xs text-gray-500">(edited)</span>
                  )}
                </div>
              )}

              {/* Message Bubble */}
              <div className="flex items-end space-x-2">
                <div
                  className={cn(
                    "max-w-xs lg:max-w-md px-3 py-2 rounded-lg",
                    isOwn 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-100 text-gray-900"
                  )}
                >
                  {/* Message Type Icon */}
                  {getMessageIcon(message.type) && (
                    <div className="mb-1">
                      {getMessageIcon(message.type)}
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                  </div>

                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.attachments.map((attachment) => (
                        <div key={attachment.id} className="text-xs opacity-75">
                          📎 {attachment.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Message Actions */}
                <div className={cn(
                  "opacity-0 group-hover:opacity-100 transition-opacity",
                  isOwn ? "order-first" : "order-last"
                )}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isOwn ? "end" : "start"}>
                      <DropdownMenuLabel>Message Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setSelectedMessage(message.id)}>
                        <Reply className="w-4 h-4 mr-2" />
                        Reply
                      </DropdownMenuItem>
                      {isOwn && (
                        <>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                      {!isOwn && !message.read && (
                        <DropdownMenuItem onClick={() => handleMarkAsRead(message.id)}>
                          <Check className="w-4 h-4 mr-2" />
                          Mark as Read
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Message Status and Time */}
              <div className={cn(
                "flex items-center space-x-1 mt-1 text-xs text-gray-500",
                isOwn && "justify-end"
              )}>
                {isOwn && (
                  <div className="flex items-center space-x-1">
                    {message.read ? (
                      <CheckCheck className="w-3 h-3 text-blue-500" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                  </div>
                )}
                {showTime && (
                  <span>{formatTime(message.createdAt)}</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}
