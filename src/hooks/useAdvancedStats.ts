import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

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
        
        let campaignIds: string[] = [];

        if (campaignId) {
          // Stats pour une campagne spécifique
          campaignIds = [campaignId];
        } else {
          // Stats pour toutes les campagnes de l'utilisateur
          const campaignsQuery = query(
            collection(db, 'campaigns'),
            where('userId', '==', user.uid)
          );
          const campaignsSnapshot = await getDocs(campaignsQuery);
          campaignIds = campaignsSnapshot.docs.map(doc => doc.id);
        }

        if (campaignIds.length === 0) {
          setLoading(false);
          return;
        }

        // 2. Récupérer tous les clics avec dates
        let allClicks: any[] = [];
        for (const cId of campaignIds) {
          const clicksQuery = query(
            collection(db, 'clicks'),
            where('campaignId', '==', cId),
            orderBy('timestamp', 'desc')
          );
          const clicksSnapshot = await getDocs(clicksQuery);
          allClicks = [...allClicks, ...clicksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))];
        }

        // 3. Récupérer toutes les conversions avec dates
        let allConversions: any[] = [];
        for (const cId of campaignIds) {
          const conversionsQuery = query(
            collection(db, 'conversions'),
            where('campaignId', '==', cId),
            orderBy('timestamp', 'desc')
          );
          const conversionsSnapshot = await getDocs(conversionsQuery);
          allConversions = [...allConversions, ...conversionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))];
        }

        // 4. Récupérer tous les affiliés
        let allAffiliates: any[] = [];
        for (const cId of campaignIds) {
          const affiliatesQuery = query(
            collection(db, 'affiliates'),
            where('campaignId', '==', cId)
          );
          const affiliatesSnapshot = await getDocs(affiliatesQuery);
          allAffiliates = [...allAffiliates, ...affiliatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))];
        }

        // 5. Calculer les stats journalières (derniers 30 jours)
        const last30Days = Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        }).reverse();

        const dailyStats = last30Days.map(date => {
          const dayClicks = allClicks.filter(click => {
            const clickDate = click.timestamp?.toDate?.()?.toISOString?.().split('T')[0] || date;
            return clickDate === date;
          });
          
          const dayConversions = allConversions.filter(conversion => {
            const conversionDate = conversion.timestamp?.toDate?.()?.toISOString?.().split('T')[0] || date;
            return conversionDate === date;
          });

          const dayRevenue = dayConversions.reduce((sum, conv) => sum + (conv.amount || 0), 0);
          const dayCommissions = dayConversions.reduce((sum, conv) => sum + (conv.commission || 0), 0);

          return {
            date,
            clicks: dayClicks.length,
            conversions: dayConversions.length,
            revenue: dayRevenue,
            commissions: dayCommissions,
          };
        });

        // 6. Calculer les performances par affilié
        const affiliatePerformance = allAffiliates.map(affiliate => {
          const affiliateClicks = allClicks.filter(click => click.affiliateId === affiliate.id);
          const affiliateConversions = allConversions.filter(conv => conv.affiliateId === affiliate.id);
          const affiliateCommissions = affiliateConversions.reduce((sum, conv) => sum + (conv.commission || 0), 0);
          const conversionRate = affiliateClicks.length > 0 ? (affiliateConversions.length / affiliateClicks.length) * 100 : 0;

          return {
            id: affiliate.id,
            name: affiliate.name || 'Anonyme',
            email: affiliate.email || '',
            clicks: affiliateClicks.length,
            conversions: affiliateConversions.length,
            commissions: affiliateCommissions,
            conversionRate,
          };
        }).sort((a, b) => b.commissions - a.commissions);

        // 7. Calculer les métriques globales
        const totalClicks = allClicks.length;
        const totalConversions = allConversions.length;
        const totalRevenue = allConversions.reduce((sum, conv) => sum + (conv.amount || 0), 0);
        const totalCommissions = allConversions.reduce((sum, conv) => sum + (conv.commission || 0), 0);
        const netRevenue = totalRevenue - totalCommissions;
        const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
        const averageCPA = totalConversions > 0 ? totalCommissions / totalConversions : 0;
        const averageROAS = totalCommissions > 0 ? totalRevenue / totalCommissions : 0;

        setStats({
          dailyStats,
          topAffiliates: affiliatePerformance.slice(0, 10),
          totalClicks,
          totalConversions,
          totalRevenue,
          totalCommissions,
          netRevenue,
          conversionRate,
          averageCPA,
          averageROAS,
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
