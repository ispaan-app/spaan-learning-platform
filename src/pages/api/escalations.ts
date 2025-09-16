import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const snapshot = await adminDb.collection('escalations').orderBy('createdAt', 'desc').limit(50).get();
      const escalations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.status(200).json({ escalations });
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch escalations' });
    }
  } else if (req.method === 'PATCH') {
    try {
      const { id, status, updatedBy, note } = req.body;
      const update: any = { status };
      if (note || updatedBy) {
        update.escalationHistory = FieldValue.arrayUnion({
          status,
          updatedBy,
          updatedAt: new Date(),
          note
        });
      }
      await adminDb.collection('escalations').doc(id).update(update);
      res.status(200).json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to update escalation' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
