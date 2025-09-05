import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Campaign } from '@/types';

export const useCampaignDataSupabase = (userId: string | null, authLoading: boolean) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🎯 useCampaignDataSupabase - Effect triggered');
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

    console.log('🎯 Auth OK, démarrage requête Supabase pour user:', userId);
    
    const fetchCampaigns = async () => {
      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Erreur Supabase:', error);
          setCampaigns([]);
          setLoading(false);
          return;
        }

        console.log('🎯 Supabase data reçue, campaigns:', data?.length || 0);
        
        const campaignData = (data || []).map(row => {
          const campaign = {
            id: row.id,
            name: row.name,
            description: row.description,
            targetUrl: row.target_url,
            isActive: row.is_active,
            isDraft: row.is_draft,
            paymentConfigured: row.payment_configured,
            defaultCommissionRate: row.default_commission_rate,
            userId: row.user_id,
            stripeCustomerId: row.stripe_customer_id,
            stripePaymentMethodId: row.stripe_payment_method_id,
            stripeSetupIntentId: row.stripe_setup_intent_id,
            trackingScript: row.tracking_script,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
          } as Campaign;

          console.log('🎯 Campaign data:', {
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

        console.log('🎯 AVANT FILTRAGE - Total campaigns:', campaignData.length);
        
        // DÉBOGAGE : Afficher TOUTES les campagnes avant filtrage
        campaignData.forEach((campaign, index) => {
          console.log(`🎯 Campaign ${index + 1}:`, {
            id: campaign.id,
            name: campaign.name,
            isDraft: campaign.isDraft,
            paymentConfigured: campaign.paymentConfigured,
            hasStripePaymentMethod: Boolean(campaign.stripePaymentMethodId),
            isActive: campaign.isActive,
            willBeVisible: Boolean(campaign.stripePaymentMethodId)
          });
        });

        // Afficher les campagnes qui ont une méthode de paiement
        const visibleCampaigns = campaignData.filter(campaign => {
          return Boolean(campaign.stripePaymentMethodId);
        });

        console.log('🎯 APRÈS FILTRAGE - Campagnes visibles:', visibleCampaigns.length);
        console.log('🎯 Campagnes finales à afficher:', visibleCampaigns.map(c => ({
          id: c.id,
          name: c.name,
          isDraft: c.isDraft,
          paymentConfigured: c.paymentConfigured,
          hasStripePaymentMethod: Boolean(c.stripePaymentMethodId)
        })));

        setCampaigns(visibleCampaigns);
        setLoading(false);
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des campagnes:', error);
        setCampaigns([]);
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [userId, authLoading]);

  return { campaigns, loading };
};