
import { useState, useEffect } from 'react';
import { onSnapshot, query, where, collection } from 'firebase/firestore';
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
    
    // Requête simplifiée sans orderBy pour éviter l'erreur d'index
    const q = query(
      collection(db, 'campaigns'),
      where('userId', '==', userId)
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

          console.log('🎯 Campaign data:', {
            id: campaign.id,
            name: campaign.name,
            isDraft: campaign.isDraft,
            paymentConfigured: campaign.paymentConfigured,
            stripePaymentMethodId: campaign.stripePaymentMethodId
          });

          return campaign;
        });

        // Trier localement par date de création (le plus récent en premier)
        const sortedCampaigns = campaignData.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        // Afficher toutes les campagnes actives
        const visibleCampaigns = sortedCampaigns.filter(campaign => {
          console.log('🎯 Campaign filter check:', {
            id: campaign.id,
            name: campaign.name,
            isDraft: campaign.isDraft,
            paymentConfigured: campaign.paymentConfigured,
            hasStripePaymentMethod: Boolean(campaign.stripePaymentMethodId),
            isActive: campaign.isActive !== false
          });

          // Afficher toutes les campagnes actives
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
