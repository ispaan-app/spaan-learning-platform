import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export interface AdminNotification {
  id: string;
  message: string;
  type: 'system' | 'message' | 'alert';
  date: string;
  read?: boolean;
}

export function useRealtimeAdminNotifications(limitCount = 10) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'adminNotifications'), orderBy('date', 'desc'), limit(limitCount));
    const unsub = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as AdminNotification));
    });
    return () => unsub();
  }, [limitCount]);

  return notifications;
}
