
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
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Affiliate } from '@/types';

export const useAffiliates = (campaignId?: string) => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { requireAuthentication, requireOwnership } = useAuthGuard();

  useEffect(() => {
    console.log('👥 useAffiliates - Effect triggered with security checks');
    console.log('👥 authLoading:', authLoading, 'user:', !!user, 'campaignId:', campaignId);
    
    // PROTECTION STRICTE : Aucune requête avant auth complète
    if (authLoading) {
      console.log('👥 Auth encore en cours, pas de requête Firebase');
      return;
    }
    
    if (!user) {
      console.log('👥 SECURITY - No user, clearing affiliates and blocking requests');
      setAffiliates([]);
      setLoading(false);
      return;
    }

    console.log('👥 SECURITY - Auth OK, starting secure Firestore query for user:', user.uid);

    const affiliatesRef = collection(db, 'affiliates');
    let q;
    
    if (campaignId) {
      console.log('👥 SECURITY - Query for specific campaign:', campaignId);
      q = query(
        affiliatesRef, 
        where('campaignId', '==', campaignId), 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
    } else {
      console.log('👥 SECURITY - Query all affiliates for user:', user.uid);
      q = query(
        affiliatesRef, 
        where('userId', '==', user.uid), 
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('👥 SECURITY - Firestore snapshot received, docs:', snapshot.docs.length);
      
      const affiliatesData = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // VÉRIFICATION DE SÉCURITÉ : s'assurer que l'affilié appartient bien à l'utilisateur
        if (data.userId !== user.uid) {
          console.log('👥 SECURITY - Blocking affiliate not owned by user:', doc.id);
          return null;
        }
        
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
        };
      }).filter(Boolean) as Affiliate[];
      
      console.log('👥 SECURITY - Secured affiliates loaded:', affiliatesData.length);
      setAffiliates(affiliatesData);
      setLoading(false);
    }, (error) => {
      console.error('👥 SECURITY - Firestore error:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, authLoading, campaignId]);

  const generateTrackingCode = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const createAffiliate = async (affiliateData: Omit<Affiliate, 'id' | 'createdAt' | 'userId' | 'trackingCode'>) => {
    requireAuthentication('créer un affilié');
    
    console.log('👥 SECURITY - Creating affiliate for authenticated user:', user?.uid);
    
    const newAffiliate = {
      ...affiliateData,
      userId: user!.uid,
      trackingCode: generateTrackingCode(),
      createdAt: new Date(),
    };

    const docRef = await addDoc(collection(db, 'affiliates'), newAffiliate);
    console.log('👥 SECURITY - Affiliate created securely:', docRef.id);
    return docRef.id;
  };

  const updateAffiliate = async (id: string, updates: Partial<Affiliate>) => {
    requireAuthentication('modifier un affilié');
    
    // Vérifier que l'affilié appartient à l'utilisateur
    const affiliate = affiliates.find(a => a.id === id);
    if (affiliate) {
      requireOwnership(affiliate.userId, 'affilié');
    }
    
    console.log('👥 SECURITY - Updating affiliate:', id);
    const affiliateRef = doc(db, 'affiliates', id);
    await updateDoc(affiliateRef, updates);
  };

  const deleteAffiliate = async (id: string) => {
    requireAuthentication('supprimer un affilié');
    
    // Vérifier que l'affilié appartient à l'utilisateur
    const affiliate = affiliates.find(a => a.id === id);
    if (affiliate) {
      requireOwnership(affiliate.userId, 'affilié');
    }
    
    console.log('👥 SECURITY - Starting secure cascade deletion for affiliate:', id);
    
    try {
      // 1. Supprimer tous les clics de cet affilié
      console.log('👥 SECURITY - Deleting affiliate clicks...');
      const clicksQuery = query(
        collection(db, 'clicks'),
        where('affiliateId', '==', id)
      );
      const clicksSnapshot = await getDocs(clicksQuery);
      console.log('👥 SECURITY - Clicks found for affiliate:', clicksSnapshot.size);
      
      const deleteClicksPromises = clicksSnapshot.docs.map(doc => {
        console.log('👥 SECURITY - Deleting affiliate click:', doc.id);
        return deleteDoc(doc.ref);
      });
      await Promise.all(deleteClicksPromises);

      // 2. Supprimer tous les liens courts de cet affilié
      console.log('👥 SECURITY - Deleting affiliate short links...');
      const shortLinksQuery = query(
        collection(db, 'shortLinks'),
        where('affiliateId', '==', id)
      );
      const shortLinksSnapshot = await getDocs(shortLinksQuery);
      console.log('👥 SECURITY - Short links found for affiliate:', shortLinksSnapshot.size);
      
      const deleteShortLinksPromises = shortLinksSnapshot.docs.map(doc => {
        console.log('👥 SECURITY - Deleting affiliate short link:', doc.id);
        return deleteDoc(doc.ref);
      });
      await Promise.all(deleteShortLinksPromises);

      // 3. Supprimer toutes les conversions de cet affilié
      console.log('👥 SECURITY - Deleting affiliate conversions...');
      const conversionsQuery = query(
        collection(db, 'conversions'),
        where('affiliateId', '==', id)
      );
      const conversionsSnapshot = await getDocs(conversionsQuery);
      console.log('👥 SECURITY - Conversions found for affiliate:', conversionsSnapshot.size);
      
      const deleteConversionsPromises = conversionsSnapshot.docs.map(doc => {
        console.log('👥 SECURITY - Deleting affiliate conversion:', doc.id);
        return deleteDoc(doc.ref);
      });
      await Promise.all(deleteConversionsPromises);

      // 4. Finalement, supprimer l'affilié lui-même
      console.log('👥 SECURITY - Deleting affiliate...');
      const affiliateRef = doc(db, 'affiliates', id);
      await deleteDoc(affiliateRef);
      
      console.log('✅ SECURITY - Secure cascade deletion completed for affiliate:', id);
      
    } catch (error) {
      console.error('❌ SECURITY - Error during secure cascade deletion:', error);
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
