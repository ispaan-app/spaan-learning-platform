export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  priority: NotificationPriority
  category: NotificationCategory
  createdAt: string
  updatedAt: string
  expiresAt?: string
  actionUrl?: string
  actionLabel?: string
  senderId?: string
  senderName?: string
  relatedEntityId?: string
  relatedEntityType?: string
}

export type NotificationType = 
  | 'application_received'
  | 'application_approved'
  | 'application_rejected'
  | 'placement_assigned'
  | 'placement_updated'
  | 'session_scheduled'
  | 'session_reminder'
  | 'hours_logged'
  | 'issue_reported'
  | 'issue_resolved'
  | 'announcement'
  | 'message_received'
  | 'system_maintenance'
  | 'profile_updated'
  | 'password_changed'
  | 'security_alert'
  | 'welcome'
  | 'reminder'
  | 'achievement'
  | 'deadline_approaching'

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'

export type NotificationCategory = 
  | 'applications'
  | 'placements'
  | 'sessions'
  | 'announcements'
  | 'messages'
  | 'system'
  | 'security'
  | 'achievements'
  | 'reminders'

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  recipientId: string
  recipientName: string
  recipientAvatar?: string
  content: string
  type: MessageType
  read: boolean
  readAt?: string
  createdAt: string
  updatedAt: string
  attachments?: MessageAttachment[]
  replyToId?: string
  edited?: boolean
  editedAt?: string
}

export type MessageType = 'text' | 'image' | 'file' | 'system'

export interface MessageAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedAt: string
}

export interface Conversation {
  id: string
  participants: string[]
  participantNames: Record<string, string>
  participantAvatars: Record<string, string>
  lastMessage?: Message
  lastMessageAt?: string
  unreadCount: Record<string, number>
  createdAt: string
  updatedAt: string
  type: ConversationType
  title?: string
  isGroup: boolean
  isArchived: Record<string, boolean>
}

export type ConversationType = 'direct' | 'group' | 'support' | 'announcement'

export interface NotificationSettings {
  userId: string
  email: boolean
  push: boolean
  sms: boolean
  categories: Record<NotificationCategory, boolean>
  types: Record<NotificationType, boolean>
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
  updatedAt: string
}

export interface InboxStats {
  totalNotifications: number
  unreadNotifications: number
  totalMessages: number
  unreadMessages: number
  unreadConversations: number
  recentActivity: number
}





