'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  User, 
  Users, 
  X,
  UserPlus,
  MessageSquare
} from 'lucide-react'
import { messageService } from '@/services/messageService'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
}

interface NewConversationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConversationCreated: (conversationId: string) => void
}

export function NewConversationModal({
  open,
  onOpenChange,
  onConversationCreated
}: NewConversationModalProps) {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [conversationTitle, setConversationTitle] = useState('')
  const [conversationType, setConversationType] = useState<'direct' | 'group'>('direct')
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)

  // Mock users for demonstration - in real app, fetch from API
  const mockUsers: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'learner' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'admin' },
    { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'learner' },
    { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', role: 'super-admin' },
  ]

  useEffect(() => {
    if (searchTerm) {
      setSearching(true)
      // Simulate search delay
      const timer = setTimeout(() => {
        const filtered = mockUsers.filter(u => 
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setUsers(filtered)
        setSearching(false)
      }, 300)
      
      return () => clearTimeout(timer)
    } else {
      setUsers([])
    }
  }, [searchTerm])

  const handleUserSelect = (selectedUser: User) => {
    if (conversationType === 'direct') {
      setSelectedUsers([selectedUser])
    } else {
      if (selectedUsers.find(u => u.id === selectedUser.id)) {
        setSelectedUsers(prev => prev.filter(u => u.id !== selectedUser.id))
      } else {
        setSelectedUsers(prev => [...prev, selectedUser])
      }
    }
  }

  const handleCreateConversation = async () => {
    if (!user || selectedUsers.length === 0) return

    setLoading(true)
    try {
      let conversationId: string

      if (conversationType === 'direct') {
        const otherUser = selectedUsers[0]
        conversationId = await messageService.createDirectConversation(
          user.uid,
          otherUser.id,
          user.displayName || 'You',
          otherUser.name
        )
      } else {
        const participants = [user.uid, ...selectedUsers.map(u => u.id)]
        const participantNames = {
          [user.uid]: user.displayName || 'You',
          ...selectedUsers.reduce((acc, u) => {
            acc[u.id] = u.name
            return acc
          }, {} as Record<string, string>)
        }

        const conversation = {
          participants,
          participantNames,
          participantAvatars: {},
          type: 'group' as const,
          isGroup: true,
          title: conversationTitle || `${selectedUsers.length + 1} people`,
          unreadCount: participants.reduce((acc, participantId) => {
            acc[participantId] = 0
            return acc
          }, {} as Record<string, number>),
          isArchived: participants.reduce((acc, participantId) => {
            acc[participantId] = false
            return acc
          }, {} as Record<string, boolean>)
        }

        conversationId = await messageService.createConversation(conversation)
      }

      onConversationCreated(conversationId)
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error('Error creating conversation:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSearchTerm('')
    setUsers([])
    setSelectedUsers([])
    setConversationTitle('')
    setConversationType('direct')
  }

  const handleClose = () => {
    onOpenChange(false)
    resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>New Conversation</span>
          </DialogTitle>
          <DialogDescription>
            Start a new conversation with one or more people
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Conversation Type */}
          <div className="space-y-2">
            <Label>Conversation Type</Label>
            <div className="flex space-x-2">
              <Button
                variant={conversationType === 'direct' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setConversationType('direct')}
                className="flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Direct Message</span>
              </Button>
              <Button
                variant={conversationType === 'group' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setConversationType('group')}
                className="flex items-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>Group Chat</span>
              </Button>
            </div>
          </div>

          {/* Group Title */}
          {conversationType === 'group' && (
            <div className="space-y-2">
              <Label htmlFor="title">Group Name (Optional)</Label>
              <Input
                id="title"
                value={conversationTitle}
                onChange={(e) => setConversationTitle(e.target.value)}
                placeholder="Enter group name..."
              />
            </div>
          )}

          {/* User Search */}
          <div className="space-y-2">
            <Label>Search People</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              <Label>Selected ({selectedUsers.length})</Label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((selectedUser) => (
                  <Badge key={selectedUser.id} variant="secondary" className="flex items-center space-x-1">
                    <span>{selectedUser.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleUserSelect(selectedUser)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchTerm && (
            <div className="space-y-2">
              <Label>Search Results</Label>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {searching ? (
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    No users found
                  </div>
                ) : (
                  users.map((user) => (
                    <div
                      key={user.id}
                      className={cn(
                        "flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors",
                        selectedUsers.find(u => u.id === user.id) 
                          ? "bg-blue-100 border border-blue-200" 
                          : "hover:bg-gray-50"
                      )}
                      onClick={() => handleUserSelect(user)}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateConversation}
              disabled={selectedUsers.length === 0 || loading}
              className="flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>
                {loading ? 'Creating...' : 'Create Conversation'}
              </span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
