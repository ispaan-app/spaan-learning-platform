// Super Admin Broadcast Actions
'use server'

import { adminDb } from '@/lib/firebase-admin'
import { auditLogger } from '@/lib/auditLogger'
import { notificationActions } from '@/lib/notificationActions'

export interface BroadcastMessage {
  id?: string
  title: string
  message: string
  senderId: string
  senderName: string
  createdAt: Date
}

export async function sendBroadcastMessage(
  title: string,
  message: string,
  senderId: string,
  senderName: string
) {
  // Save broadcast to Firestore
  const docRef = await adminDb.collection('broadcasts').add({
    title,
    message,
    senderId,
    senderName,
    createdAt: new Date()
  })

  // Audit log
  await auditLogger.logSystem('BROADCAST_SENT', {
    title,
    message,
    senderId,
    senderName,
    broadcastId: docRef.id
  })

  // Notify all users (announcement)
  // In a real implementation, you would fetch all user IDs in batches
  // For demo, notify all admins and learners
  const adminSnapshot = await adminDb.collection('users').where('role', 'in', ['admin', 'learner']).get()
  const userIds = adminSnapshot.docs.map(doc => doc.id)
  await notificationActions.notifyAnnouncement(userIds, title, message, senderName)

  return { success: true, broadcastId: docRef.id }
}
