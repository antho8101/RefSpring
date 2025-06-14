
import { useState, useEffect } from 'react';
import { onSnapshot, query, where, collection, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Campaign } from '@/types';

export const useCampaignData = (userId: string | null, authLoading: boolean) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🎯 useCampaignData - Effect triggered');
    console.log('🎯 authLoading:', authLoading, 'user:', !!userId);

    if (authLoading) {
      console.log('🎯 Auth en cours de chargement...');
      return;
    }

    if (!userId) {
      console.log('🎯 Pas d\'utilisateur connecté');
      setCampaigns([]);
      setLoading(false);
      return;
    }

    console.log('🎯 Auth OK, démarrage requête Firestore pour user:', userId);
    
    const q = query(
      collection(db, 'campaigns'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        console.log('🎯 Firestore snapshot reçu, docs:', snapshot.docs.length);
        
        const campaignData = snapshot.docs.map(doc => {
          const data = doc.data();
          const campaign = {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Campaign;

          // Log des données pour debug
          console.log('🎯 Campaign data:', {
            id: campaign.id,
            name: campaign.name,
            isDraft: campaign.isDraft,
            paymentConfigured: campaign.paymentConfigured,
            stripePaymentMethodId: campaign.stripePaymentMethodId
          });

          return campaign;
        });

        // Filtrer les campagnes - MONTRER TOUTES LES CAMPAGNES (même les drafts)
        const visibleCampaigns = campaignData.filter(campaign => {
          const hasStripePaymentMethod = Boolean(campaign.stripePaymentMethodId);
          
          console.log('🎯 Campaign filter check:', {
            id: campaign.id,
            name: campaign.name,
            isDraft: campaign.isDraft,
            paymentConfigured: campaign.paymentConfigured,
            hasStripePaymentMethod,
            isActive: campaign.isActive !== false
          });

          // Afficher toutes les campagnes actives, peu importe si elles sont en draft ou non
          return campaign.isActive !== false;
        });

        console.log('🎯 Campagnes visibles chargées:', visibleCampaigns.length);
        setCampaigns(visibleCampaigns);
        setLoading(false);
      },
      (error) => {
        console.error('❌ Erreur Firestore:', error);
        setCampaigns([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, authLoading]);

  return { campaigns, loading };
};
