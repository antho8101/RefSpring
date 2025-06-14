
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

          console.log('🎯 RAW Campaign data:', {
            id: campaign.id,
            name: campaign.name,
            isDraft: campaign.isDraft,
            paymentConfigured: campaign.paymentConfigured,
            stripePaymentMethodId: campaign.stripePaymentMethodId,
            isActive: campaign.isActive,
            userId: campaign.userId
          });

          return campaign;
        });

        // Trier localement par date de création (le plus récent en premier)
        const sortedCampaigns = campaignData.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        console.log('🎯 AVANT FILTRAGE - Total campaigns:', sortedCampaigns.length);
        
        // DÉBOGAGE : Afficher TOUTES les campagnes avant filtrage
        sortedCampaigns.forEach((campaign, index) => {
          console.log(`🎯 Campaign ${index + 1}:`, {
            id: campaign.id,
            name: campaign.name,
            isDraft: campaign.isDraft,
            paymentConfigured: campaign.paymentConfigured,
            hasStripePaymentMethod: Boolean(campaign.stripePaymentMethodId),
            isActive: campaign.isActive,
            willBeVisible: !campaign.isDraft && campaign.paymentConfigured
          });
        });

        // CORRECTION TEMPORAIRE : Afficher TOUTES les campagnes pour diagnostic
        // Au lieu de filtrer, on affiche tout pour voir ce qui se passe
        const visibleCampaigns = sortedCampaigns; // Pas de filtre temporairement

        console.log('🎯 APRÈS FILTRAGE - Campagnes visibles:', visibleCampaigns.length);
        console.log('🎯 Campagnes finales à afficher:', visibleCampaigns.map(c => ({
          id: c.id,
          name: c.name,
          isDraft: c.isDraft,
          paymentConfigured: c.paymentConfigured
        })));

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
