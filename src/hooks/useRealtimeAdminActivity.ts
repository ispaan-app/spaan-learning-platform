import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export interface AdminActivity {
  id: string;
  adminName: string;
  action: string;
  target: string;
  timestamp: string;
  details?: string;
}

export function useRealtimeAdminActivity(limitCount = 10) {
  const [activities, setActivities] = useState<AdminActivity[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'adminActivity'), orderBy('timestamp', 'desc'), limit(limitCount));
    const unsub = onSnapshot(q, (snapshot) => {
      setActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as AdminActivity));
    });
    return () => unsub();
  }, [limitCount]);

  return activities;
}
