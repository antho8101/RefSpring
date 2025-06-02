
import { useEffect, useState } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  doc,
  orderBy 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Affiliate } from '@/types';

export const useAffiliates = (campaignId?: string) => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setAffiliates([]);
      setLoading(false);
      return;
    }

    const affiliatesRef = collection(db, 'affiliates');
    let q = query(affiliatesRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    
    if (campaignId) {
      q = query(affiliatesRef, where('campaignId', '==', campaignId), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const affiliatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Affiliate[];
      
      setAffiliates(affiliatesData);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, campaignId]);

  const generateTrackingCode = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const createAffiliate = async (affiliateData: Omit<Affiliate, 'id' | 'createdAt' | 'userId' | 'trackingCode'>) => {
    if (!user) throw new Error('User not authenticated');
    
    const newAffiliate = {
      ...affiliateData,
      userId: user.uid,
      trackingCode: generateTrackingCode(),
      createdAt: new Date(),
    };

    const docRef = await addDoc(collection(db, 'affiliates'), newAffiliate);
    return docRef.id;
  };

  const updateAffiliate = async (id: string, updates: Partial<Affiliate>) => {
    const affiliateRef = doc(db, 'affiliates', id);
    await updateDoc(affiliateRef, updates);
  };

  const deleteAffiliate = async (id: string) => {
    const affiliateRef = doc(db, 'affiliates', id);
    await deleteDoc(affiliateRef);
  };

  return {
    affiliates,
    loading,
    createAffiliate,
    updateAffiliate,
    deleteAffiliate,
  };
};
