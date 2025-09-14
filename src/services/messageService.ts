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
  writeBatch,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { 
  Message, 
  Conversation, 
  MessageType,
  ConversationType
} from '@/types/notifications'

export class MessageService {
  private static instance: MessageService
  private unsubscribeCallbacks: Map<string, () => void> = new Map()

  static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService()
    }
    return MessageService.instance
  }

  // Message Methods
  async sendMessage(message: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const messageData = {
        ...message,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const docRef = await addDoc(collection(db, 'messages'), messageData)
      
      // Update conversation's last message
      await this.updateConversationLastMessage(message.conversationId, docRef.id, message.content)
      
      return docRef.id
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  async getConversationMessages(conversationId: string, limitCount: number = 100): Promise<Message[]> {
    try {
      const messagesRef = collection(db, 'messages')
      const q = query(
        messagesRef,
        where('conversationId', '==', conversationId),
        orderBy('createdAt', 'asc'),
        limit(limitCount)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message))
    } catch (error) {
      console.error('Error fetching conversation messages:', error)
      return []
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

  async markConversationMessagesRead(conversationId: string, userId: string): Promise<void> {
    try {
      const messagesRef = collection(db, 'messages')
      const q = query(
        messagesRef,
        where('conversationId', '==', conversationId),
        where('recipientId', '==', userId),
        where('read', '==', false)
      )

      const snapshot = await getDocs(q)
      const batch = writeBatch(db)

      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          read: true,
          readAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      })

      await batch.commit()

      // Update conversation unread count
      await this.updateConversationUnreadCount(conversationId, userId, 0)
    } catch (error) {
      console.error('Error marking conversation messages as read:', error)
      throw error
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'messages', messageId))
    } catch (error) {
      console.error('Error deleting message:', error)
      throw error
    }
  }

  // Conversation Methods
  async createConversation(conversation: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const conversationData = {
        ...conversation,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        unreadCount: conversation.participants.reduce((acc, participantId) => {
          acc[participantId] = 0
          return acc
        }, {} as Record<string, number>),
        isArchived: conversation.participants.reduce((acc, participantId) => {
          acc[participantId] = false
          return acc
        }, {} as Record<string, boolean>)
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
      return []
    }
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const conversationRef = doc(db, 'conversations', conversationId)
      const snapshot = await getDoc(conversationRef)
      
      if (snapshot.exists()) {
        return {
          id: snapshot.id,
          ...snapshot.data()
        } as Conversation
      }
      return null
    } catch (error) {
      console.error('Error fetching conversation:', error)
      return null
    }
  }

  async updateConversation(conversationId: string, updates: Partial<Conversation>): Promise<void> {
    try {
      const conversationRef = doc(db, 'conversations', conversationId)
      await updateDoc(conversationRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error updating conversation:', error)
      throw error
    }
  }

  async archiveConversation(conversationId: string, userId: string): Promise<void> {
    try {
      const conversation = await this.getConversation(conversationId)
      if (conversation) {
        const updatedIsArchived = {
          ...conversation.isArchived,
          [userId]: true
        }
        await this.updateConversation(conversationId, { isArchived: updatedIsArchived })
      }
    } catch (error) {
      console.error('Error archiving conversation:', error)
      throw error
    }
  }

  async unarchiveConversation(conversationId: string, userId: string): Promise<void> {
    try {
      const conversation = await this.getConversation(conversationId)
      if (conversation) {
        const updatedIsArchived = {
          ...conversation.isArchived,
          [userId]: false
        }
        await this.updateConversation(conversationId, { isArchived: updatedIsArchived })
      }
    } catch (error) {
      console.error('Error unarchiving conversation:', error)
      throw error
    }
  }

  // Real-time subscriptions
  subscribeToConversationMessages(
    conversationId: string,
    callback: (messages: Message[]) => void,
    errorCallback?: (error: Error) => void
  ): () => void {
    const messagesRef = collection(db, 'messages')
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    )

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Message))
        callback(messages)
      },
      (error) => {
        console.error('Real-time message subscription error:', error)
        if (errorCallback) {
          errorCallback(error)
        }
      }
    )

    this.unsubscribeCallbacks.set(`messages-${conversationId}`, unsubscribe)
    return unsubscribe
  }

  subscribeToConversations(
    userId: string,
    callback: (conversations: Conversation[]) => void,
    errorCallback?: (error: Error) => void
  ): () => void {
    const conversationsRef = collection(db, 'conversations')
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const conversations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Conversation))
        callback(conversations)
      },
      (error) => {
        console.error('Real-time conversation subscription error:', error)
        if (errorCallback) {
          errorCallback(error)
        }
      }
    )

    this.unsubscribeCallbacks.set(`conversations-${userId}`, unsubscribe)
    return unsubscribe
  }

  // Helper methods
  private async updateConversationLastMessage(conversationId: string, messageId: string, content: string): Promise<void> {
    try {
      const conversationRef = doc(db, 'conversations', conversationId)
      await updateDoc(conversationRef, {
        lastMessageAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error updating conversation last message:', error)
    }
  }

  private async updateConversationUnreadCount(conversationId: string, userId: string, count: number): Promise<void> {
    try {
      const conversation = await this.getConversation(conversationId)
      if (conversation) {
        const updatedUnreadCount = {
          ...conversation.unreadCount,
          [userId]: count
        }
        await this.updateConversation(conversationId, { unreadCount: updatedUnreadCount })
      }
    } catch (error) {
      console.error('Error updating conversation unread count:', error)
    }
  }

  // Create conversation with another user
  async createDirectConversation(userId1: string, userId2: string, user1Name: string, user2Name: string): Promise<string> {
    try {
      // Check if conversation already exists
      const existingConversations = await this.getConversations(userId1)
      const existingConversation = existingConversations.find(conv => 
        conv.participants.includes(userId2) && 
        conv.participants.length === 2 &&
        conv.type === 'direct'
      )

      if (existingConversation) {
        return existingConversation.id
      }

      // Create new conversation
      const conversation = {
        participants: [userId1, userId2],
        participantNames: {
          [userId1]: user1Name,
          [userId2]: user2Name
        },
        participantAvatars: {},
        type: 'direct' as ConversationType,
        isGroup: false,
        title: `${user1Name} & ${user2Name}`,
        unreadCount: {
          [userId1]: 0,
          [userId2]: 0
        },
        isArchived: {
          [userId1]: false,
          [userId2]: false
        }
      }

      return await this.createConversation(conversation)
    } catch (error) {
      console.error('Error creating direct conversation:', error)
      throw error
    }
  }

  // Cleanup method
  cleanup(): void {
    this.unsubscribeCallbacks.forEach(unsubscribe => unsubscribe())
    this.unsubscribeCallbacks.clear()
  }
}

export const messageService = MessageService.getInstance()
