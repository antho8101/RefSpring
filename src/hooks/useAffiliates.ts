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
    console.log('🔄 useAffiliates effect triggered');
    console.log('👤 User:', user?.uid);
    console.log('📋 CampaignId:', campaignId);
    
    if (!user) {
      console.log('❌ No user, clearing affiliates');
      setAffiliates([]);
      setLoading(false);
      return;
    }

    const affiliatesRef = collection(db, 'affiliates');
    let q;
    
    if (campaignId) {
      console.log('🎯 Querying affiliates for specific campaign:', campaignId);
      q = query(
        affiliatesRef, 
        where('campaignId', '==', campaignId), 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
    } else {
      console.log('🎯 Querying all affiliates for user:', user.uid);
      q = query(
        affiliatesRef, 
        where('userId', '==', user.uid), 
        orderBy('createdAt', 'desc')
      );
    }

    console.log('🔗 Setting up Firestore listener...');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('📊 Firestore snapshot received');
      console.log('📄 Documents count:', snapshot.docs.length);
      
      const affiliatesData = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📋 Affiliate doc:', { id: doc.id, data });
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
        };
      }) as Affiliate[];
      
      console.log('✅ Processed affiliates:', affiliatesData);
      setAffiliates(affiliatesData);
      setLoading(false);
    }, (error) => {
      console.error('❌ Firestore listener error:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
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
