
import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Campaign } from '@/types';

export const useCampaignData = (userId: string | null, authLoading: boolean) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🎯 useCampaignData - Effect triggered');
    console.log('🎯 authLoading:', authLoading, 'user:', !!userId);
    
    // PROTECTION STRICTE : Aucune requête avant auth complète
    if (authLoading) {
      console.log('🎯 Auth encore en cours, pas de requête Firebase');
      return;
    }
    
    if (!userId) {
      console.log('🎯 Pas d\'utilisateur, nettoyage des campagnes');
      setCampaigns([]);
      setLoading(false);
      return;
    }

    console.log('🎯 Auth OK, démarrage requête Firestore pour user:', userId);
    
    const campaignsRef = collection(db, 'campaigns');
    const q = query(
      campaignsRef, 
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('🎯 Firestore snapshot reçu, docs:', snapshot.docs.length);
      
      const campaignsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          // Valeurs par défaut pour les nouveaux champs Stripe
          paymentConfigured: data.paymentConfigured || false,
          isDraft: data.isDraft || false,
        };
      }) as Campaign[];
      
      // Tri côté client - Ne montrer que les campagnes finalisées (non-draft)
      const finalizedCampaigns = campaignsData
        .filter(campaign => !campaign.isDraft)
        .sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt.getTime() - a.createdAt.getTime();
        });
      
      console.log('🎯 Campagnes chargées:', finalizedCampaigns.length);
      setCampaigns(finalizedCampaigns);
      setLoading(false);
    }, (error) => {
      console.error('🎯 Erreur Firestore:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId, authLoading]);

  return { campaigns, loading };
};
