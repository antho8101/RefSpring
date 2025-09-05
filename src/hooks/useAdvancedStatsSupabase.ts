import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface AdvancedStatsData {
  totalRevenue: number;
  totalCommissions: number;
  totalClicks: number;
  totalConversions: number;
  averageOrderValue: number;
  conversionRate: number;
  topAffiliates: Array<{
    id: string;
    name: string;
    revenue: number;
    commissions: number;
    clicks: number;
    conversions: number;
  }>;
  revenueByPeriod: Array<{
    period: string;
    revenue: number;
    commissions: number;
  }>;
}

export const useAdvancedStatsSupabase = (startDate?: Date, endDate?: Date) => {
  const [stats, setStats] = useState<AdvancedStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    loadAdvancedStats();
  }, [user, startDate, endDate]);

  const loadAdvancedStats = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 SUPABASE: Chargement des stats avancées pour:', user?.uid);

      // Charger les campagnes de l'utilisateur
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id')
        .eq('user_id', user!.uid);

      if (campaignsError) throw campaignsError;

      if (!campaigns || campaigns.length === 0) {
        setStats({
          totalRevenue: 0,
          totalCommissions: 0,
          totalClicks: 0,
          totalConversions: 0,
          averageOrderValue: 0,
          conversionRate: 0,
          topAffiliates: [],
          revenueByPeriod: []
        });
        setLoading(false);
        return;
      }

      const campaignIds = campaigns.map(c => c.id);

      // Charger les conversions
      let conversionsQuery = supabase
        .from('conversions')
        .select(`
          id,
          amount,
          commission,
          affiliate_id,
          campaign_id,
          created_at,
          affiliates!inner(name)
        `)
        .in('campaign_id', campaignIds);

      if (startDate) {
        conversionsQuery = conversionsQuery.gte('created_at', startDate.toISOString());
      }
      if (endDate) {
        conversionsQuery = conversionsQuery.lte('created_at', endDate.toISOString());
      }

      const { data: conversions, error: conversionsError } = await conversionsQuery;
      if (conversionsError) throw conversionsError;

      // Charger les clics
      let clicksQuery = supabase
        .from('clicks')
        .select('id, affiliate_id, campaign_id, created_at')
        .in('campaign_id', campaignIds);

      if (startDate) {
        clicksQuery = clicksQuery.gte('created_at', startDate.toISOString());
      }
      if (endDate) {
        clicksQuery = clicksQuery.lte('created_at', endDate.toISOString());
      }

      const { data: clicks, error: clicksError } = await clicksQuery;
      if (clicksError) throw clicksError;

      // Calculer les statistiques
      const totalRevenue = conversions?.reduce((sum, conv) => sum + (Number(conv.amount) || 0), 0) || 0;
      const totalCommissions = conversions?.reduce((sum, conv) => sum + (Number(conv.commission) || 0), 0) || 0;
      const totalClicks = clicks?.length || 0;
      const totalConversions = conversions?.length || 0;
      const averageOrderValue = totalConversions > 0 ? totalRevenue / totalConversions : 0;
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

      // Top affiliés
      const affiliateStats = new Map<string, any>();
      
      conversions?.forEach((conv: any) => {
        const affiliateId = conv.affiliate_id;
        if (!affiliateStats.has(affiliateId)) {
          affiliateStats.set(affiliateId, {
            id: affiliateId,
            name: conv.affiliates?.name || 'Unknown',
            revenue: 0,
            commissions: 0,
            clicks: 0,
            conversions: 0
          });
        }
        
        const stats = affiliateStats.get(affiliateId);
        stats.revenue += Number(conv.amount) || 0;
        stats.commissions += Number(conv.commission) || 0;
        stats.conversions += 1;
      });

      clicks?.forEach((click: any) => {
        const affiliateId = click.affiliate_id;
        if (affiliateStats.has(affiliateId)) {
          affiliateStats.get(affiliateId).clicks += 1;
        }
      });

      const topAffiliates = Array.from(affiliateStats.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Revenus par période (groupés par mois)
      const revenueByMonth = new Map<string, { revenue: number; commissions: number }>();
      
      conversions?.forEach((conv: any) => {
        const date = new Date(conv.created_at);
        const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!revenueByMonth.has(period)) {
          revenueByMonth.set(period, { revenue: 0, commissions: 0 });
        }
        
        const monthStats = revenueByMonth.get(period)!;
        monthStats.revenue += Number(conv.amount) || 0;
        monthStats.commissions += Number(conv.commission) || 0;
      });

      const revenueByPeriod = Array.from(revenueByMonth.entries())
        .map(([period, data]) => ({ period, ...data }))
        .sort((a, b) => a.period.localeCompare(b.period));

      setStats({
        totalRevenue,
        totalCommissions,
        totalClicks,
        totalConversions,
        averageOrderValue,
        conversionRate,
        topAffiliates,
        revenueByPeriod
      });

    } catch (error) {
      console.error('❌ Erreur chargement stats avancées:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    error,
    refresh: loadAdvancedStats
  };
};