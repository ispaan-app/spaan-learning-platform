'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  MessageSquare, 
  Users, 
  Search,
  Settings,
  Archive,
  MoreHorizontal
} from 'lucide-react'
import { Conversation, Message } from '@/types/notifications'
import { messageService } from '@/services/messageService'
import { useAuth } from '@/hooks/useAuth'
import { ConversationList } from './ConversationList'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { NewConversationModal } from './NewConversationModal'
import { cn } from '@/lib/utils'

export function MessagingInterface() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [showNewConversation, setShowNewConversation] = useState(false)

  const loadConversations = useCallback(async () => {
    if (!user) return

    try {
      const conversationsData = await messageService.getConversations(user.uid)
      setConversations(conversationsData)
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }, [user])

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const messagesData = await messageService.getConversationMessages(conversationId)
      setMessages(messagesData)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }, [])

  useEffect(() => {
    if (!user) return

    // Load conversations
    loadConversations()

    // Subscribe to real-time conversation updates
    const unsubscribeConversations = messageService.subscribeToConversations(
      user.uid,
      (conversations) => {
        setConversations(conversations)
        setLoading(false)
      },
      (error) => {
        console.error('Error subscribing to conversations:', error)
        setLoading(false)
      }
    )

    return () => {
      unsubscribeConversations()
    }
  }, [user, loadConversations])

  useEffect(() => {
    if (!selectedConversation) return

    setMessagesLoading(true)
    
    // Load messages for selected conversation
    loadMessages(selectedConversation.id)

    // Subscribe to real-time message updates
    const unsubscribeMessages = messageService.subscribeToConversationMessages(
      selectedConversation.id,
      (messages) => {
        setMessages(messages)
        setMessagesLoading(false)
      },
      (error) => {
        console.error('Error subscribing to messages:', error)
        setMessagesLoading(false)
      }
    )

    return () => {
      unsubscribeMessages()
    }
  }, [selectedConversation, loadMessages])

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    
    // Mark messages as read
    if (user) {
      messageService.markConversationMessagesRead(conversation.id, user.uid)
    }
  }

  const handleSendMessage = async (content: string, type: 'text' | 'image' | 'file' = 'text') => {
    if (!user || !selectedConversation) return

    try {
      const message: Omit<Message, 'id' | 'createdAt' | 'updatedAt'> = {
        conversationId: selectedConversation.id,
        senderId: user.uid,
        senderName: user.displayName || 'You',
        senderAvatar: user.photoURL || undefined,
        recipientId: selectedConversation.participants.find(p => p !== user.uid) || '',
        recipientName: selectedConversation.participantNames[selectedConversation.participants.find(p => p !== user.uid) || ''] || 'Unknown',
        content,
        type,
        read: false
      }

      await messageService.sendMessage(message)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleConversationCreated = (conversationId: string) => {
    // Find the new conversation and select it
    const newConversation = conversations.find(c => c.id === conversationId)
    if (newConversation) {
      setSelectedConversation(newConversation)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
      {/* Conversations Sidebar */}
      <div className="lg:col-span-1">
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversation?.id}
          onSelectConversation={handleSelectConversation}
          onNewConversation={() => setShowNewConversation(true)}
          loading={loading}
        />
      </div>

      {/* Messages Area */}
      <div className="lg:col-span-2">
        {selectedConversation ? (
          <Card className="h-full flex flex-col">
            {/* Message Header */}
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    {selectedConversation.type === 'direct' ? (
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Users className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {selectedConversation.title || 'Conversation'}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.participants.length} participant{selectedConversation.participants.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Search className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages List */}
            <CardContent className="flex-1 p-0 overflow-hidden">
              <MessageList
                messages={messages}
                conversationId={selectedConversation.id}
                loading={messagesLoading}
                className="h-full"
              />
            </CardContent>

            {/* Message Input */}
            <MessageInput
              onSendMessage={handleSendMessage}
              placeholder={`Message ${selectedConversation.title || 'conversation'}...`}
            />
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent className="text-center p-8">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500 mb-6">
                Choose a conversation from the sidebar to start messaging
              </p>
              <Button onClick={() => setShowNewConversation(true)}>
                Start New Conversation
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* New Conversation Modal */}
      <NewConversationModal
        open={showNewConversation}
        onOpenChange={setShowNewConversation}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  )
}
