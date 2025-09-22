'use server'

import { adminDb as db } from '@/lib/firebase-admin'
import { revalidatePath } from 'next/cache'

export interface LearnerProfile {
  id?: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  suburb: string
  city: string
  province: string
  postalCode: string
  dateOfBirth: string
  gender: 'male' | 'female'
  idNumber: string
  nationality: string
  program: string
  programStartDate: string
  programEndDate: string
  studentNumber: string
  profileImage?: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
    email?: string
  }
  skills: string[]
  interests: string[]
  languages: string[]
  workExperience: {
    company: string
    position: string
    startDate: string
    endDate?: string
    description: string
  }[]
  education: {
    institution: string
    qualification: string
    startDate: string
    endDate?: string
    status: 'completed' | 'in-progress' | 'cancelled'
  }[]
  currentPlacement?: {
    id: string
    companyName: string
    position: string
    startDate: string
    endDate?: string
    status: 'active' | 'completed' | 'terminated'
    supervisor: {
      name: string
      email: string
      phone: string
    }
  }
  preferences: {
    notifications: {
      email: boolean
      sms: boolean
      push: boolean
    }
    privacy: {
      showProfile: boolean
      showContact: boolean
      showSkills: boolean
    }
  }
  createdAt: Date
  updatedAt: Date
}

export async function getLearnerProfileAction(userId: string): Promise<LearnerProfile | null> {
  try {
    const profileDoc = await db.collection('learnerProfiles').doc(userId).get()
    
    if (!profileDoc.exists) {
      return null
    }

    const data = profileDoc.data()
    if (!data) {
      return null
    }
    return {
      id: profileDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as LearnerProfile
  } catch (error) {
    console.error('Error fetching learner profile:', error)
    return null
  }
}

export async function updateLearnerProfileAction(userId: string, profileData: Partial<LearnerProfile>) {
  try {
    // Check if profile exists
    const profileDoc = await db.collection('learnerProfiles').doc(userId).get()
    
    if (!profileDoc.exists) {
      // Create new profile
      const newProfile: Omit<LearnerProfile, 'id'> = {
        userId,
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        suburb: profileData.suburb || '',
        city: profileData.city || '',
        province: profileData.province || '',
        postalCode: profileData.postalCode || '',
        dateOfBirth: profileData.dateOfBirth || '',
        gender: profileData.gender || 'male',
        idNumber: profileData.idNumber || '',
        nationality: profileData.nationality || '',
        program: profileData.program || '',
        programStartDate: profileData.programStartDate || '',
        programEndDate: profileData.programEndDate || '',
        studentNumber: profileData.studentNumber || '',
        profileImage: profileData.profileImage,
        emergencyContact: profileData.emergencyContact || {
          name: '',
          phone: '',
          relationship: ''
        },
        skills: profileData.skills || [],
        interests: profileData.interests || [],
        languages: profileData.languages || [],
        workExperience: profileData.workExperience || [],
        education: profileData.education || [],
        currentPlacement: profileData.currentPlacement,
        preferences: profileData.preferences || {
          notifications: {
            email: true,
            sms: false,
            push: true
          },
          privacy: {
            showProfile: true,
            showContact: false,
            showSkills: true
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await db.collection('learnerProfiles').doc(userId).set(newProfile)
    } else {
      // Update existing profile
      const updateData = {
        ...profileData,
        updatedAt: new Date()
      }

      await db.collection('learnerProfiles').doc(userId).update(updateData)
    }

    revalidatePath('/learner/profile')
    return { success: true }
  } catch (error) {
    console.error('Error updating learner profile:', error)
    return { success: false, error: 'Failed to update profile' }
  }
}

export async function uploadProfileImageAction(userId: string, imageData: string) {
  try {
    // In a real implementation, you would upload to Firebase Storage
    // For now, we'll just update the profile with the image data
    await db.collection('learnerProfiles').doc(userId).update({
      profileImage: imageData,
      updatedAt: new Date()
    })

    revalidatePath('/learner/profile')
    return { success: true, imageUrl: imageData }
  } catch (error) {
    console.error('Error uploading profile image:', error)
    return { success: false, error: 'Failed to upload image' }
  }
}

export async function getLearnerPlacementInfoAction(userId: string) {
  try {
    // Get placement info from the placements collection
    const placementsSnapshot = await db
      .collection('placements')
      .where('assignedLearners', 'array-contains', userId)
      .limit(1)
      .get()
    
    if (placementsSnapshot.empty) {
      return null
    }

    const placement = placementsSnapshot.docs[0].data()
    return {
      id: placementsSnapshot.docs[0].id,
      companyName: placement.companyName,
      position: placement.position,
      startDate: placement.startDate,
      endDate: placement.endDate,
      status: 'active'
    }
  } catch (error) {
    console.error('Error fetching placement info:', error)
    return null
  }
}

export async function updateLearnerPreferencesAction(userId: string, preferences: LearnerProfile['preferences']) {
  try {
    await db.collection('learnerProfiles').doc(userId).update({
      preferences,
      updatedAt: new Date()
    })

    revalidatePath('/learner/profile')
    return { success: true }
  } catch (error) {
    console.error('Error updating preferences:', error)
    return { success: false, error: 'Failed to update preferences' }
  }
}



