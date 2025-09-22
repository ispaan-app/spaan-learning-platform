import { adminDb } from '@/lib/firebase-admin'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore'

export interface CompleteUserProfile {
  // Basic user data
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'applicant' | 'learner' | 'admin' | 'super-admin'
  status: 'pending' | 'active' | 'inactive' | 'suspended'
  avatar?: string
  createdAt: Date
  updatedAt: Date
  
  // Learner-specific data
  learnerProfile?: {
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
    workExperience: Array<{
      company: string
      position: string
      startDate: string
      endDate?: string
      description: string
    }>
    education: Array<{
      institution: string
      qualification: string
      startDate: string
      endDate?: string
      status: 'completed' | 'in-progress' | 'cancelled'
    }>
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
  }
  
  // Application data
  application?: {
    id: string
    program: string
    status: 'pending' | 'under-review' | 'approved' | 'rejected' | 'waitlisted'
    submittedAt: Date
    documents: string[]
    notes?: string
    reviewer?: string
  }
  
  // Placement data
  placement?: {
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
    monthlyHours?: number
    targetHours?: number
  }
}

export class UserDataManager {
  /**
   * Get complete user profile from all collections
   */
  static async getCompleteUserProfile(uid: string): Promise<CompleteUserProfile | null> {
    try {
      // Get basic user data
      const userDoc = await adminDb.collection('users').doc(uid).get()
      if (!userDoc.exists) {
        return null
      }

      const userData = userDoc.data()!
      const profile: CompleteUserProfile = {
        id: uid,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        role: userData.role || 'learner',
        status: userData.status || 'active',
        avatar: userData.avatar,
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate() || new Date()
      }

      // Get learner-specific data if user is a learner
      if (profile.role === 'learner') {
        try {
          const learnerProfileDoc = await adminDb.collection('learnerProfiles').doc(uid).get()
          if (learnerProfileDoc.exists) {
            const learnerData = learnerProfileDoc.data()!
            profile.learnerProfile = {
              phone: learnerData.phone || '',
              address: learnerData.address || '',
              suburb: learnerData.suburb || '',
              city: learnerData.city || '',
              province: learnerData.province || '',
              postalCode: learnerData.postalCode || '',
              dateOfBirth: learnerData.dateOfBirth || '',
              gender: learnerData.gender || 'male',
              idNumber: learnerData.idNumber || '',
              nationality: learnerData.nationality || 'South African',
              program: learnerData.program || '',
              programStartDate: learnerData.programStartDate || '',
              programEndDate: learnerData.programEndDate || '',
              studentNumber: learnerData.studentNumber || '',
              profileImage: learnerData.profileImage,
              emergencyContact: learnerData.emergencyContact || {
                name: '',
                phone: '',
                relationship: ''
              },
              skills: learnerData.skills || [],
              interests: learnerData.interests || [],
              languages: learnerData.languages || [],
              workExperience: learnerData.workExperience || [],
              education: learnerData.education || [],
              preferences: learnerData.preferences || {
                notifications: { email: true, sms: false, push: true },
                privacy: { showProfile: true, showContact: false, showSkills: true }
              }
            }
          }
        } catch (error) {
          console.warn('Could not fetch learner profile:', error)
        }
      }

      // Get application data
      try {
        const applicationsSnapshot = await adminDb
          .collection('applications')
          .where('userId', '==', uid)
          .orderBy('submittedAt', 'desc')
          .limit(1)
          .get()

        if (!applicationsSnapshot.empty) {
          const appData = applicationsSnapshot.docs[0].data()
          profile.application = {
            id: applicationsSnapshot.docs[0].id,
            program: appData.program || '',
            status: appData.status || 'pending',
            submittedAt: appData.submittedAt?.toDate() || new Date(),
            documents: appData.documents || [],
            notes: appData.notes,
            reviewer: appData.reviewer
          }
        }
      } catch (error) {
        console.warn('Could not fetch application data:', error)
      }

      // Get placement data
      try {
        const placementsSnapshot = await adminDb
          .collection('placements')
          .where('learnerId', '==', uid)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get()

        if (!placementsSnapshot.empty) {
          const placementData = placementsSnapshot.docs[0].data()
          profile.placement = {
            id: placementsSnapshot.docs[0].id,
            companyName: placementData.companyName || '',
            position: placementData.position || '',
            startDate: placementData.startDate || '',
            endDate: placementData.endDate,
            status: placementData.status || 'active',
            supervisor: placementData.supervisor || {
              name: '',
              email: '',
              phone: ''
            },
            monthlyHours: placementData.monthlyHours,
            targetHours: placementData.targetHours
          }
        }
      } catch (error) {
        console.warn('Could not fetch placement data:', error)
      }

      return profile
    } catch (error) {
      console.error('Error getting complete user profile:', error)
      return null
    }
  }

