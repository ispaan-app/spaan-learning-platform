// Escalation utility for unresolved issues
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export interface Escalation {
  id?: string
  type: 'document' | 'user' | 'support' | 'other'
  refId: string
  reason: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  createdBy: string
  createdAt: Date
  assignedTo?: string
  escalationHistory?: Array<{
    status: string
    updatedBy: string
    updatedAt: Date
    note?: string
  }>
}

export async function createEscalation(escalation: Omit<Escalation, 'id' | 'createdAt' | 'escalationHistory'>) {
  const entry: Escalation = {
    ...escalation,
    status: 'open',
    createdAt: new Date(),
    escalationHistory: [
      {
        status: 'open',
        updatedBy: escalation.createdBy,
        updatedAt: new Date(),
        note: escalation.reason
      }
    ]
  }
  const docRef = await adminDb.collection('escalations').add(entry)
  return { success: true, id: docRef.id }
}

export async function updateEscalationStatus(id: string, status: string, updatedBy: string, note?: string) {
  const update = {
    status,
    escalationHistory: FieldValue.arrayUnion({
      status,
      updatedBy,
      updatedAt: new Date(),
      note
    })
  }
  await adminDb.collection('escalations').doc(id).update(update)
  return { success: true }
}
