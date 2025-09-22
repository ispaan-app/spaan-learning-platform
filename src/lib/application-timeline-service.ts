'use client'

import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore'

export interface TimelineEvent {
  id: string
  type: 'application_submitted' | 'document_uploaded' | 'document_approved' | 'document_rejected' | 'status_changed' | 'review_started' | 'interview_scheduled' | 'decision_made' | 'notification_sent'
  title: string
  description: string
  status: 'completed' | 'in-progress' | 'upcoming' | 'pending' | 'cancelled'
  timestamp: Date
  metadata?: {
    documentType?: string
    oldStatus?: string
    newStatus?: string
    reviewerId?: string
    notes?: string
    interviewDate?: Date
    decision?: 'approved' | 'rejected' | 'waitlisted'
  }
}

export interface ApplicationTimeline {
  events: TimelineEvent[]
  currentStep: number
  totalSteps: number
  progress: number
  nextStep?: TimelineEvent
  lastUpdate: Date
}

export class ApplicationTimelineService {
  /**
   * Generate timeline based on application status and document status
   */
  static generateTimeline(
    applicationStatus: string,
    documentStatus: { [key: string]: string } = {},
    applicationDate: Date,
    lastUpdate: Date = new Date()
  ): ApplicationTimeline {
    const events: TimelineEvent[] = []
    const now = new Date()
    
    // Normalize status to handle both underscore and hyphen formats
    const normalizedStatus = applicationStatus.replace(/_/g, '-')
    
    // 1. Application Submitted (always completed)
    events.push({
      id: 'app-submitted',
      type: 'application_submitted',
      title: 'Application Submitted',
      description: 'Your application has been successfully submitted and is under review.',
      status: 'completed',
      timestamp: applicationDate,
      metadata: {}
    })

    // 2. Documents Uploaded (based on document status)
    const documentTypes = ['certifiedId', 'proofOfAddress', 'highestQualification', 'proofOfBanking', 'taxNumber']
    const uploadedDocs = documentTypes.filter(docType => documentStatus[docType] && documentStatus[docType] !== 'pending')
    
    if (uploadedDocs.length > 0) {
      events.push({
        id: 'docs-uploaded',
        type: 'document_uploaded',
        title: 'Documents Uploaded',
        description: `${uploadedDocs.length} of ${documentTypes.length} required documents have been uploaded.`,
        status: 'completed',
        timestamp: new Date(applicationDate.getTime() + 24 * 60 * 60 * 1000), // 1 day after application
        metadata: { documentType: uploadedDocs.join(', ') }
      })
    }

    // 3. Document Review Started
    if (normalizedStatus === 'document-review' || uploadedDocs.length > 0) {
      events.push({
        id: 'review-started',
        type: 'review_started',
        title: 'Document Review Started',
        description: 'Your documents are being reviewed by our team.',
        status: normalizedStatus === 'document-review' ? 'in-progress' : 'upcoming',
        timestamp: new Date(applicationDate.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days after application
        metadata: {}
      })
    }

    // 4. Documents Approved/Rejected
    const approvedDocs = documentTypes.filter(docType => documentStatus[docType] === 'approved')
    const rejectedDocs = documentTypes.filter(docType => documentStatus[docType] === 'rejected')
    
    if (approvedDocs.length > 0) {
      events.push({
        id: 'docs-approved',
        type: 'document_approved',
        title: 'Documents Approved',
        description: `${approvedDocs.length} documents have been approved.`,
        status: 'completed',
        timestamp: new Date(applicationDate.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days after application
        metadata: { documentType: approvedDocs.join(', ') }
      })
    }

    if (rejectedDocs.length > 0) {
      events.push({
        id: 'docs-rejected',
        type: 'document_rejected',
        title: 'Documents Rejected',
        description: `${rejectedDocs.length} documents need to be resubmitted.`,
        status: 'completed',
        timestamp: new Date(applicationDate.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days after application
        metadata: { documentType: rejectedDocs.join(', ') }
      })
    }

    // 5. Status Changes
    if (normalizedStatus !== 'pending-review') {
      events.push({
        id: 'status-changed',
        type: 'status_changed',
        title: 'Status Updated',
        description: `Application status changed to ${this.getStatusDisplayName(normalizedStatus)}.`,
        status: 'completed',
        timestamp: lastUpdate,
        metadata: { newStatus: normalizedStatus }
      })
    }

    // 6. Interview Scheduled (if applicable)
    if (normalizedStatus === 'approved' || normalizedStatus === 'document-review') {
      const interviewDate = new Date(applicationDate.getTime() + 7 * 24 * 60 * 60 * 1000) // 1 week after application
      events.push({
        id: 'interview-scheduled',
        type: 'interview_scheduled',
        title: 'Interview Scheduled',
        description: 'An interview has been scheduled for your application.',
        status: normalizedStatus === 'approved' ? 'completed' : 'upcoming',
        timestamp: interviewDate,
        metadata: { interviewDate }
      })
    }

    // 7. Final Decision
    if (normalizedStatus === 'approved' || normalizedStatus === 'rejected' || normalizedStatus === 'waitlisted') {
      events.push({
        id: 'decision-made',
        type: 'decision_made',
        title: 'Final Decision Made',
        description: `Your application has been ${this.getStatusDisplayName(normalizedStatus).toLowerCase()}.`,
        status: 'completed',
        timestamp: lastUpdate,
        metadata: { decision: normalizedStatus as any }
      })
    } else {
      // Upcoming decision
      events.push({
        id: 'decision-pending',
        type: 'decision_made',
        title: 'Final Decision Pending',
        description: 'A final decision on your application is pending.',
        status: 'upcoming',
        timestamp: new Date(applicationDate.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks after application
        metadata: {}
      })
    }

    // Sort events by timestamp
    events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

    // Calculate progress
    const completedEvents = events.filter(e => e.status === 'completed').length
    const totalEvents = events.length
    const progress = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0

    // Find current step
    const currentStep = completedEvents
    const nextStep = events.find(e => e.status === 'in-progress' || e.status === 'upcoming')

    return {
      events,
      currentStep,
      totalSteps: totalEvents,
      progress,
      nextStep,
      lastUpdate
    }
  }

  /**
   * Get display name for status
   */
  private static getStatusDisplayName(status: string): string {
    switch (status) {
      case 'pending-review':
        return 'Pending Review'
      case 'document-review':
        return 'Document Review'
      case 'approved':
        return 'Approved'
      case 'rejected':
        return 'Rejected'
      case 'waitlisted':
        return 'Waitlisted'
      default:
        return 'Unknown'
    }
  }

  /**
   * Add a timeline event to the database
   */
  static async addTimelineEvent(
    userId: string,
    event: Omit<TimelineEvent, 'id' | 'timestamp'>
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'timeline-events'), {
        ...event,
        userId,
        timestamp: new Date()
      })
      return docRef.id
    } catch (error) {
      console.error('Error adding timeline event:', error)
      throw error
    }
  }

  /**
   * Get timeline events for a user
   */
  static async getTimelineEvents(userId: string, limitCount: number = 20): Promise<TimelineEvent[]> {
    try {
      const q = query(
        collection(db, 'timeline-events'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      )
      
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      })) as TimelineEvent[]
    } catch (error) {
      console.error('Error fetching timeline events:', error)
      return []
    }
  }

  /**
   * Create timeline events for status changes
   */
  static async createStatusChangeEvent(
    userId: string,
    oldStatus: string,
    newStatus: string,
    reviewerId?: string,
    notes?: string
  ): Promise<void> {
    const event: Omit<TimelineEvent, 'id' | 'timestamp'> = {
      type: 'status_changed',
      title: 'Status Updated',
      description: `Application status changed from ${this.getStatusDisplayName(oldStatus)} to ${this.getStatusDisplayName(newStatus)}.`,
      status: 'completed',
      metadata: {
        oldStatus,
        newStatus,
        reviewerId,
        notes
      }
    }

    await this.addTimelineEvent(userId, event)
  }

  /**
   * Create timeline events for document status changes
   */
  static async createDocumentStatusEvent(
    userId: string,
    documentType: string,
    status: 'approved' | 'rejected',
    reviewerId?: string,
    notes?: string
  ): Promise<void> {
    const event: Omit<TimelineEvent, 'id' | 'timestamp'> = {
      type: status === 'approved' ? 'document_approved' : 'document_rejected',
      title: `Document ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      description: `Your ${documentType} document has been ${status}.`,
      status: 'completed',
      metadata: {
        documentType,
        reviewerId,
        notes
      }
    }

    await this.addTimelineEvent(userId, event)
  }

  /**
   * Get timeline icon for event type
   */
  static getTimelineIcon(type: TimelineEvent['type']): string {
    switch (type) {
      case 'application_submitted':
        return '📝'
      case 'document_uploaded':
        return '📄'
      case 'document_approved':
        return '✅'
      case 'document_rejected':
        return '❌'
      case 'status_changed':
        return '🔄'
      case 'review_started':
        return '👀'
      case 'interview_scheduled':
        return '📅'
      case 'decision_made':
        return '🎯'
      case 'notification_sent':
        return '🔔'
      default:
        return '📌'
    }
  }

  /**
   * Get timeline color for status
   */
  static getTimelineColor(status: TimelineEvent['status']): string {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'in-progress':
        return 'text-blue-600 bg-blue-100'
      case 'upcoming':
        return 'text-yellow-600 bg-yellow-100'
      case 'pending':
        return 'text-gray-600 bg-gray-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }
}
