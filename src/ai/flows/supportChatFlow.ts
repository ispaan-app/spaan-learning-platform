import { defineFlow } from '@genkit-ai/flow'
import { z } from 'zod'
import { gemini15Flash } from '@genkit-ai/googleai'

export const supportChatFlow = defineFlow(
  {
    name: 'supportChatFlow',
    inputSchema: z.object({
      userMessage: z.string(),
      userRole: z.enum(['learner', 'applicant', 'admin', 'super-admin']).optional(),
      conversationHistory: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
        timestamp: z.string()
      })).optional()
    }),
    outputSchema: z.object({
      response: z.string(),
      helpful: z.boolean().optional(),
      escalationNeeded: z.boolean().optional()
    })
  },
  async (input) => {
    const { userMessage, userRole = 'learner', conversationHistory = [] } = input

    const context = `
You are an AI Support Assistant for the iSpaan App. You help users navigate the platform and answer their questions about features and functionality.

User Role: ${userRole}
User Message: ${userMessage}

${conversationHistory.length > 0 ? `Conversation History:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}` : ''}

Platform Features You Can Help With:
1. Application Process
   - How to apply for programs
   - Required documents
   - Application status tracking
   - PIN-based login

2. Learner Features
   - Secure check-in process
   - Logging work hours
   - Leave request system
   - Document management
   - AI Career Mentor access

3. Admin Features
   - Reviewing applications
   - Managing learners
   - Placement management
   - Announcement creation

4. General Platform
   - Navigation and menus
   - Profile management
   - Password/PIN issues
   - Technical support

Your response should:
- Be helpful, clear, and concise
- Provide step-by-step instructions when appropriate
- Reference specific platform features and locations
- Be friendly and professional
- Offer to escalate to human support if needed
- Be 1-2 paragraphs in length

If the user's question is unclear or you cannot help, politely ask for clarification or suggest contacting human support.
`

    // For now, return a mock response until we fix the AI integration
    const mockResponse = {
      output: {
        response: `Thank you for your question: "${userMessage}". This is a placeholder response from the AI Support Assistant. Please configure your AI API key to get real responses.`,
        helpful: true,
        escalationNeeded: false
      }
    }
    
    const result = mockResponse

    return {
      response: result.output.response,
      helpful: result.output.helpful,
      escalationNeeded: result.output.escalationNeeded
    }
  }
)