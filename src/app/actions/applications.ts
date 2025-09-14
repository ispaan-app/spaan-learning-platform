'use server'

import { adminDb } from '@/lib/firebase-admin'
import { z } from 'zod'

const ApplicationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  program: z.string().min(1, 'Please select a program'),
  experience: z.string().optional(),
})

export async function submitApplicationAction(formData: FormData) {
  try {
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      program: formData.get('program') as string,
      experience: formData.get('experience') as string,
    }

    // Validate the data
    const validatedData = ApplicationSchema.parse(data)

    // Save to Firestore
    const docRef = await adminDb.collection('applications').add({
      ...validatedData,
      status: 'pending',
      submittedAt: new Date(),
    })

    return { success: true, applicationId: docRef.id }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Failed to submit application' }
  }
}

export async function updateApplicationStatusAction(applicationId: string, status: string) {
  try {
    await adminDb.collection('applications').doc(applicationId).update({
      status,
      updatedAt: new Date(),
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update application status' }
  }
}
