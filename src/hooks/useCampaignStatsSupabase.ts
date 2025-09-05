import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface CampaignStatsData {
  campaignId: string;
  campaignName: string;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalCommissions: number;
  conversionRate: number;
  averageOrderValue: number;
  activeAffiliates: number;
  recentActivity: Array<{
    type: 'click' | 'conversion';
    affiliateName: string;
    amount?: number;
    timestamp: Date;
  }>;
}

export const useCampaignStatsSupabase = (campaignId?: string) => {
  const [campaignStats, setCampaignStats] = useState<CampaignStatsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    loadCampaignStats();
  }, [user, campaignId]);

  const loadCampaignStats = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 SUPABASE: Chargement des stats campagnes pour:', user?.uid);

      // Charger les campagnes
      let campaignsQuery = supabase
        .from('campaigns')
        .select('id, name')
        .eq('user_id', user!.uid);

      if (campaignId) {
        campaignsQuery = campaignsQuery.eq('id', campaignId);
      }

      const { data: campaigns, error: campaignsError } = await campaignsQuery;
      if (campaignsError) throw campaignsError;

      if (!campaigns || campaigns.length === 0) {
        setCampaignStats([]);
        setLoading(false);
        return;
      }

      const campaignIds = campaigns.map(c => c.id);

      // Charger les clics
      const { data: clicks, error: clicksError } = await supabase
        .from('clicks')
        .select(`
          id,
          campaign_id,
          affiliate_id,
          created_at,
          affiliates!inner(name)
        `)
        .in('campaign_id', campaignIds);

      if (clicksError) throw clicksError;

      // Charger les conversions
      const { data: conversions, error: conversionsError } = await supabase
        .from('conversions')
        .select(`
          id,
          campaign_id,
          affiliate_id,
          amount,
          commission,
          created_at,
          affiliates!inner(name)
        `)
        .in('campaign_id', campaignIds);

      if (conversionsError) throw conversionsError;

      // Charger les affiliés actifs
      const { data: affiliates, error: affiliatesError } = await supabase
        .from('affiliates')
        .select('id, campaign_id')
        .in('campaign_id', campaignIds)
        .eq('is_active', true);

      if (affiliatesError) throw affiliatesError;

      // Calculer les stats pour chaque campagne
      const stats: CampaignStatsData[] = campaigns.map(campaign => {
        const campaignClicks = clicks?.filter(c => c.campaign_id === campaign.id) || [];
        const campaignConversions = conversions?.filter(c => c.campaign_id === campaign.id) || [];
        const campaignAffiliates = affiliates?.filter(a => a.campaign_id === campaign.id) || [];

        const totalClicks = campaignClicks.length;
        const totalConversions = campaignConversions.length;
        const totalRevenue = campaignConversions.reduce((sum, conv) => sum + (Number(conv.amount) || 0), 0);
        const totalCommissions = campaignConversions.reduce((sum, conv) => sum + (Number(conv.commission) || 0), 0);
        const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
        const averageOrderValue = totalConversions > 0 ? totalRevenue / totalConversions : 0;
        const activeAffiliates = campaignAffiliates.length;

        // Activité récente (10 derniers événements)
        const recentClicks = campaignClicks
          .map(click => ({
            type: 'click' as const,
            affiliateName: (click as any).affiliates?.name || 'Unknown',
            timestamp: new Date(click.created_at)
          }));

        const recentConversions = campaignConversions
          .map(conv => ({
            type: 'conversion' as const,
            affiliateName: (conv as any).affiliates?.name || 'Unknown',
            amount: Number(conv.amount) || 0,
            timestamp: new Date(conv.created_at)
          }));

        const recentActivity = [...recentClicks, ...recentConversions]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 10);

        return {
          campaignId: campaign.id,
          campaignName: campaign.name,
          totalClicks,
          totalConversions,
          totalRevenue,
          totalCommissions,
          conversionRate,
          averageOrderValue,
          activeAffiliates,
          recentActivity
        };
      });

      // Trier par revenus décroissants
      stats.sort((a, b) => b.totalRevenue - a.totalRevenue);

      setCampaignStats(stats);

    } catch (error) {
      console.error('❌ Erreur chargement stats campagnes:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return {
    campaignStats,
    loading,
    error,
    refresh: loadCampaignStats
  };
};