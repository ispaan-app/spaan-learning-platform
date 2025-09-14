import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { 
  Notification, 
  Message, 
  Conversation, 
  NotificationSettings,
  InboxStats,
  NotificationType,
  NotificationPriority,
  NotificationCategory
} from '@/types/notifications'

export class NotificationService {
  private static instance: NotificationService
  private unsubscribeCallbacks: Map<string, () => void> = new Map()

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  // Notification Methods
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const notificationData = {
        ...notification,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const docRef = await addDoc(collection(db, 'notifications'), notificationData)
      return docRef.id
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  async getNotifications(userId: string, limitCount: number = 50): Promise<Notification[]> {
    try {
      const notificationsRef = collection(db, 'notifications')
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification))
    } catch (error) {
      console.error('Error fetching notifications:', error)
      // Return empty array instead of throwing to prevent UI crashes
      return []
    }
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    try {
      const notificationsRef = collection(db, 'notifications')
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification))
    } catch (error) {
      console.error('Error fetching unread notifications:', error)
      throw error
    }
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId)
      await updateDoc(notificationRef, {
        read: true,
        updatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    try {
      const notificationsRef = collection(db, 'notifications')
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false)
      )

      const snapshot = await getDocs(q)
      const batch = writeBatch(db)

      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          read: true,
          updatedAt: new Date().toISOString()
        })
      })

      await batch.commit()
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId))
    } catch (error) {
      console.error('Error deleting notification:', error)
      throw error
    }
  }

  async deleteAllNotifications(userId: string): Promise<void> {
    try {
      const notificationsRef = collection(db, 'notifications')
      const q = query(
        notificationsRef,
        where('userId', '==', userId)
      )

      const snapshot = await getDocs(q)
      const batch = writeBatch(db)

      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
      })

      await batch.commit()
    } catch (error) {
      console.error('Error deleting all notifications:', error)
      throw error
    }
  }

  // Real-time notification subscription
  subscribeToNotifications(
    userId: string, 
    callback: (notifications: Notification[]) => void,
    errorCallback?: (error: Error) => void
  ): () => void {
    const notificationsRef = collection(db, 'notifications')
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Notification))
        callback(notifications)
      },
      (error) => {
        console.error('Real-time notification subscription error:', error)
        if (errorCallback) {
          errorCallback(error)
        }
      }
    )

    this.unsubscribeCallbacks.set(userId, unsubscribe)
    return unsubscribe
  }

  // Message Methods
  async createMessage(message: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const messageData = {
        ...message,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const docRef = await addDoc(collection(db, 'messages'), messageData)
      return docRef.id
    } catch (error) {
      console.error('Error creating message:', error)
      throw error
    }
  }

  async getConversationMessages(conversationId: string, limitCount: number = 100): Promise<Message[]> {
    try {
      const messagesRef = collection(db, 'messages')
      const q = query(
        messagesRef,
        where('conversationId', '==', conversationId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message)).reverse()
    } catch (error) {
      console.error('Error fetching conversation messages:', error)
      throw error
    }
  }

  async markMessageRead(messageId: string): Promise<void> {
    try {
      const messageRef = doc(db, 'messages', messageId)
      await updateDoc(messageRef, {
        read: true,
        readAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error marking message as read:', error)
      throw error
    }
  }

  // Conversation Methods
  async createConversation(conversation: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const conversationData = {
        ...conversation,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const docRef = await addDoc(collection(db, 'conversations'), conversationData)
      return docRef.id
    } catch (error) {
      console.error('Error creating conversation:', error)
      throw error
    }
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const conversationsRef = collection(db, 'conversations')
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Conversation))
    } catch (error) {
      console.error('Error fetching conversations:', error)
      // Return empty array instead of throwing to prevent UI crashes
      return []
    }
  }

  // Bulk notification methods
  async notifyAdmins(
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>,
    priority: NotificationPriority = 'medium'
  ): Promise<void> {
    try {
      const usersRef = collection(db, 'users')
      const adminQuery = query(
        usersRef,
        where('role', 'in', ['admin', 'super-admin'])
      )
      const adminSnapshot = await getDocs(adminQuery)

      const batch = writeBatch(db)
      const notificationsRef = collection(db, 'notifications')

      adminSnapshot.docs.forEach(adminDoc => {
        const notificationRef = doc(notificationsRef)
        batch.set(notificationRef, {
          userId: adminDoc.id,
          type,
          title,
          message,
          data,
          read: false,
          priority,
          category: this.getCategoryFromType(type),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      })

      await batch.commit()
    } catch (error) {
      console.error('Error notifying admins:', error)
      throw error
    }
  }

  async notifyUser(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>,
    priority: NotificationPriority = 'medium'
  ): Promise<void> {
    try {
      await this.createNotification({
        userId,
        type,
        title,
        message,
        data,
        read: false,
        priority,
        category: this.getCategoryFromType(type)
      })
    } catch (error) {
      console.error('Error notifying user:', error)
      throw error
    }
  }

  // Inbox Stats
  async getInboxStats(userId: string): Promise<InboxStats> {
    try {
      const [notificationsSnapshot, conversationsSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'notifications'), where('userId', '==', userId))),
        getDocs(query(collection(db, 'conversations'), where('participants', 'array-contains', userId)))
      ])

      const totalNotifications = notificationsSnapshot.size
      const unreadNotifications = notificationsSnapshot.docs.filter(doc => !doc.data().read).length
      const totalMessages = conversationsSnapshot.size
      
      let unreadMessages = 0
      let unreadConversations = 0
      let recentActivity = 0

      conversationsSnapshot.docs.forEach(doc => {
        const conversation = doc.data()
        const userUnreadCount = conversation.unreadCount?.[userId] || 0
        unreadMessages += userUnreadCount
        if (userUnreadCount > 0) unreadConversations++
        
        // Check for recent activity (last 24 hours)
        const lastMessageAt = conversation.lastMessageAt
        if (lastMessageAt) {
          const messageTime = new Date(lastMessageAt)
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
          if (messageTime > dayAgo) recentActivity++
        }
      })

      return {
        totalNotifications,
        unreadNotifications,
        totalMessages,
        unreadMessages,
        unreadConversations,
        recentActivity
      }
    } catch (error) {
      console.error('Error getting inbox stats:', error)
      // Return default stats instead of throwing to prevent UI crashes
      return {
        totalNotifications: 0,
        unreadNotifications: 0,
        totalMessages: 0,
        unreadMessages: 0,
        unreadConversations: 0,
        recentActivity: 0
      }
    }
  }

  // Helper methods
  private getCategoryFromType(type: NotificationType): NotificationCategory {
    const categoryMap: Record<NotificationType, NotificationCategory> = {
      'application_received': 'applications',
      'application_approved': 'applications',
      'application_rejected': 'applications',
      'placement_assigned': 'placements',
      'placement_updated': 'placements',
      'session_scheduled': 'sessions',
      'session_reminder': 'sessions',
      'hours_logged': 'sessions',
      'issue_reported': 'system',
      'issue_resolved': 'system',
      'announcement': 'announcements',
      'message_received': 'messages',
      'system_maintenance': 'system',
      'profile_updated': 'system',
      'password_changed': 'security',
      'security_alert': 'security',
      'welcome': 'system',
      'reminder': 'reminders',
      'achievement': 'achievements',
      'deadline_approaching': 'reminders'
    }

    return categoryMap[type] || 'system'
  }

  // Cleanup method
  cleanup(): void {
    this.unsubscribeCallbacks.forEach(unsubscribe => unsubscribe())
    this.unsubscribeCallbacks.clear()
  }
}

export const notificationService = NotificationService.getInstance()



