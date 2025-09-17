'use server'

import { adminDb } from '@/lib/firebase-admin'
import { revalidatePath } from 'next/cache'
import { safeToDate } from '@/lib/date-utils'

export interface Placement {
  id?: string
  companyName: string
  programId: string
  address: string
  suburb: string
  province: string
  contactPerson: string
  contactEmail: string
  contactPhone: string
  capacity: number
  assignedLearners: number
  description?: string
  latitude: number
  longitude: number
  qrCodeData: string
  status: 'active' | 'inactive' | 'full'
  createdAt: Date
  updatedAt: Date
}

export interface CreatePlacementData {
  companyName: string
  programId: string
  address: string
  suburb: string
  province: string
  contactPerson: string
  contactEmail: string
  contactPhone: string
  capacity: number
  description?: string
  latitude: number
  longitude: number
}

export async function createPlacementAction(data: CreatePlacementData) {
  try {
    // Generate QR code data (using document ID after creation)
    const qrCodeData = `placement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const placementData: Omit<Placement, 'id'> = {
      ...data,
      assignedLearners: 0,
      qrCodeData,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Add to Firestore
    const docRef = await adminDb.collection('placements').add(placementData)
    
    // Update with actual QR code data using the document ID
    await docRef.update({
      qrCodeData: `placement_${docRef.id}`
    })

    revalidatePath('/admin/placements')
    revalidatePath('/admin/placements/create')

    return { success: true, placementId: docRef.id }
  } catch (error) {
    console.error('Error creating placement:', error)
    return { success: false, error: 'Failed to create placement' }
  }
}

export async function getPlacementsAction(): Promise<Placement[]> {
  try {
    const placementsRef = adminDb.collection('placements')
    const snapshot = await placementsRef.orderBy('createdAt', 'desc').get()
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      
      return {
        id: doc.id,
        ...data,
        createdAt: safeToDate(data.createdAt),
        updatedAt: safeToDate(data.updatedAt)
      }
    }) as Placement[]
  } catch (error) {
    console.error('Error fetching placements:', error)
    return []
  }
}

export async function getPlacementByIdAction(placementId: string): Promise<Placement | null> {
  try {
    const placementRef = adminDb.collection('placements').doc(placementId)
    const placementDoc = await placementRef.get()
    
    if (!placementDoc.exists) {
      return null
    }

    const data = placementDoc.data()!
    
    return {
      id: placementDoc.id,
      ...data,
      createdAt: safeToDate(data.createdAt),
      updatedAt: safeToDate(data.updatedAt)
    } as Placement
  } catch (error) {
    console.error('Error fetching placement:', error)
    return null
  }
}

export async function updatePlacementStatusAction(placementId: string, status: 'active' | 'inactive' | 'full') {
  try {
    const placementRef = adminDb.collection('placements').doc(placementId)
    await placementRef.update({
      status,
      updatedAt: new Date()
    })

    revalidatePath('/admin/placements')
    revalidatePath(`/admin/placements/${placementId}`)

    return { success: true }
  } catch (error) {
    console.error('Error updating placement status:', error)
    return { success: false, error: 'Failed to update placement status' }
  }
}

export async function getProgramsAction() {
  try {
    const programsRef = adminDb.collection('programs')
    const snapshot = await programsRef.get()
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name || '',
        description: data.description || ''
      }
    })
  } catch (error) {
    console.error('Error fetching programs:', error)
    return []
  }
}

export interface Learner {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  program: string
  skills: string[]
  interests: string[]
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
  }
  createdAt: Date
  updatedAt: Date
}

export async function getUnassignedLearnersByProgramAction(programId: string): Promise<Learner[]> {
  try {
    const learnersRef = adminDb.collection('learnerProfiles')
    const snapshot = await learnersRef
      .where('program', '==', programId)
      .where('currentPlacement', '==', null)
      .get()
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: safeToDate(data.createdAt),
        updatedAt: safeToDate(data.updatedAt)
      }
    }) as Learner[]
  } catch (error) {
    console.error('Error fetching unassigned learners:', error)
    return []
  }
}

export async function getAllLearnersByProgramAction(programId: string): Promise<Learner[]> {
  try {
    const learnersRef = adminDb.collection('learnerProfiles')
    const snapshot = await learnersRef
      .where('program', '==', programId)
      .get()
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: safeToDate(data.createdAt),
        updatedAt: safeToDate(data.updatedAt)
      }
    }) as Learner[]
  } catch (error) {
    console.error('Error fetching learners:', error)
    return []
  }
}

export async function enrollLearnerAction(placementId: string, learnerId: string) {
  try {
    // Get learner profile
    const learnerRef = adminDb.collection('learnerProfiles').doc(learnerId)
    const learnerDoc = await learnerRef.get()
    
    if (!learnerDoc.exists) {
      return { success: false, error: 'Learner not found' }
    }
    
    const learnerData = learnerDoc.data()!
    
    // Get placement details
    const placementRef = adminDb.collection('placements').doc(placementId)
    const placementDoc = await placementRef.get()
    
    if (!placementDoc.exists) {
      return { success: false, error: 'Placement not found' }
    }
    
    const placementData = placementDoc.data()!
    
    // Check if placement has capacity
    if (placementData.assignedLearners >= placementData.capacity) {
      return { success: false, error: 'Placement is at full capacity' }
    }
    
    // Update learner profile with current placement
    await learnerRef.update({
      currentPlacement: {
        id: placementId,
        companyName: placementData.companyName,
        position: 'Work-Integrated Learning Student',
        startDate: new Date().toISOString().split('T')[0],
        status: 'active',
        supervisor: {
          name: placementData.contactPerson,
          email: placementData.contactEmail,
          phone: placementData.contactPhone
        }
      },
      updatedAt: new Date()
    })
    
    // Update placement assigned learners count
    await placementRef.update({
      assignedLearners: placementData.assignedLearners + 1,
      status: placementData.assignedLearners + 1 >= placementData.capacity ? 'full' : 'active',
      updatedAt: new Date()
    })
    
    revalidatePath('/admin/placements')
    revalidatePath(`/admin/placements/${placementId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error enrolling learner:', error)
    return { success: false, error: 'Failed to enroll learner' }
  }
}