  /**
   * Update user profile across all relevant collections
   */
  static async updateUserProfile(uid: string, updates: Partial<CompleteUserProfile>): Promise<boolean> {
    try {
      const batch = adminDb.batch()
      const now = new Date()

      // Update basic user data
      if (updates.firstName || updates.lastName || updates.email || updates.role || updates.status || updates.avatar) {
        const userRef = adminDb.collection('users').doc(uid)
        const userUpdates: any = {
          updatedAt: now
        }

        if (updates.firstName) userUpdates.firstName = updates.firstName
        if (updates.lastName) userUpdates.lastName = updates.lastName
        if (updates.email) userUpdates.email = updates.email
        if (updates.role) userUpdates.role = updates.role
        if (updates.status) userUpdates.status = updates.status
        if (updates.avatar) userUpdates.avatar = updates.avatar

        batch.update(userRef, userUpdates)

        // Update custom claims if role changed
        if (updates.role) {
          const { adminAuth } = await import('@/lib/firebase-admin')
          await adminAuth.setCustomUserClaims(uid, { role: updates.role })
        }
      }

      // Update learner profile if provided
      if (updates.learnerProfile) {
        const learnerRef = adminDb.collection('learnerProfiles').doc(uid)
        const learnerUpdates = {
          ...updates.learnerProfile,
          updatedAt: now
        }
        batch.update(learnerRef, learnerUpdates)
      }

      await batch.commit()
      return true
    } catch (error) {
      console.error('Error updating user profile:', error)
      return false
    }
  }

  /**
   * Validate user data consistency across collections
   */
  static async validateUserConsistency(uid: string): Promise<{
    isValid: boolean
    issues: string[]
    recommendations: string[]
  }> {
    const issues: string[] = []
    const recommendations: string[] = []

    try {
      const profile = await this.getCompleteUserProfile(uid)
      if (!profile) {
        return {
          isValid: false,
          issues: ['User profile not found'],
          recommendations: ['Create user profile in users collection']
        }
      }

      // Check role consistency
      if (profile.role === 'learner' && !profile.learnerProfile) {
        issues.push('Learner role but no learner profile found')
        recommendations.push('Create learner profile or update user role')
      }

      // Check application status consistency
      if (profile.application && profile.application.status === 'approved' && profile.role !== 'learner') {
        issues.push('Approved application but user role is not learner')
        recommendations.push('Update user role to learner or review application status')
      }

      // Check placement consistency
      if (profile.placement && profile.role !== 'learner') {
        issues.push('Placement found but user role is not learner')
        recommendations.push('Update user role to learner or remove placement')
      }

      // Check data completeness
      if (profile.role === 'learner') {
        if (!profile.learnerProfile?.program) {
          issues.push('Learner profile missing program information')
          recommendations.push('Add program information to learner profile')
        }
        if (!profile.learnerProfile?.phone) {
          issues.push('Learner profile missing phone number')
          recommendations.push('Add phone number to learner profile')
        }
      }

      return {
        isValid: issues.length === 0,
        issues,
        recommendations
      }
    } catch (error) {
      console.error('Error validating user consistency:', error)
      return {
        isValid: false,
        issues: ['Error validating user data'],
        recommendations: ['Check database connectivity and user permissions']
      }
    }
  }

  /**
   * Sync user data across collections
   */
  static async syncUserData(uid: string): Promise<boolean> {
    try {
      const profile = await this.getCompleteUserProfile(uid)
      if (!profile) {
        return false
      }

      const batch = adminDb.batch()
      const now = new Date()

      // Sync basic data across collections
      const userRef = adminDb.collection('users').doc(uid)
      const learnerRef = adminDb.collection('learnerProfiles').doc(uid)

      // Update learner profile with basic user data
      if (profile.role === 'learner') {
        const learnerUpdates = {
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          updatedAt: now
        }
        batch.update(learnerRef, learnerUpdates)
      }

      await batch.commit()
      return true
    } catch (error) {
      console.error('Error syncing user data:', error)
      return false
    }
  }
}
