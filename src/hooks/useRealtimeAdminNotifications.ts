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
    let isMounted = true;

    try {
      const q = query(collection(db, 'adminNotifications'), orderBy('date', 'desc'), limit(limitCount));
      const unsub = onSnapshot(q, 
        (snapshot) => {
          if (isMounted) {
            setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as AdminNotification));
          }
        },
        (error) => {
          console.error('Error in useRealtimeAdminNotifications:', error);
          // Don't crash on network errors
          if (error.code !== 'unavailable' && error.code !== 'deadline-exceeded') {
            console.error('Critical error in admin notifications listener:', error);
          }
        }
      );
      
      return () => {
        isMounted = false;
        unsub();
      };
    } catch (error) {
      console.error('Error setting up admin notifications listener:', error);
      return () => {};
    }
  }, [limitCount]);

  return notifications;
}
