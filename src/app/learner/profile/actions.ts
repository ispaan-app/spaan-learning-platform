'use server'

import { adminDb as db } from '@/lib/firebase-admin'
import { collection, doc, getDoc, updateDoc, addDoc, query, where, getDocs } from 'firebase/firestore'
import { revalidatePath } from 'next/cache'

export interface LearnerProfile {
  id?: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say'
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
    const profileRef = doc(db as any, 'learnerProfiles', userId)
    const profileDoc = await getDoc(profileRef)
    
    if (!profileDoc.exists()) {
      return null
    }

    const data = profileDoc.data()
    return {
      id: profileDoc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as LearnerProfile
  } catch (error) {
    console.error('Error fetching learner profile:', error)
    return null
  }
}

export async function updateLearnerProfileAction(userId: string, profileData: Partial<LearnerProfile>) {
  try {
    const profileRef = doc(db as any, 'learnerProfiles', userId)
    
    // Check if profile exists
    const profileDoc = await getDoc(profileRef)
    
    if (!profileDoc.exists()) {
      // Create new profile
      const newProfile: Omit<LearnerProfile, 'id'> = {
        userId,
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        city: profileData.city || '',
        province: profileData.province || '',
        postalCode: profileData.postalCode || '',
        dateOfBirth: profileData.dateOfBirth || '',
        gender: profileData.gender || 'prefer-not-to-say',
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

      await addDoc(collection(db as any, 'learnerProfiles'), newProfile)
    } else {
      // Update existing profile
      const updateData = {
        ...profileData,
        updatedAt: new Date()
      }

      await updateDoc(profileRef, updateData)
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
    const profileRef = doc(db as any, 'learnerProfiles', userId)
    await updateDoc(profileRef, {
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
    const placementsRef = collection(db as any, 'placements')
    const placementsQuery = query(
      placementsRef,
      where('assignedLearners', 'array-contains', userId)
    )
    const placementsSnapshot = await getDocs(placementsQuery)
    
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
    const profileRef = doc(db as any, 'learnerProfiles', userId)
    await updateDoc(profileRef, {
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



