'use server'

import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { success: true, user: userCredential.user }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

export async function signUpAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string

  try {
    const { createUserWithEmailAndPassword } = await import('firebase/auth')
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    // Update user profile
    const { updateProfile } = await import('firebase/auth')
    await updateProfile(userCredential.user, {
      displayName: `${firstName} ${lastName}`
    })

    return { success: true, user: userCredential.user }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
  }
}
