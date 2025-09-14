import { defineFlow } from '@genkit-ai/flow'
import { z } from 'zod'
import { adminDb } from '@/lib/firebase-admin'

export const findUserByIdNumberFlow = defineFlow(
  {
    name: 'findUserByIdNumberFlow',
    inputSchema: z.object({
      idNumber: z.string()
    }),
    outputSchema: z.object({
      user: z.object({
        id: z.string(),
        email: z.string(),
        hashedPin: z.string(),
        role: z.string()
      }).optional(),
      found: z.boolean()
    })
  },
  async (input) => {
    const { idNumber } = input

    try {
      // Query Firestore for user with matching ID number
      const usersSnapshot = await adminDb
        .collection('users')
        .where('idNumber', '==', idNumber)
        .limit(1)
        .get()

      if (usersSnapshot.empty) {
        return {
          found: false,
          user: undefined
        }
      }

      const userDoc = usersSnapshot.docs[0]
      const userData = userDoc.data()

      return {
        found: true,
        user: {
          id: userDoc.id,
          email: userData.email,
          hashedPin: userData.hashedPin,
          role: userData.role
        }
      }
    } catch (error) {
      console.error('Error finding user by ID number:', error)
      return {
        found: false,
        user: undefined
      }
    }
  }
)
