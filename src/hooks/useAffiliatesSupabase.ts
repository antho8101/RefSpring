import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useToast } from '@/hooks/use-toast';

interface Affiliate {
  id: string;
  name: string;
  email: string;
  campaign_id: string;
  commission_rate: number;
  tracking_code: string;
  is_active: boolean;
  stripe_account_id?: string;
  stripe_account_status?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useAffiliatesSupabase = (campaignId?: string) => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { requireAuthentication } = useAuthGuard();
  const { toast } = useToast();

  useEffect(() => {
    console.log('👥 useAffiliatesSupabase - Effect triggered');
    console.log('👥 authLoading:', authLoading, 'user:', !!user, 'campaignId:', campaignId);
    
    if (authLoading) {
      console.log('👥 Auth encore en cours, pas de requête Supabase');
      return;
    }
    
    if (!user) {
      console.log('👥 SUPABASE - No user, clearing affiliates');
      setAffiliates([]);
      setLoading(false);
      return;
    }

    loadAffiliates();
  }, [user, authLoading, campaignId]);

  const loadAffiliates = async () => {
    try {
      console.log('👥 SUPABASE - Chargement affiliés pour user:', user?.id);

      // Use the manage-affiliates Edge Function to get affiliates
      const { data: result, error } = await supabase.functions.invoke('manage-affiliates', {
        method: 'GET'
      });

      if (error) {
        console.error('❌ SUPABASE - Erreur chargement affiliés:', error);
        throw error;
      }

      let affiliatesData = result?.affiliates || [];

      // Filter by campaign if specified
      if (campaignId) {
        affiliatesData = affiliatesData.filter((affiliate: Affiliate) => 
          affiliate.campaign_id === campaignId
        );
      }

      console.log('👥 SUPABASE - Affiliés chargés:', affiliatesData.length);
      setAffiliates(affiliatesData);
      setLoading(false);

    } catch (error) {
      console.error('❌ SUPABASE - Erreur chargement affiliés:', error);
      setAffiliates([]);
      setLoading(false);
    }
  };

  const createAffiliate = async (affiliateData: {
    name: string;
    email: string;
    campaignId: string;
    commissionRate?: number;
  }) => {
    if (!requireAuthentication('créer un affilié')) {
      return;
    }

    try {
      console.log('👥 SUPABASE - Création affilié');

      const { data: result, error } = await supabase.functions.invoke('manage-affiliates', {
        body: {
          name: affiliateData.name,
          email: affiliateData.email,
          campaignId: affiliateData.campaignId,
          commissionRate: affiliateData.commissionRate || 10.00,
        }
      });

      if (error) {
        console.error('❌ SUPABASE - Erreur création affilié:', error);
        throw new Error(error.message || 'Erreur lors de la création de l\'affilié');
      }

      console.log('✅ SUPABASE - Affilié créé:', result.affiliate.id);
      
      // Reload affiliates
      await loadAffiliates();
      
      toast({
        title: "Affilié créé",
        description: `L'affilié "${result.affiliate.name}" a été créé avec succès.`,
      });

      return result.affiliate;

    } catch (error) {
      console.error('❌ SUPABASE - Erreur création affilié:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création';
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    }
  };

  const updateAffiliate = async (id: string, updates: {
    name?: string;
    email?: string;
    commissionRate?: number;
    isActive?: boolean;
  }) => {
    if (!requireAuthentication('modifier un affilié')) {
      return;
    }

    try {
      console.log('👥 SUPABASE - Mise à jour affilié:', id);

      const { data: result, error } = await supabase.functions.invoke('manage-affiliates', {
        method: 'PUT',
        body: {
          id,
          ...updates,
        }
      });

      if (error) {
        console.error('❌ SUPABASE - Erreur mise à jour affilié:', error);
        throw new Error(error.message || 'Erreur lors de la mise à jour');
      }

      console.log('✅ SUPABASE - Affilié mis à jour:', result.affiliate.id);
      
      // Reload affiliates
      await loadAffiliates();
      
      toast({
        title: "Affilié mis à jour",
        description: "Les modifications ont été sauvegardées.",
      });

      return result.affiliate;

    } catch (error) {
      console.error('❌ SUPABASE - Erreur mise à jour affilié:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour';
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    }
  };

  const deleteAffiliate = async (id: string) => {
    if (!requireAuthentication('supprimer un affilié')) {
      return;
    }

    try {
      console.log('👥 SUPABASE - Suppression affilié:', id);

      const { error } = await supabase.functions.invoke('manage-affiliates', {
        method: 'DELETE',
        body: null,
        // Pass ID as query parameter
      });

      // Alternative: Use direct Supabase delete since cascade is handled by DB
      const { error: deleteError } = await supabase
        .from('affiliates')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id);

      if (deleteError) {
        console.error('❌ SUPABASE - Erreur suppression affilié:', deleteError);
        throw deleteError;
      }

      console.log('✅ SUPABASE - Affilié supprimé:', id);
      
      // Reload affiliates
      await loadAffiliates();
      
      toast({
        title: "Affilié supprimé",
        description: "L'affilié a été supprimé avec succès.",
      });

    } catch (error) {
      console.error('❌ SUPABASE - Erreur suppression affilié:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression';
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    }
  };

  // Convert to legacy format for compatibility
  const legacyAffiliates = affiliates.map(affiliate => ({
    id: affiliate.id,
    name: affiliate.name,
    email: affiliate.email,
    campaignId: affiliate.campaign_id,
    commissionRate: affiliate.commission_rate,
    trackingCode: affiliate.tracking_code,
    isActive: affiliate.is_active,
    stripeAccountId: affiliate.stripe_account_id || '',
    stripeAccountStatus: (affiliate.stripe_account_status as "verified" | "pending" | "incomplete") || 'pending',
    userId: affiliate.user_id,
    createdAt: new Date(affiliate.created_at),
    updatedAt: new Date(affiliate.updated_at),
  }));

  return {
    affiliates: legacyAffiliates,
    loading,
    createAffiliate,
    updateAffiliate,
    deleteAffiliate,
    refreshAffiliates: loadAffiliates,
  };
};