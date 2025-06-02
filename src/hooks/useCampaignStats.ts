
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CampaignStatsData {
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number; // CA brut total
  totalCommissions: number; // Total des commissions
  netRevenue: number; // CA net (après commissions)
  conversionRate: number; // Taux de conversion
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
        console.log('📊 CAMPAIGN STATS - Chargement des stats pour campagne:', campaignId);
        
        // 1. Compter les affiliés de cette campagne
        console.log('📊 CAMPAIGN STATS - Recherche des affiliés...');
        const affiliatesQuery = query(
          collection(db, 'affiliates'),
          where('campaignId', '==', campaignId)
        );
        const affiliatesSnapshot = await getDocs(affiliatesQuery);
        const affiliatesCount = affiliatesSnapshot.size;
        console.log('📊 CAMPAIGN STATS - Affiliés trouvés:', affiliatesCount);

        // 2. Compter tous les clics pour cette campagne
        console.log('📊 CAMPAIGN STATS - Recherche des clics...');
        const clicksQuery = query(
          collection(db, 'clicks'),
          where('campaignId', '==', campaignId)
        );
        const clicksSnapshot = await getDocs(clicksQuery);
        const totalClicks = clicksSnapshot.size;
        console.log('📊 CAMPAIGN STATS - Clics totaux:', totalClicks);

        // 3. Récupérer toutes les conversions pour cette campagne
        console.log('📊 CAMPAIGN STATS - Recherche des conversions...');
        const conversionsQuery = query(
          collection(db, 'conversions'),
          where('campaignId', '==', campaignId)
        );
        const conversionsSnapshot = await getDocs(conversionsQuery);
        
        let totalConversions = 0;
        let totalRevenue = 0;
        let totalCommissions = 0;

        conversionsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const amount = data.amount || 0;
          const commission = data.commission || 0;
          
          totalConversions++;
          totalRevenue += amount;
          totalCommissions += commission;
          
          console.log('📊 CAMPAIGN STATS - Conversion:', {
            id: doc.id,
            amount,
            commission
          });
        });

        // 4. Calculer le CA net et le taux de conversion
        const netRevenue = totalRevenue - totalCommissions;
        const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

        console.log('📊 CAMPAIGN STATS - Stats finales calculées:', {
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
