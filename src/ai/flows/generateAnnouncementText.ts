import { defineFlow } from '@genkit-ai/flow'
import { z } from 'zod'
import { gemini15Flash } from '@genkit-ai/googleai'

export const generateAnnouncementTextFlow = defineFlow(
  {
    name: 'generateAnnouncementTextFlow',
    inputSchema: z.object({
      topic: z.string(),
      targetAudience: z.enum(['all', 'learners', 'applicants', 'admins']).optional(),
      urgency: z.enum(['low', 'medium', 'high']).optional()
    }),
    outputSchema: z.object({
      subject: z.string(),
      message: z.string(),
      tone: z.string()
    })
  },
  async (input) => {
    const { topic, targetAudience = 'all', urgency = 'medium' } = input

    const context = `
You are an AI Announcement Writer for the iSpaan Learning Platform. Create a professional announcement based on the provided topic.

Topic: ${topic}
Target Audience: ${targetAudience}
Urgency Level: ${urgency}

Requirements:
1. Create a clear, compelling subject line (max 60 characters)
2. Write a professional message body that:
   - Is appropriate for the target audience
   - Matches the urgency level
   - Uses professional yet approachable tone
   - Includes relevant details and next steps
   - Is well-structured with proper formatting
   - Maintains consistency with educational platform standards
3. Determine the appropriate tone based on the topic and urgency

For the target audience:
- "all": General announcement for all platform users
- "learners": Specific to approved learners
- "applicants": Specific to pending applicants
- "admins": Internal announcement for administrators

For urgency levels:
- "low": Informational updates, general news
- "medium": Important updates, schedule changes
- "high": Urgent notifications, system issues, critical updates

The announcement should be ready to publish with minimal editing required.
`

    // For now, return a mock response until we fix the AI integration
    const mockResponse = {
      output: {
        subject: `Announcement: ${topic}`,
        message: `This is a placeholder announcement about ${topic} for ${targetAudience} audience with ${urgency} urgency. Please configure your AI API key to generate real content.`,
        tone: urgency === 'high' ? 'urgent' : urgency === 'medium' ? 'professional' : 'informational'
      }
    }
    
    const result = mockResponse

    return {
      subject: result.output.subject,
      message: result.output.message,
      tone: result.output.tone
    }
  }
)
