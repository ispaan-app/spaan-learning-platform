import { defineFlow } from '@genkit-ai/flow'
import { z } from 'zod'
import { gemini15Flash } from '@genkit-ai/googleai'

export const projectDescriptionFlow = defineFlow(
  {
    name: 'projectDescriptionFlow',
    inputSchema: z.object({
      name: z.string(),
      type: z.enum(['project', 'program'])
    }),
    outputSchema: z.object({
      description: z.string()
    })
  },
  async (input) => {
    const { name, type } = input

    const context = `
You are an AI Content Assistant for the iSpaan Learning Platform. Generate a professional, engaging description for a ${type} in the educational/work-integrated learning space.

${type === 'program' ? 'Program' : 'Project'} Name: ${name}

Requirements:
1. Create a compelling, professional description (2-3 paragraphs)
2. Focus on the value proposition and learning outcomes
3. Use engaging, accessible language
4. Include relevant details about:
   - What participants will learn
   - Skills they will develop
   - Career benefits and opportunities
   - Practical, hands-on experience
   - Industry relevance
5. Maintain a tone that is:
   - Professional yet approachable
   - Inspiring and motivating
   - Clear and informative
6. Ensure it's suitable for a South African educational context
7. Make it compelling enough to attract potential learners

The description should be ready to use on the platform with minimal editing required.
`

    // For now, return a mock response until we fix the AI integration
    const mockResponse = {
      text: `This is a comprehensive ${type} description for "${name}". This ${type} is designed to provide hands-on learning experiences and career development opportunities in the field. Participants will gain practical skills, industry knowledge, and professional experience through structured learning modules and real-world applications.`
    }
    
    const result = mockResponse

    return {
      description: result.text
    }
  }
)
