import { defineFlow } from '@genkit-ai/flow'
import { z } from 'zod'
import { gemini15Flash } from '@genkit-ai/googleai'

export const careerMentorFlow = defineFlow(
  {
    name: 'careerMentorFlow',
    inputSchema: z.object({
      learnerProfile: z.object({
        firstName: z.string(),
        lastName: z.string(),
        program: z.string(),
        experience: z.string(),
        skills: z.array(z.string()),
        goals: z.string().optional(),
        currentPlacement: z.string().optional()
      }),
      conversationHistory: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
        timestamp: z.string()
      })),
      currentMessage: z.string()
    }),
    outputSchema: z.object({
      response: z.string(),
      suggestions: z.array(z.string()).optional(),
      resources: z.array(z.string()).optional()
    })
  },
  async (input) => {
    const { learnerProfile, conversationHistory, currentMessage } = input

    const context = `
You are an AI Career Mentor for the iSpaan Learning Platform. You are an expert career coach providing personalized, one-on-one career advice to learners.

Learner Profile:
- Name: ${learnerProfile.firstName} ${learnerProfile.lastName}
- Program: ${learnerProfile.program}
- Experience: ${learnerProfile.experience}
- Skills: ${learnerProfile.skills.join(', ')}
- Goals: ${learnerProfile.goals || 'Not specified'}
- Current Placement: ${learnerProfile.currentPlacement || 'Not assigned'}

Conversation History:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Current Message: ${currentMessage}

As a career mentor, you should:
1. Provide personalized, actionable career advice
2. Help with CV feedback and improvement
3. Assist with interview preparation
4. Guide long-term career goal setting
5. Offer industry insights and trends
6. Suggest relevant skills development
7. Provide encouragement and motivation
8. Be supportive, professional, and encouraging

Your response should:
- Be conversational and engaging
- Reference their specific program and experience
- Provide practical, actionable advice
- Include relevant suggestions for their career development
- Offer specific resources or next steps when appropriate
- Maintain a positive, encouraging tone
- Be 2-3 paragraphs in length

Focus on helping them succeed in their current program and prepare for their future career.
`

    // For now, return a mock response until we fix the AI integration
    const mockResponse = {
      output: {
        response: `Thank you for your question: "${currentMessage}". This is a placeholder response from the AI Career Mentor. Please configure your AI API key to get personalized career advice.`,
        suggestions: ['Update your CV', 'Practice interview skills', 'Network with professionals'],
        resources: ['Career development courses', 'Industry networking events', 'Mentorship programs']
      }
    }
    
    const result = mockResponse

    return {
      response: result.output.response,
      suggestions: result.output.suggestions,
      resources: result.output.resources
    }
  }
)