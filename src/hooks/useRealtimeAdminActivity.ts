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
    let isMounted = true;

    try {
      const q = query(collection(db, 'adminActivity'), orderBy('timestamp', 'desc'), limit(limitCount));
      const unsub = onSnapshot(q, 
        (snapshot) => {
          if (isMounted) {
            setActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as AdminActivity));
          }
        },
        (error) => {
          console.error('Error in useRealtimeAdminActivity:', error);
          // Don't crash on network errors
          if (error.code !== 'unavailable' && error.code !== 'deadline-exceeded') {
            console.error('Critical error in admin activity listener:', error);
          }
        }
      );
      
      return () => {
        isMounted = false;
        unsub();
      };
    } catch (error) {
      console.error('Error setting up admin activity listener:', error);
      return () => {};
    }
  }, [limitCount]);

  return activities;
}
