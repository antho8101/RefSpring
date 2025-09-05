import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useToast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  target_url: string;
  is_active: boolean;
  is_draft: boolean;
  payment_configured: boolean;
  default_commission_rate: number;
  stripe_customer_id?: string;
  stripe_setup_intent_id?: string;
  stripe_payment_method_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useCampaignsSupabase = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { requireAuthentication } = useAuthGuard();
  const { toast } = useToast();

  // Load campaigns from Supabase
  useEffect(() => {
    console.log('🎯 useCampaignsSupabase - Effect triggered');
    console.log('🎯 authLoading:', authLoading, 'user:', !!user);

    if (authLoading) {
      console.log('🎯 Auth en cours de chargement...');
      return;
    }

    if (!user) {
      console.log('🎯 Pas d\'utilisateur connecté');
      setCampaigns([]);
      setLoading(false);
      return;
    }

    loadCampaigns();
  }, [user, authLoading]);

  const loadCampaigns = async () => {
    try {
      console.log('🎯 SUPABASE - Chargement campagnes pour user:', user?.id);
      
      const { data: campaignsData, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ SUPABASE - Erreur chargement campagnes:', error);
        throw error;
      }

      console.log('🎯 SUPABASE - Campagnes trouvées:', campaignsData?.length || 0);
      
      // Afficher toutes les campagnes (pas seulement celles avec une méthode de paiement)
      const visibleCampaigns = campaignsData || [];

      console.log('🎯 SUPABASE - Campagnes visibles:', visibleCampaigns.length);
      setCampaigns(visibleCampaigns);
      setLoading(false);

    } catch (error) {
      console.error('❌ SUPABASE - Erreur:', error);
      setCampaigns([]);
      setLoading(false);
    }
  };

  const createCampaign = async (campaignData: Omit<Campaign, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (authLoading) {
      throw new Error('Authentification en cours, veuillez patienter...');
    }

    if (!requireAuthentication('créer une campagne')) {
      return;
    }

    try {
      console.log('🎯 SUPABASE - Création campagne directe');

      // Créer directement la campagne dans Supabase (version simplifiée)
      const { data: newCampaign, error } = await supabase
        .from('campaigns')
        .insert({
          name: campaignData.name,
          description: campaignData.description || '',
          target_url: campaignData.target_url,
          is_active: campaignData.is_active !== undefined ? campaignData.is_active : true,
          user_id: user!.id,
          is_draft: false, // Directement active
          payment_configured: true, // Simplifié
          default_commission_rate: campaignData.default_commission_rate || 0.10
        })
        .select()
        .single();

      if (error) {
        console.error('❌ SUPABASE - Erreur création campagne:', error);
        throw error;
      }

      console.log('✅ SUPABASE - Campagne créée:', newCampaign.id);
      
      // Reload campaigns
      await loadCampaigns();
      
      toast({
        title: "Campagne créée",
        description: `La campagne "${newCampaign.name}" a été créée avec succès.`,
      });

      return newCampaign;

    } catch (error) {
      console.error('❌ SUPABASE - Erreur création campagne:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création';
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    }
  };

  const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
    if (authLoading) {
      throw new Error('Authentification en cours, veuillez patienter...');
    }

    if (!requireAuthentication('modifier une campagne')) {
      return;
    }

    try {
      console.log('🎯 SUPABASE - Mise à jour campagne:', id);

      const { data: updatedCampaign, error } = await supabase
        .from('campaigns')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user!.id)
        .select()
        .single();

      if (error) {
        console.error('❌ SUPABASE - Erreur mise à jour:', error);
        throw error;
      }

      console.log('✅ SUPABASE - Campagne mise à jour:', updatedCampaign.id);
      
      // Reload campaigns
      await loadCampaigns();
      
      toast({
        title: "Campagne mise à jour",
        description: "Les modifications ont été sauvegardées.",
      });

      return updatedCampaign;

    } catch (error) {
      console.error('❌ SUPABASE - Erreur mise à jour campagne:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour de la campagne.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const finalizeCampaign = async (id: string, stripeData: { customerId: string; setupIntentId: string; paymentMethodId?: string }) => {
    if (authLoading) {
      throw new Error('Authentification en cours, veuillez patienter...');
    }

    if (!requireAuthentication('finaliser une campagne')) {
      return;
    }

    try {
      console.log('🎯 SUPABASE - Finalisation campagne:', id);

      const { data: finalizedCampaign, error } = await supabase
        .from('campaigns')
        .update({
          is_draft: false,
          payment_configured: true,
          stripe_customer_id: stripeData.customerId,
          stripe_setup_intent_id: stripeData.setupIntentId,
          stripe_payment_method_id: stripeData.paymentMethodId,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user!.id)
        .select()
        .single();

      if (error) {
        console.error('❌ SUPABASE - Erreur finalisation:', error);
        throw error;
      }

      console.log('✅ SUPABASE - Campagne finalisée:', finalizedCampaign.id);
      
      // Reload campaigns
      await loadCampaigns();
      
      toast({
        title: "Campagne activée",
        description: `La campagne "${finalizedCampaign.name}" est maintenant active.`,
      });

      return finalizedCampaign;

    } catch (error) {
      console.error('❌ SUPABASE - Erreur finalisation campagne:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la finalisation de la campagne.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteCampaign = async (id: string) => {
    if (authLoading) {
      throw new Error('Authentification en cours, veuillez patienter...');
    }

    if (!requireAuthentication('supprimer une campagne')) {
      return;
    }

    try {
      console.log('🎯 SUPABASE - Suppression campagne:', id);

      // Note: The database handles cascade deletion via foreign keys
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id);

      if (error) {
        console.error('❌ SUPABASE - Erreur suppression:', error);
        throw error;
      }

      console.log('✅ SUPABASE - Campagne supprimée:', id);
      
      // Reload campaigns
      await loadCampaigns();
      
      toast({
        title: "Campagne supprimée",
        description: "La campagne a été supprimée avec succès.",
      });

    } catch (error) {
      console.error('❌ SUPABASE - Erreur suppression campagne:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression de la campagne.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Convert to legacy format for compatibility
  const legacyCampaigns = campaigns.map(campaign => ({
    id: campaign.id,
    name: campaign.name,
    description: campaign.description,
    targetUrl: campaign.target_url,
    isActive: campaign.is_active,
    isDraft: campaign.is_draft,
    paymentConfigured: campaign.payment_configured,
    defaultCommissionRate: campaign.default_commission_rate,
    stripeCustomerId: campaign.stripe_customer_id,
    stripeSetupIntentId: campaign.stripe_setup_intent_id,
    stripePaymentMethodId: campaign.stripe_payment_method_id,
    userId: campaign.user_id,
    createdAt: new Date(campaign.created_at),
    updatedAt: new Date(campaign.updated_at),
  }));

  return {
    campaigns: legacyCampaigns,
    loading,
    createCampaign,
    updateCampaign,
    finalizeCampaign,
    deleteCampaign,
    refreshCampaigns: loadCampaigns,
  };
};