import { defineFlow, runFlow } from '@genkit-ai/flow'
import { z } from 'zod'

const ChatSchema = z.object({
  message: z.string().describe('The user message'),
  context: z.string().optional().describe('Additional context for the AI')
})

export const chatFlow = defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    // For now, return a mock response until we fix the AI integration
    const mockResponse = {
      text: `Thank you for your question: "${input.message}". This is a placeholder response from the AI tutor. Please configure your AI API key to get real responses.`
    }
    
    const result = mockResponse
    
    return result.text
  }
)

export const runChatFlow = runFlow(chatFlow)
