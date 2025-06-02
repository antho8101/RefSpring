
import { useEffect, useState } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  doc
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
    const campaignRef = doc(db, 'campaigns', id);
    await deleteDoc(campaignRef);
  };

  return {
    campaigns,
    loading,
    createCampaign,
    updateCampaign,
    deleteCampaign,
  };
};
