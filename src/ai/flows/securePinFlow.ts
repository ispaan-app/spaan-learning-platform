import { defineFlow } from '@genkit-ai/flow'
import { z } from 'zod'
import { createHash } from 'crypto'

export const verifyPinFlow = defineFlow(
  {
    name: 'verifyPinFlow',
    inputSchema: z.object({
      plaintextPin: z.string(),
      hashedPin: z.string()
    }),
    outputSchema: z.object({
      isValid: z.boolean()
    })
  },
  async (input) => {
    const { plaintextPin, hashedPin } = input

    // Hash the plaintext PIN using the same algorithm
    const hash = createHash('sha256').update(plaintextPin).digest('hex')
    
    return {
      isValid: hash === hashedPin
    }
  }
)
