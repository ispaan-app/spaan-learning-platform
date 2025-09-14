'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  MessageSquare, 
  MoreHorizontal, 
  Archive, 
  ArchiveRestore,
  Users,
  UserPlus,
  Settings
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Conversation, Message } from '@/types/notifications'
import { messageService } from '@/services/messageService'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface ConversationListProps {
  conversations: Conversation[]
  selectedConversationId?: string
  onSelectConversation: (conversation: Conversation) => void
  onNewConversation: () => void
  loading?: boolean
  className?: string
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
  loading = false,
  className
}: ConversationListProps) {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])

  useEffect(() => {
    if (!searchTerm) {
      setFilteredConversations(conversations)
    } else {
      const filtered = conversations.filter(conv => 
        conv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        Object.values(conv.participantNames).some(name => 
          name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      setFilteredConversations(filtered)
    }
  }, [conversations, searchTerm])

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

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.title) return conversation.title
    
    if (conversation.type === 'direct') {
      const otherParticipant = conversation.participants.find(p => p !== user?.uid)
      return conversation.participantNames[otherParticipant || ''] || 'Unknown User'
    }
    
    return 'Group Chat'
  }

  const getUnreadCount = (conversation: Conversation) => {
    if (!user) return 0
    return conversation.unreadCount?.[user.uid] || 0
  }

  const handleArchiveConversation = async (conversationId: string) => {
    if (!user) return
    
    try {
      await messageService.archiveConversation(conversationId, user.uid)
    } catch (error) {
      console.error('Error archiving conversation:', error)
    }
  }

  const handleUnarchiveConversation = async (conversationId: string) => {
    if (!user) return
    
    try {
      await messageService.unarchiveConversation(conversationId, user.uid)
    } catch (error) {
      console.error('Error unarchiving conversation:', error)
    }
  }

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 flex-1 bg-gray-200 rounded animate-pulse"></div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Conversations</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onNewConversation}
            className="flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>New</span>
          </Button>
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

      {/* Conversations List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No conversations found' : 'No conversations yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Start a conversation with someone'
                }
              </p>
              {!searchTerm && (
                <Button onClick={onNewConversation} className="flex items-center space-x-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Start Conversation</span>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredConversations.map((conversation) => {
            const isSelected = conversation.id === selectedConversationId
            const unreadCount = getUnreadCount(conversation)
            const isArchived = conversation.isArchived?.[user?.uid || ''] || false

            if (isArchived) return null

            return (
              <Card
                key={conversation.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md",
                  isSelected && "ring-2 ring-blue-500 bg-blue-50/50"
                )}
                onClick={() => onSelectConversation(conversation)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {conversation.type === 'direct' 
                            ? getConversationTitle(conversation).charAt(0).toUpperCase()
                            : <Users className="w-5 h-5" />
                          }
                        </AvatarFallback>
                      </Avatar>
                      {unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm truncate">
                          {getConversationTitle(conversation)}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {conversation.lastMessageAt && (
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(conversation.lastMessageAt)}
                            </span>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleArchiveConversation(conversation.id)}>
                                <Archive className="w-4 h-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
