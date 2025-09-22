'use server'

import { ApplicationTimelineService } from '@/lib/application-timeline-service'

export async function createStatusChangeTimelineEvent(
  userId: string,
  oldStatus: string,
  newStatus: string,
  reviewerId?: string,
  notes?: string
) {
  try {
    await ApplicationTimelineService.createStatusChangeEvent(
      userId,
      oldStatus,
      newStatus,
      reviewerId,
      notes
    )
    return { success: true }
  } catch (error) {
    console.error('Error creating status change timeline event:', error)
    return { success: false, error: 'Failed to create timeline event' }
  }
}

export async function createDocumentStatusTimelineEvent(
  userId: string,
  documentType: string,
  status: 'approved' | 'rejected',
  reviewerId?: string,
  notes?: string
) {
  try {
    await ApplicationTimelineService.createDocumentStatusEvent(
      userId,
      documentType,
      status,
      reviewerId,
      notes
    )
    return { success: true }
  } catch (error) {
    console.error('Error creating document status timeline event:', error)
    return { success: false, error: 'Failed to create timeline event' }
  }
}
