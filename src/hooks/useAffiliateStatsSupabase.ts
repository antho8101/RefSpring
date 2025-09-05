import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface AffiliateStats {
  id: string;
  name: string;
  email: string;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalCommissions: number;
  conversionRate: number;
  averageOrderValue: number;
  lastActivity: Date | null;
  isActive: boolean;
}

export const useAffiliateStatsSupabase = (campaignId?: string) => {
  const [affiliateStats, setAffiliateStats] = useState<AffiliateStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    loadAffiliateStats();
  }, [user, campaignId]);

  const loadAffiliateStats = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 SUPABASE: Chargement des stats affiliés pour:', user?.uid, 'campagne:', campaignId);

      // Construire la requête pour les affiliés
      let affiliatesQuery = supabase
        .from('affiliates')
        .select(`
          id,
          name,
          email,
          is_active,
          created_at,
          campaign_id,
          campaigns!inner(user_id)
        `)
        .eq('campaigns.user_id', user!.uid);

      if (campaignId) {
        affiliatesQuery = affiliatesQuery.eq('campaign_id', campaignId);
      }

      const { data: affiliates, error: affiliatesError } = await affiliatesQuery;
      if (affiliatesError) throw affiliatesError;

      if (!affiliates || affiliates.length === 0) {
        setAffiliateStats([]);
        setLoading(false);
        return;
      }

      const affiliateIds = affiliates.map(a => a.id);

      // Charger les clics pour ces affiliés
      const { data: clicks, error: clicksError } = await supabase
        .from('clicks')
        .select('id, affiliate_id, created_at')
        .in('affiliate_id', affiliateIds);

      if (clicksError) throw clicksError;

      // Charger les conversions pour ces affiliés
      const { data: conversions, error: conversionsError } = await supabase
        .from('conversions')
        .select('id, affiliate_id, amount, commission, created_at')
        .in('affiliate_id', affiliateIds);

      if (conversionsError) throw conversionsError;

      // Calculer les stats pour chaque affilié
      const stats: AffiliateStats[] = affiliates.map(affiliate => {
        const affiliateClicks = clicks?.filter(c => c.affiliate_id === affiliate.id) || [];
        const affiliateConversions = conversions?.filter(c => c.affiliate_id === affiliate.id) || [];

        const totalClicks = affiliateClicks.length;
        const totalConversions = affiliateConversions.length;
        const totalRevenue = affiliateConversions.reduce((sum, conv) => sum + (Number(conv.amount) || 0), 0);
        const totalCommissions = affiliateConversions.reduce((sum, conv) => sum + (Number(conv.commission) || 0), 0);
        const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
        const averageOrderValue = totalConversions > 0 ? totalRevenue / totalConversions : 0;

        // Dernière activité (dernier clic ou conversion)
        const lastClickDate = affiliateClicks.length > 0 
          ? new Date(Math.max(...affiliateClicks.map(c => new Date(c.created_at).getTime())))
          : null;
        const lastConversionDate = affiliateConversions.length > 0
          ? new Date(Math.max(...affiliateConversions.map(c => new Date(c.created_at).getTime())))
          : null;

        let lastActivity: Date | null = null;
        if (lastClickDate && lastConversionDate) {
          lastActivity = lastClickDate > lastConversionDate ? lastClickDate : lastConversionDate;
        } else if (lastClickDate) {
          lastActivity = lastClickDate;
        } else if (lastConversionDate) {
          lastActivity = lastConversionDate;
        }

        return {
          id: affiliate.id,
          name: affiliate.name,
          email: affiliate.email,
          totalClicks,
          totalConversions,
          totalRevenue,
          totalCommissions,
          conversionRate,
          averageOrderValue,
          lastActivity,
          isActive: affiliate.is_active
        };
      });

      // Trier par revenus décroissants
      stats.sort((a, b) => b.totalRevenue - a.totalRevenue);

      setAffiliateStats(stats);

    } catch (error) {
      console.error('❌ Erreur chargement stats affiliés:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return {
    affiliateStats,
    loading,
    error,
    refresh: loadAffiliateStats
  };
};