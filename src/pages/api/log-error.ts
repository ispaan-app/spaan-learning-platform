import { NextApiRequest, NextApiResponse } from 'next'
import { getFirestore } from 'firebase-admin/firestore'
import { getApp, getApps, initializeApp, cert } from 'firebase-admin/app'

// Only initialize once
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const db = getFirestore()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  try {
    const { userId, context, error, fileName, documentType, timestamp } = req.body
    await db.collection('errorLogs').add({
      userId,
      context,
      error,
      fileName,
      documentType,
      timestamp,
    })
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to log error' })
  }
}
