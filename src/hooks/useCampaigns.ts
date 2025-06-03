
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
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Campaign } from '@/types';

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    console.log('useCampaigns effect triggered, user:', user?.uid);
    
    if (!user) {
      console.log('No user, clearing campaigns');
      setCampaigns([]);
      setLoading(false);
      return;
    }

    const campaignsRef = collection(db, 'campaigns');
    // Requête temporaire sans orderBy pour éviter l'erreur d'index
    const q = query(
      campaignsRef, 
      where('userId', '==', user.uid)
    );

    console.log('Setting up Firestore listener for user:', user.uid);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Firestore snapshot received, docs count:', snapshot.docs.length);
      
      const campaignsData = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Campaign doc data:', data);
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        };
      }) as Campaign[];
      
      // Tri côté client en attendant l'index Firestore
      campaignsData.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
      
      console.log('Processed campaigns data:', campaignsData);
      setCampaigns(campaignsData);
      setLoading(false);
    }, (error) => {
      console.error('Firestore listener error:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const createCampaign = async (campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) throw new Error('User not authenticated');
    
    const newCampaign = {
      ...campaignData,
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('Creating campaign:', newCampaign);
    const docRef = await addDoc(collection(db, 'campaigns'), newCampaign);
    console.log('Campaign created with ID:', docRef.id);
    return docRef.id;
  };

  const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
    const campaignRef = doc(db, 'campaigns', id);
    await updateDoc(campaignRef, {
      ...updates,
      updatedAt: new Date(),
    });
  };

  const deleteCampaign = async (id: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('🗑️ Début suppression campagne:', id);
    console.log('🗑️ User connecté:', user.uid);
    
    try {
      // 1. Supprimer tous les affiliés de cette campagne
      console.log('🗑️ Suppression des affiliés...');
      const affiliatesQuery = query(
        collection(db, 'affiliates'),
        where('campaignId', '==', id),
        where('userId', '==', user.uid) // Ajout de l'userId pour respecter les règles
      );
      const affiliatesSnapshot = await getDocs(affiliatesQuery);
      console.log('🗑️ Affiliés trouvés:', affiliatesSnapshot.size);
      
      const deleteAffiliatesPromises = affiliatesSnapshot.docs.map(doc => {
        console.log('🗑️ Suppression affilié:', doc.id);
        return deleteDoc(doc.ref);
      });
      await Promise.all(deleteAffiliatesPromises);
      console.log('✅ Affiliés supprimés avec succès');

      // 2. Supprimer tous les clics de cette campagne
      console.log('🗑️ Suppression des clics...');
      const clicksQuery = query(
        collection(db, 'clicks'),
        where('campaignId', '==', id)
      );
      const clicksSnapshot = await getDocs(clicksQuery);
      console.log('🗑️ Clics trouvés:', clicksSnapshot.size);
      
      const deleteClicksPromises = clicksSnapshot.docs.map(doc => {
        console.log('🗑️ Suppression clic:', doc.id);
        return deleteDoc(doc.ref);
      });
      await Promise.all(deleteClicksPromises);
      console.log('✅ Clics supprimés avec succès');

      // 3. Supprimer tous les liens courts de cette campagne
      console.log('🗑️ Suppression des liens courts...');
      const shortLinksQuery = query(
        collection(db, 'shortLinks'),
        where('campaignId', '==', id)
      );
      const shortLinksSnapshot = await getDocs(shortLinksQuery);
      console.log('🗑️ Liens courts trouvés:', shortLinksSnapshot.size);
      
      const deleteShortLinksPromises = shortLinksSnapshot.docs.map(doc => {
        console.log('🗑️ Suppression lien court:', doc.id);
        return deleteDoc(doc.ref);
      });
      await Promise.all(deleteShortLinksPromises);
      console.log('✅ Liens courts supprimés avec succès');

      // 4. Supprimer toutes les conversions de cette campagne
      console.log('🗑️ Suppression des conversions...');
      const conversionsQuery = query(
        collection(db, 'conversions'),
        where('campaignId', '==', id)
      );
      const conversionsSnapshot = await getDocs(conversionsQuery);
      console.log('🗑️ Conversions trouvées:', conversionsSnapshot.size);
      
      const deleteConversionsPromises = conversionsSnapshot.docs.map(doc => {
        console.log('🗑️ Suppression conversion:', doc.id);
        return deleteDoc(doc.ref);
      });
      await Promise.all(deleteConversionsPromises);
      console.log('✅ Conversions supprimées avec succès');

      // 5. Finalement, supprimer la campagne elle-même
      console.log('🗑️ Suppression de la campagne...');
      const campaignRef = doc(db, 'campaigns', id);
      await deleteDoc(campaignRef);
      
      console.log('✅ Suppression complète terminée pour la campagne:', id);
      
    } catch (error) {
      console.error('❌ Erreur lors de la suppression en cascade:', error);
      console.error('❌ Détails de l\'erreur:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      throw error;
    }
  };

  return {
    campaigns,
    loading,
    createCampaign,
    updateCampaign,
    deleteCampaign,
  };
};
