import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CampaignStatsData {
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalCommissions: number;
  platformFee: number;
  totalCost: number;
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
    platformFee: 0,
    totalCost: 0,
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
        console.log('📊 CAMPAIGN STATS - Chargement pour campagne:', campaignId);
        
        // Toutes les requêtes en parallèle
        const [affiliatesSnapshot, clicksSnapshot, conversionsSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'affiliates'), where('campaignId', '==', campaignId))),
          getDocs(query(collection(db, 'clicks'), where('campaignId', '==', campaignId))),
          // IMPORTANT: Ne compter que les conversions validées
          getDocs(query(collection(db, 'conversions'), 
            where('campaignId', '==', campaignId),
            where('status', '==', 'verified')
          ))
        ]);

        const affiliatesCount = affiliatesSnapshot.size;
        const totalClicks = clicksSnapshot.size;
        
        let totalConversions = 0;
        let totalRevenue = 0;
        let totalCommissions = 0;

        // Ne traiter que les conversions validées
        conversionsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const amount = parseFloat(data.amount) || 0;
          const commission = parseFloat(data.commission) || 0;
          
          totalConversions++;
          totalRevenue += amount;
          totalCommissions += commission;
        });

        // Calculer la commission RefSpring (2.5% du CA total)
        const platformFee = totalRevenue * 0.025;
        
        // Calculer le coût total (commissions affiliés + commission RefSpring)
        const totalCost = totalCommissions + platformFee;
        
        // CA net après déduction des coûts
        const netRevenue = totalRevenue - totalCost;
        
        const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

        console.log('📊 CAMPAIGN STATS - Stats SIMPLIFIÉES calculées:', {
          affiliatesCount,
          totalClicks,
          totalConversions: `${totalConversions} (validées uniquement)`,
          totalRevenue,
          netRevenue: netRevenue.toFixed(2),
          conversionRate: conversionRate.toFixed(2)
        });

        setStats({
          affiliatesCount,
          totalClicks,
          totalConversions,
          totalRevenue,
          totalCommissions,
          platformFee,
          totalCost,
          netRevenue,
          conversionRate,
        });
      } catch (error) {
        console.error('❌ CAMPAIGN STATS - Erreur lors du chargement:', error);
        setStats({
          totalClicks: 0,
          totalConversions: 0,
          totalRevenue: 0,
          totalCommissions: 0,
          platformFee: 0,
          totalCost: 0,
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
