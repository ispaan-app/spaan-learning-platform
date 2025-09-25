import { db } from '@/lib/firebase'
import { collection, addDoc, query, where, orderBy, getDocs, updateDoc, doc, onSnapshot, limit } from 'firebase/firestore'
import { sendEmail } from '@/lib/email-service'
import { sendSMS } from '@/lib/sms-service'

export interface Notification {
  id?: string
  userId: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  category: 'system' | 'placement' | 'application' | 'document' | 'attendance'
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  actionUrl?: string
  actionText?: string
  createdAt: Date
  expiresAt?: Date
}

export interface EmailNotification {
  to: string
  subject: string
  body: string
  template?: string
  data?: Record<string, any>
}

export interface SMSNotification {
  to: string
  message: string
}

class NotificationService {
  private static instance: NotificationService

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  // Create a new notification
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: new Date()
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  // Get notifications for a user
  async getUserNotifications(userId: string, limitCount: number = 50): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Notification[]
    } catch (error) {
      console.error('Error fetching notifications:', error)
      throw error
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const notifications = await this.getUserNotifications(userId)
      const unreadNotifications = notifications.filter(n => !n.read)
      
      for (const notification of unreadNotifications) {
        if (notification.id) {
          await this.markAsRead(notification.id)
        }
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  }

  // Send email notification
  async sendEmailNotification(emailNotification: EmailNotification): Promise<void> {
    try {
      await sendEmail({
        to: emailNotification.to,
        subject: emailNotification.subject,
        body: emailNotification.body,
        template: emailNotification.template,
        data: emailNotification.data
      })
    } catch (error) {
      console.error('Error sending email notification:', error)
      throw error
    }
  }

  // Send SMS notification
  async sendSMSNotification(smsNotification: SMSNotification): Promise<void> {
    try {
      await sendSMS({
        to: smsNotification.to,
        message: smsNotification.message
      })
    } catch (error) {
      console.error('Error sending SMS notification:', error)
      throw error
    }
  }

  // Send multi-channel notification
  async sendMultiChannelNotification(
    userId: string,
    title: string,
    message: string,
    options: {
      email?: string
      phone?: string
      type?: Notification['type']
      category?: Notification['category']
      priority?: Notification['priority']
      actionUrl?: string
      actionText?: string
    } = {}
  ): Promise<void> {
    try {
      // Create in-app notification
      await this.createNotification({
        userId,
        title,
        message,
        type: options.type || 'info',
        category: options.category || 'system',
        priority: options.priority || 'medium',
        read: false,
        actionUrl: options.actionUrl,
        actionText: options.actionText
      })

      // Send email if provided
      if (options.email) {
        await this.sendEmailNotification({
          to: options.email,
          subject: title,
          body: message
        })
      }

      // Send SMS if provided
      if (options.phone) {
        await this.sendSMSNotification({
          to: options.phone,
          message: `${title}: ${message}`
        })
      }
    } catch (error) {
      console.error('Error sending multi-channel notification:', error)
      throw error
    }
  }

  // Get notification statistics
  async getNotificationStats(userId: string): Promise<{
    total: number
    unread: number
    byType: Record<string, number>
    byCategory: Record<string, number>
  }> {
    try {
      const notifications = await this.getUserNotifications(userId)
      
      const stats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.read).length,
        byType: {} as Record<string, number>,
        byCategory: {} as Record<string, number>
      }

      notifications.forEach(notification => {
        stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1
        stats.byCategory[notification.category] = (stats.byCategory[notification.category] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error('Error getting notification stats:', error)
      throw error
    }
  }

  // Subscribe to real-time notifications
  subscribeToNotifications(
    userId: string,
    callback: (notifications: Notification[]) => void
  ): () => void {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Notification[]
      
      callback(notifications)
    })
  }
}

export const notificationService = NotificationService.getInstance()
