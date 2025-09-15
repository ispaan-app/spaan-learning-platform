import { defineFlow } from '@genkit-ai/flow'
import { z } from 'zod'
import { gemini15Flash } from '@genkit-ai/googleai'

export const imagePromptFlow = defineFlow(
  {
    name: 'imagePromptFlow',
    inputSchema: z.object({
      concept: z.string()
    }),
    outputSchema: z.object({
      prompt: z.string()
    })
  },
  async (input) => {
    const { concept } = input

    const context = `
You are an AI Image Prompt Generator for the iSpaan App. Create a detailed, professional prompt for generating a high-quality hero image for an educational platform.

Concept: ${concept}

Requirements:
1. Create a detailed prompt suitable for image generation models (like DALL-E, Midjourney, or Imagen)
2. Focus on professional, modern, educational themes
3. Include specific visual elements that represent:
   - Learning and education
   - Technology and innovation
   - Career development
   - Professional growth
   - Modern, clean aesthetic
4. Specify style, lighting, composition, and mood
5. Ensure the image would work well as a hero banner for a website
6. Make it suitable for a South African educational context

The prompt should be detailed enough to generate a high-quality, professional image that represents the concept while maintaining brand consistency for an educational platform.
`

    // For now, return a mock response until we fix the AI integration
    const mockResponse = {
      text: `Professional educational platform hero image featuring ${concept}, modern clean design, bright lighting, technology and learning elements, suitable for website banner, high quality, professional photography style`
    }
    
    const result = mockResponse

    return {
      prompt: result.text
    }
  }
)
