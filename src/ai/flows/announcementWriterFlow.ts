import { defineFlow } from '@genkit-ai/flow'
import { z } from 'zod'
import { gemini15Flash } from '@genkit-ai/googleai'

export const announcementWriterFlow = defineFlow(
  {
    name: 'announcementWriterFlow',
    inputSchema: z.object({
      topic: z.string()
    }),
    outputSchema: z.object({
      draft: z.object({
        subject: z.string(),
        message: z.string(),
        tone: z.string(),
        targetAudience: z.string()
      })
    })
  },
  async (input) => {
    const { topic } = input

    const context = `
You are an AI Announcement Writer for the iSpaan App. Create a professional, engaging announcement based on the provided topic.

Topic: ${topic}

Requirements:
1. Create a clear, compelling subject line (max 60 characters)
2. Write a professional message body that:
   - Is informative and engaging
   - Uses appropriate tone for educational platform
   - Includes relevant details and next steps
   - Is well-structured with proper formatting
   - Maintains professional yet friendly tone
3. Determine the appropriate tone (Professional, Friendly, Urgent, Informational)
4. Identify the target audience (All Users, Learners Only, Admins Only, etc.)

The announcement should be suitable for an educational platform focused on work-integrated learning and career development.
`

    // For now, return a mock response until we fix the AI integration
    const mockResponse = {
      text: `Subject: ${topic}\n\nMessage: This is a placeholder announcement about ${topic}. Please configure your AI API key to generate real content.\n\nTone: Professional\nTarget Audience: All Users`
    }
    
    const result = mockResponse

    // Parse the response to extract structured data
    const responseText = result.text
    
    // Simple parsing - in a real implementation, you might want more sophisticated parsing
    const lines = responseText.split('\n').filter(line => line.trim())
    
    let subject = ''
    let message = ''
    let tone = 'Professional'
    let targetAudience = 'All Users'
    
    // Basic parsing logic
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase()
      if (line.includes('subject:') || line.includes('title:')) {
        subject = lines[i].split(':')[1]?.trim() || ''
      } else if (line.includes('tone:')) {
        tone = lines[i].split(':')[1]?.trim() || 'Professional'
      } else if (line.includes('audience:') || line.includes('target:')) {
        targetAudience = lines[i].split(':')[1]?.trim() || 'All Users'
      } else if (line.includes('message:') || line.includes('body:')) {
        // Get the message body (everything after this line)
        message = lines.slice(i + 1).join('\n').trim()
        break
      }
    }
    
    // If no structured parsing worked, use the full response as message
    if (!message) {
      message = responseText
    }

    return {
      draft: {
        subject: subject || `Announcement: ${topic}`,
        message: message || responseText,
        tone: tone,
        targetAudience: targetAudience
      }
    }
  }
)
