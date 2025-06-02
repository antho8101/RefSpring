
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
  orderBy,
  getDocs
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
    // Maintenant que l'index est créé, on peut utiliser orderBy
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
      
      // Plus besoin de tri côté client maintenant que l'index est en place
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
    console.log('🗑️ Début suppression affilié:', id);
    
    try {
      // 1. Supprimer tous les clics de cet affilié
      console.log('🗑️ Suppression des clics de l\'affilié...');
      const clicksQuery = query(
        collection(db, 'clicks'),
        where('affiliateId', '==', id)
      );
      const clicksSnapshot = await getDocs(clicksQuery);
      console.log('🗑️ Clics trouvés pour l\'affilié:', clicksSnapshot.size);
      
      const deleteClicksPromises = clicksSnapshot.docs.map(doc => {
        console.log('🗑️ Suppression clic affilié:', doc.id);
        return deleteDoc(doc.ref);
      });
      await Promise.all(deleteClicksPromises);

      // 2. Supprimer tous les liens courts de cet affilié
      console.log('🗑️ Suppression des liens courts de l\'affilié...');
      const shortLinksQuery = query(
        collection(db, 'shortLinks'),
        where('affiliateId', '==', id)
      );
      const shortLinksSnapshot = await getDocs(shortLinksQuery);
      console.log('🗑️ Liens courts trouvés pour l\'affilié:', shortLinksSnapshot.size);
      
      const deleteShortLinksPromises = shortLinksSnapshot.docs.map(doc => {
        console.log('🗑️ Suppression lien court affilié:', doc.id);
        return deleteDoc(doc.ref);
      });
      await Promise.all(deleteShortLinksPromises);

      // 3. Supprimer toutes les conversions de cet affilié
      console.log('🗑️ Suppression des conversions de l\'affilié...');
      const conversionsQuery = query(
        collection(db, 'conversions'),
        where('affiliateId', '==', id)
      );
      const conversionsSnapshot = await getDocs(conversionsQuery);
      console.log('🗑️ Conversions trouvées pour l\'affilié:', conversionsSnapshot.size);
      
      const deleteConversionsPromises = conversionsSnapshot.docs.map(doc => {
        console.log('🗑️ Suppression conversion affilié:', doc.id);
        return deleteDoc(doc.ref);
      });
      await Promise.all(deleteConversionsPromises);

      // 4. Finalement, supprimer l'affilié lui-même
      console.log('🗑️ Suppression de l\'affilié...');
      const affiliateRef = doc(db, 'affiliates', id);
      await deleteDoc(affiliateRef);
      
      console.log('✅ Suppression complète terminée pour l\'affilié:', id);
      
    } catch (error) {
      console.error('❌ Erreur lors de la suppression en cascade de l\'affilié:', error);
      throw error;
    }
  };

  return {
    affiliates,
    loading,
    createAffiliate,
    updateAffiliate,
    deleteAffiliate,
  };
};
