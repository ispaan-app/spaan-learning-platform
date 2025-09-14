'use server'

import { supportChatFlow } from '@/ai/flows/support-chat'

interface Message {
  id: string
  role: 'user' | 'model'
  content: string
  timestamp: Date
}

export async function supportChat(messages: Message[]): Promise<string> {
  try {
    // Convert messages to the format expected by the AI flow
    const conversationHistory = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      content: msg.content
    }))

    // Get the latest user message
    const lastUserMessage = messages.filter(msg => msg.role === 'user').pop()
    if (!lastUserMessage) {
      throw new Error('No user message found')
    }

    // Call the AI flow with conversation history
    const response = await supportChatFlow({
      message: lastUserMessage.content,
      conversationHistory: conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'model',
        content: msg.content
      }))
    })

    return response
  } catch (error) {
    console.error('Error in support chat:', error)
    return 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.'
  }
}



