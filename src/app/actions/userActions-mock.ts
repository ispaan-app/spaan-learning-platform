'use server'

import { z } from 'zod'

const ApplicationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  age: z.string().min(1, 'Age is required'),
  gender: z.string().min(1, 'Gender is required'),
  idNumber: z.string().min(13, 'ID number must be exactly 13 characters').max(13, 'ID number must be exactly 13 characters'),
  nationality: z.string().min(1, 'Nationality is required'),
  streetAddress: z.string().min(1, 'Street address is required'),
  suburb: z.string().min(1, 'Suburb/Township is required'),
  province: z.string().min(1, 'Province is required'),
  program: z.string().min(1, 'Please select a program'),
  highestQualification: z.string().min(1, 'Highest qualification is required'),
  fieldOfStudy: z.string().min(1, 'Field of study is required'),
  yearsOfExperience: z.string().min(1, 'Years of experience is required'),
})

export async function createUser(formData: FormData) {
  try {
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      age: formData.get('age') as string,
      gender: formData.get('gender') as string,
      idNumber: formData.get('idNumber') as string,
      nationality: formData.get('nationality') as string,
      streetAddress: formData.get('streetAddress') as string,
      suburb: formData.get('suburb') as string,
      province: formData.get('province') as string,
      program: formData.get('program') as string,
      highestQualification: formData.get('highestQualification') as string,
      fieldOfStudy: formData.get('fieldOfStudy') as string,
      yearsOfExperience: formData.get('yearsOfExperience') as string,
    }

    // Validate the data
    const validatedData = ApplicationSchema.parse(data)

    // Generate a random 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString()

    // Mock user creation - in production this would create Firebase Auth user
    const mockUserId = `mock_user_${Date.now()}`
    
    // Mock database save - in production this would save to Firestore
    console.log('Mock user creation:', {
      userId: mockUserId,
      userData: validatedData,
      pin: pin,
      timestamp: new Date().toISOString()
    })

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1000))

    return { 
      success: true, 
      userId: mockUserId,
      pin: pin,
      message: 'Application submitted successfully! Please save your PIN for login.'
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Failed to create user account' }
  }
}

export async function updateUserStatus(userId: string, status: string, role?: string) {
  try {
    // Mock update - in production this would update Firestore
    console.log('Mock user status update:', { userId, status, role, timestamp: new Date().toISOString() })
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update user status' }
  }
}

export async function getUserById(userId: string) {
  try {
    // Mock user fetch - in production this would fetch from Firestore
    const mockUser = {
      id: userId,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'applicant',
      status: 'pending_review',
      createdAt: new Date().toISOString()
    }
    return { success: true, user: mockUser }
  } catch (error) {
    return { success: false, error: 'Failed to fetch user' }
  }
}

export async function getAllApplicants() {
  try {
    // Mock applicants fetch - in production this would fetch from Firestore
    const mockApplicants = [
      {
        id: 'mock_user_1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'applicant',
        status: 'pending_review',
        program: 'computer-science',
        createdAt: new Date().toISOString()
      },
      {
        id: 'mock_user_2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        role: 'applicant',
        status: 'pending_review',
        program: 'data-science',
        createdAt: new Date().toISOString()
      }
    ]
    return { success: true, applicants: mockApplicants }
  } catch (error) {
    return { success: false, error: 'Failed to fetch applicants' }
  }
}
