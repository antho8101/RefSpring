
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { calculateDailyStats, calculateAffiliatePerformance, calculateGlobalMetrics } from '@/utils/statsCalculator';

interface AdvancedStatsData {
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalCommissions: number;
  netRevenue: number;
  conversionRate: number;
  averageCPA: number;
  averageROAS: number;
  dailyStats: any[];
  topAffiliates: any[];
}

export const useAdvancedStats = (campaignId: string | undefined, filterDate: Date | null = null) => {
  const [stats, setStats] = useState<AdvancedStatsData>({
    totalClicks: 0,
    totalConversions: 0,
    totalRevenue: 0,
    totalCommissions: 0,
    netRevenue: 0,
    conversionRate: 0,
    averageCPA: 0,
    averageROAS: 0,
    dailyStats: [],
    topAffiliates: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!campaignId) {
      console.log('📊 ADVANCED STATS - Pas de campaignId fourni');
      return;
    }

    const loadAdvancedStats = async () => {
      setLoading(true);
      
      try {
        const periodLabel = filterDate ? 'MOIS EN COURS' : 'DEPUIS LE DÉBUT';
        console.log(`📊 ADVANCED STATS - Chargement ${periodLabel} pour campagne:`, campaignId);
        
        // Requêtes parallèles pour toutes les données
        const [affiliatesSnapshot, clicksSnapshot, conversionsSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'affiliates'), where('campaignId', '==', campaignId))),
          getDocs(query(collection(db, 'clicks'), where('campaignId', '==', campaignId))),
          getDocs(query(collection(db, 'conversions'), where('campaignId', '==', campaignId)))
        ]);

        const affiliates = affiliatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const clicks = clicksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const conversions = conversionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Calculs avec filtrage par période
        const globalMetrics = calculateGlobalMetrics(clicks, conversions, filterDate);
        const dailyStats = calculateDailyStats(clicks, conversions, filterDate);
        const topAffiliates = calculateAffiliatePerformance(affiliates, clicks, conversions, filterDate);

        console.log(`📊 ADVANCED STATS - Stats calculées ${periodLabel}:`, {
          ...globalMetrics,
          dailyStats: dailyStats.length,
          topAffiliates: topAffiliates.length
        });

        setStats({
          ...globalMetrics,
          dailyStats,
          topAffiliates,
        });
      } catch (error) {
        console.error('❌ ADVANCED STATS - Erreur lors du chargement des stats:', error);
        setStats({
          totalClicks: 0,
          totalConversions: 0,
          totalRevenue: 0,
          totalCommissions: 0,
          netRevenue: 0,
          conversionRate: 0,
          averageCPA: 0,
          averageROAS: 0,
          dailyStats: [],
          topAffiliates: [],
        });
      }
      
      setLoading(false);
    };

    loadAdvancedStats();
  }, [campaignId, filterDate]);

  return { stats, loading };
};
