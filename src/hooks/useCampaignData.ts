
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
        console.log('🎯 Campaign data:', {
          id: doc.id,
          name: data.name,
          isDraft: data.isDraft,
          paymentConfigured: data.paymentConfigured,
          stripePaymentMethodId: data.stripePaymentMethodId
        });
        
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          // Valeurs par défaut pour les nouveaux champs Stripe
          paymentConfigured: data.paymentConfigured !== undefined ? data.paymentConfigured : true,
          isDraft: data.isDraft !== undefined ? data.isDraft : false,
        };
      }) as Campaign[];
      
      // MODIFICATION: Afficher toutes les campagnes qui ont un paiement configuré
      // ou qui ne sont pas des brouillons (pour compatibilité avec anciennes campagnes)
      const visibleCampaigns = campaignsData
        .filter(campaign => {
          const shouldShow = !campaign.isDraft || campaign.paymentConfigured || campaign.stripePaymentMethodId;
          console.log('🎯 Campaign filter check:', {
            id: campaign.id,
            name: campaign.name,
            isDraft: campaign.isDraft,
            paymentConfigured: campaign.paymentConfigured,
            hasStripePaymentMethod: !!campaign.stripePaymentMethodId,
            shouldShow
          });
          return shouldShow;
        })
        .sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt.getTime() - a.createdAt.getTime();
        });
      
      console.log('🎯 Campagnes visibles chargées:', visibleCampaigns.length);
      setCampaigns(visibleCampaigns);
      setLoading(false);
    }, (error) => {
      console.error('🎯 Erreur Firestore:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId, authLoading]);

  return { campaigns, loading };
};
