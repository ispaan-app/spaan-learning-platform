import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export function useAdminList() {
  const [admins, setAdmins] = useState<{ uid: string; displayName: string }[]>([]);

  useEffect(() => {
    let isMounted = true;

    try {
      const q = query(collection(db, 'users'), where('role', '==', 'admin'));
      const unsub = onSnapshot(q, 
        (snapshot) => {
          if (isMounted) {
            setAdmins(snapshot.docs.map(doc => ({
              uid: doc.id,
              displayName: doc.data().displayName || doc.data().firstName || doc.id
            })));
          }
        },
        (error) => {
          console.error('Error in useAdminList:', error);
          // Don't crash on network errors
          if (error.code !== 'unavailable' && error.code !== 'deadline-exceeded') {
            console.error('Critical error in admin list listener:', error);
          }
        }
      );
      
      return () => {
        isMounted = false;
        unsub();
      };
    } catch (error) {
      console.error('Error setting up admin list listener:', error);
      return () => {};
    }
  }, []);

  return admins;
}
