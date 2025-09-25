'use server'

import { adminDb } from '@/lib/firebase-admin'

export interface Applicant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  program: string
  applicationDate: Date
  status: 'pending' | 'under-review' | 'approved' | 'rejected' | 'waitlisted'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  experience: number
  education: string
  location: string
  documents: number
  lastActivity: Date
  reviewer?: string
  notes?: string
  score?: number
}

export async function getApplicants(): Promise<Applicant[]> {
  try {
    const applicationsSnapshot = await adminDb
      .collection('applications')
      .orderBy('submittedAt', 'desc')
      .get()

    const applicants: Applicant[] = applicationsSnapshot.docs.map(doc => {
      const data = doc.data()
      const submittedAt = data.submittedAt?.toDate() || new Date()
      
      return {
        id: doc.id,
        firstName: data.firstName || 'Unknown',
        lastName: data.lastName || 'Unknown',
        email: data.email || 'No email',
        phone: data.phone || 'No phone',
        program: data.program || 'Unknown Program',
        applicationDate: submittedAt,
        status: data.status || 'pending',
        priority: getPriority(data),
        experience: data.experience || 0,
        education: data.education || 'Not specified',
        location: data.location || 'Not specified',
        documents: data.documents?.length || 0,
        lastActivity: data.updatedAt?.toDate() || submittedAt,
        reviewer: data.reviewer,
        notes: data.notes,
        score: data.score
      }
    })

    return applicants
  } catch (error) {
    console.error('Error fetching applicants:', error)
    throw new Error('Failed to fetch applicants')
  }
}

export async function updateApplicantStatus(
  applicantId: string, 
  status: string, 
  reviewer?: string, 
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await adminDb.collection('applications').doc(applicantId).update({
      status,
      reviewer,
      notes,
      updatedAt: new Date()
    })

    return { success: true }
  } catch (error) {
    console.error('Error updating applicant status:', error)
    return { success: false, error: 'Failed to update applicant status' }
  }
}

export async function getApplicantById(applicantId: string): Promise<Applicant | null> {
  try {
    const doc = await adminDb.collection('applications').doc(applicantId).get()
    
    if (!doc.exists) {
      return null
    }

    const data = doc.data()!
    const submittedAt = data.submittedAt?.toDate() || new Date()
    
    return {
      id: doc.id,
      firstName: data.firstName || 'Unknown',
      lastName: data.lastName || 'Unknown',
      email: data.email || 'No email',
      phone: data.phone || 'No phone',
      program: data.program || 'Unknown Program',
      applicationDate: submittedAt,
      status: data.status || 'pending',
      priority: getPriority(data),
      experience: data.experience || 0,
      education: data.education || 'Not specified',
      location: data.location || 'Not specified',
      documents: data.documents?.length || 0,
      lastActivity: data.updatedAt?.toDate() || submittedAt,
      reviewer: data.reviewer,
      notes: data.notes,
      score: data.score
    }
  } catch (error) {
    console.error('Error fetching applicant:', error)
    throw new Error('Failed to fetch applicant')
  }
}

function getPriority(data: any): 'low' | 'medium' | 'high' | 'urgent' {
  // Simple priority calculation based on various factors
  let score = 0
  
  // Experience points
  if (data.experience >= 5) score += 3
  else if (data.experience >= 3) score += 2
  else if (data.experience >= 1) score += 1
  
  // Education points
  if (data.education?.toLowerCase().includes('master') || data.education?.toLowerCase().includes('phd')) score += 2
  else if (data.education?.toLowerCase().includes('bachelor')) score += 1
  
  // Document completeness
  if (data.documents?.length >= 5) score += 1
  
  // Application age (older applications get higher priority)
  const daysSinceApplication = data.submittedAt ? 
    Math.floor((new Date().getTime() - data.submittedAt.toDate().getTime()) / (1000 * 60 * 60 * 24)) : 0
  if (daysSinceApplication >= 30) score += 2
  else if (daysSinceApplication >= 14) score += 1
  
  if (score >= 6) return 'urgent'
  if (score >= 4) return 'high'
  if (score >= 2) return 'medium'
  return 'low'
}




