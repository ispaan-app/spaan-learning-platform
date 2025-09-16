'use server'

// Mock support chat implementation
interface Message {
  id: string
  role: 'user' | 'model'
  content: string
  timestamp: Date
}

export async function supportChat(messages: Message[]): Promise<string> {
  try {
    // Get the latest user message
    const lastUserMessage = messages.filter(msg => msg.role === 'user').pop()
    if (!lastUserMessage) {
      throw new Error('No user message found')
    }

    // Mock response based on common queries
    const userMessage = lastUserMessage.content.toLowerCase()
    
    if (userMessage.includes('help') || userMessage.includes('support')) {
      return 'I\'m here to help! You can ask me about the application process, learner features, or general platform navigation. What would you like to know?'
    } else if (userMessage.includes('application') || userMessage.includes('apply')) {
      return 'To apply, please visit the application page and fill out the required information. Make sure to have your documents ready for upload.'
    } else if (userMessage.includes('check') || userMessage.includes('attendance')) {
      return 'You can check in and out using the check-in page. Your attendance and work hours will be tracked automatically.'
    } else if (userMessage.includes('leave') || userMessage.includes('request')) {
      return 'To request leave, go to the leave request page and fill out the form with your dates and reason. Your request will be reviewed by administrators.'
    } else {
      return 'Thank you for your message. I understand you need help with: "' + lastUserMessage.content + '". For specific assistance, please contact our support team or check the help documentation.'
    }
  } catch (error) {
    console.error('Error in support chat:', error)
    return 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.'
  }
}



