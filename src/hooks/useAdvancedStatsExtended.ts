
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { calculateDailyStats, calculateAffiliatePerformance, calculateGlobalMetrics } from '@/utils/statsCalculator';
import { calculateEvolutionMetrics, calculateTimeAnalysis, calculateBehavioralMetrics } from '@/utils/advancedStatsCalculator';

interface ExtendedAdvancedStatsData {
  // Métriques de base
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
  
  // Nouvelles métriques
  evolution: any;
  timeAnalysis: any;
  behavioralMetrics: any;
}

export const useAdvancedStatsExtended = (campaignId: string | undefined, filterDate: Date | null = null) => {
  const [stats, setStats] = useState<ExtendedAdvancedStatsData>({
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
    evolution: {
      clicks: { label: 'Clics', current: 0, previous: 0, format: 'number' },
      conversions: { label: 'Conversions', current: 0, previous: 0, format: 'number' },
      revenue: { label: 'CA Total', current: 0, previous: 0, format: 'currency' },
      conversionRate: { label: 'Taux Conversion', current: 0, previous: 0, format: 'percentage' }
    },
    timeAnalysis: {
      hourlyData: [],
      dailyData: [],
      bestPerformingHour: '0',
      bestPerformingDay: 'Lun'
    },
    behavioralMetrics: {
      averageOrderValue: 0,
      topPerformingAffiliate: { name: 'Aucun', conversionRate: 0 },
      affiliateRetentionRate: 0,
      revenueConcentration: 0
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!campaignId) {
      console.log('📊 EXTENDED STATS - Pas de campaignId fourni');
      return;
    }

    const loadExtendedStats = async () => {
      setLoading(true);
      
      try {
        console.log('📊 EXTENDED STATS - Chargement des stats étendues pour:', campaignId);
        
        // Charger toutes les données
        const [affiliatesSnapshot, clicksSnapshot, conversionsSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'affiliates'), where('campaignId', '==', campaignId))),
          getDocs(query(collection(db, 'clicks'), where('campaignId', '==', campaignId))),
          getDocs(query(collection(db, 'conversions'), where('campaignId', '==', campaignId)))
        ]);

        const affiliates = affiliatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const allClicks = clicksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const allConversions = conversionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Filtrer par période courante
        const filterDataByDate = (data: any[], filterDate: Date | null) => {
          if (!filterDate) return data;
          return data.filter((item: any) => {
            if (!item.timestamp) return false;
            try {
              const itemDate = item.timestamp.toDate ? item.timestamp.toDate() : new Date(item.timestamp);
              return itemDate >= filterDate;
            } catch (error) {
              return false;
            }
          });
        };

        const currentClicks = filterDataByDate(allClicks, filterDate);
        const currentConversions = filterDataByDate(allConversions, filterDate);

        // Calculer la période précédente pour comparaison
        let previousClicks: any[] = [];
        let previousConversions: any[] = [];
        
        if (filterDate) {
          const now = new Date();
          const daysInCurrentPeriod = Math.ceil((now.getTime() - filterDate.getTime()) / (1000 * 60 * 60 * 24));
          const previousPeriodStart = new Date(filterDate);
          previousPeriodStart.setDate(previousPeriodStart.getDate() - daysInCurrentPeriod);
          
          previousClicks = allClicks.filter((item: any) => {
            if (!item.timestamp) return false;
            try {
              const itemDate = item.timestamp.toDate ? item.timestamp.toDate() : new Date(item.timestamp);
              return itemDate >= previousPeriodStart && itemDate < filterDate;
            } catch (error) {
              return false;
            }
          });

          previousConversions = allConversions.filter((item: any) => {
            if (!item.timestamp) return false;
            try {
              const itemDate = item.timestamp.toDate ? item.timestamp.toDate() : new Date(item.timestamp);
              return itemDate >= previousPeriodStart && itemDate < filterDate;
            } catch (error) {
              return false;
            }
          });
        }

        // Calculs de base
        const globalMetrics = calculateGlobalMetrics(currentClicks, currentConversions, filterDate);
        const dailyStats = calculateDailyStats(currentClicks, currentConversions, filterDate);
        const topAffiliates = calculateAffiliatePerformance(affiliates, currentClicks, currentConversions, filterDate);

        // Nouveaux calculs
        const evolution = calculateEvolutionMetrics(currentClicks, currentConversions, previousClicks, previousConversions);
        const timeAnalysis = calculateTimeAnalysis(currentClicks, currentConversions);
        const behavioralMetrics = calculateBehavioralMetrics(currentConversions, topAffiliates);

        console.log('📊 EXTENDED STATS - Stats calculées:', {
          ...globalMetrics,
          evolution,
          timeAnalysis,
          behavioralMetrics
        });

        setStats({
          ...globalMetrics,
          dailyStats,
          topAffiliates,
          evolution,
          timeAnalysis,
          behavioralMetrics
        });
      } catch (error) {
        console.error('❌ EXTENDED STATS - Erreur:', error);
      }
      
      setLoading(false);
    };

    loadExtendedStats();
  }, [campaignId, filterDate]);

  return { stats, loading };
};
