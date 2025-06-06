
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CampaignStatsData {
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalCommissions: number;
  netRevenue: number;
  conversionRate: number;
  affiliatesCount: number;
}

export const useCampaignStats = (campaignId: string) => {
  const [stats, setStats] = useState<CampaignStatsData>({
    totalClicks: 0,
    totalConversions: 0,
    totalRevenue: 0,
    totalCommissions: 0,
    netRevenue: 0,
    conversionRate: 0,
    affiliatesCount: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!campaignId) {
      console.log('📊 CAMPAIGN STATS - Pas de campaignId fourni');
      return;
    }

    const loadCampaignStats = async () => {
      setLoading(true);
      
      try {
        console.log('📊 CAMPAIGN STATS - Chargement OPTIMISÉ pour campagne:', campaignId);
        
        // OPTIMISATION : Toutes les requêtes en parallèle
        const [affiliatesSnapshot, clicksSnapshot, conversionsSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'affiliates'), where('campaignId', '==', campaignId))),
          getDocs(query(collection(db, 'clicks'), where('campaignId', '==', campaignId))),
          getDocs(query(collection(db, 'conversions'), where('campaignId', '==', campaignId)))
        ]);

        const affiliatesCount = affiliatesSnapshot.size;
        const totalClicks = clicksSnapshot.size;
        
        let totalConversions = 0;
        let totalRevenue = 0;
        let totalCommissions = 0;

        conversionsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const amount = parseFloat(data.amount) || 0;
          const commissionRate = parseFloat(data.commissionRate) || 0;
          
          // CORRECTION : Recalculer la commission si nécessaire
          const calculatedCommission = (amount * commissionRate) / 100;
          const storedCommission = parseFloat(data.commission) || 0;
          
          // Utiliser la commission calculée pour être sûr
          const finalCommission = Math.abs(calculatedCommission - storedCommission) < 0.01 
            ? storedCommission 
            : calculatedCommission;
          
          totalConversions++;
          totalRevenue += amount;
          totalCommissions += finalCommission;
          
          console.log('📊 CAMPAIGN STATS - Conversion:', {
            amount,
            commissionRate,
            storedCommission,
            calculatedCommission,
            finalCommission
          });
        });

        const netRevenue = totalRevenue - totalCommissions;
        const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

        console.log('📊 CAMPAIGN STATS - Stats calculées RAPIDEMENT:', {
          affiliatesCount,
          totalClicks,
          totalConversions,
          totalRevenue,
          totalCommissions,
          netRevenue,
          conversionRate: conversionRate.toFixed(2)
        });

        setStats({
          affiliatesCount,
          totalClicks,
          totalConversions,
          totalRevenue,
          totalCommissions,
          netRevenue,
          conversionRate,
        });
      } catch (error) {
        console.error('❌ CAMPAIGN STATS - Erreur lors du chargement des stats:', error);
        setStats({
          totalClicks: 0,
          totalConversions: 0,
          totalRevenue: 0,
          totalCommissions: 0,
          netRevenue: 0,
          conversionRate: 0,
          affiliatesCount: 0,
        });
      }
      
      setLoading(false);
    };

    loadCampaignStats();
  }, [campaignId]);

  return { stats, loading };
};
