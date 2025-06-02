
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  fetchCampaignIds, 
  fetchClicksForCampaigns, 
  fetchConversionsForCampaigns, 
  fetchAffiliatesForCampaigns 
} from '@/utils/campaignDataFetcher';
import { 
  calculateDailyStats, 
  calculateAffiliatePerformance, 
  calculateGlobalMetrics 
} from '@/utils/statsCalculator';

interface DailyStats {
  date: string;
  clicks: number;
  conversions: number;
  revenue: number;
  commissions: number;
}

interface AffiliatePerformance {
  id: string;
  name: string;
  email: string;
  clicks: number;
  conversions: number;
  commissions: number;
  conversionRate: number;
}

interface AdvancedStatsData {
  dailyStats: DailyStats[];
  topAffiliates: AffiliatePerformance[];
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalCommissions: number;
  netRevenue: number;
  conversionRate: number;
  averageCPA: number;
  averageROAS: number;
}

export const useAdvancedStats = (campaignId?: string) => {
  const [stats, setStats] = useState<AdvancedStatsData>({
    dailyStats: [],
    topAffiliates: [],
    totalClicks: 0,
    totalConversions: 0,
    totalRevenue: 0,
    totalCommissions: 0,
    netRevenue: 0,
    conversionRate: 0,
    averageCPA: 0,
    averageROAS: 0,
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      console.log('📊 ADVANCED STATS - Pas d\'utilisateur connecté');
      return;
    }

    const loadAdvancedStats = async () => {
      setLoading(true);
      
      try {
        console.log('📊 ADVANCED STATS - Chargement des stats avancées pour user:', user.uid, 'campaignId:', campaignId);
        
        // Récupérer les IDs des campagnes
        const campaignIds = await fetchCampaignIds(user.uid, campaignId);

        if (campaignIds.length === 0) {
          console.log('📊 Aucune campagne trouvée');
          setLoading(false);
          return;
        }

        // Récupérer toutes les données en parallèle
        const [allClicks, allConversions, allAffiliates] = await Promise.all([
          fetchClicksForCampaigns(campaignIds),
          fetchConversionsForCampaigns(campaignIds),
          fetchAffiliatesForCampaigns(campaignIds)
        ]);

        console.log('📊 TOTAUX:', { 
          clicks: allClicks.length, 
          conversions: allConversions.length, 
          affiliates: allAffiliates.length 
        });

        // Calculer les statistiques
        const dailyStats = calculateDailyStats(allClicks, allConversions);
        const affiliatePerformance = calculateAffiliatePerformance(allAffiliates, allClicks, allConversions);
        const globalMetrics = calculateGlobalMetrics(allClicks, allConversions);

        setStats({
          dailyStats,
          topAffiliates: affiliatePerformance.slice(0, 10),
          ...globalMetrics,
        });

      } catch (error) {
        console.error('❌ ADVANCED STATS - Erreur:', error);
      }
      
      setLoading(false);
    };

    loadAdvancedStats();
  }, [user, campaignId]);

  return { stats, loading };
};
