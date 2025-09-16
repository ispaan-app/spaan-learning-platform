import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export function useAdminList() {
  const [admins, setAdmins] = useState<{ uid: string; displayName: string }[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'admin'));
    const unsub = onSnapshot(q, (snapshot) => {
      setAdmins(snapshot.docs.map(doc => ({
        uid: doc.id,
        displayName: doc.data().displayName || doc.data().firstName || doc.id
      })));
    });
    return () => unsub();
  }, []);

  return admins;
}
