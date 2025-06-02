
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
          console.log('📊 Mode campagne spécifique:', campaignId);
        } else {
          // Stats pour toutes les campagnes de l'utilisateur
          const campaignsQuery = query(
            collection(db, 'campaigns'),
            where('userId', '==', user.uid)
          );
          const campaignsSnapshot = await getDocs(campaignsQuery);
          campaignIds = campaignsSnapshot.docs.map(doc => doc.id);
          console.log('📊 Campagnes trouvées:', campaignIds.length);
        }

        if (campaignIds.length === 0) {
          console.log('📊 Aucune campagne trouvée');
          setLoading(false);
          return;
        }

        // Récupérer tous les clics
        let allClicks: any[] = [];
        for (const cId of campaignIds) {
          try {
            const clicksQuery = query(
              collection(db, 'clicks'),
              where('campaignId', '==', cId)
            );
            const clicksSnapshot = await getDocs(clicksQuery);
            const campaignClicks = clicksSnapshot.docs.map(doc => ({ 
              id: doc.id, 
              ...doc.data(),
              campaignId: cId 
            }));
            allClicks = [...allClicks, ...campaignClicks];
            console.log(`📊 Clics pour campagne ${cId}:`, campaignClicks.length);
          } catch (error) {
            console.warn(`⚠️ Erreur lors du chargement des clics pour ${cId}:`, error);
          }
        }

        // Récupérer toutes les conversions
        let allConversions: any[] = [];
        for (const cId of campaignIds) {
          try {
            const conversionsQuery = query(
              collection(db, 'conversions'),
              where('campaignId', '==', cId)
            );
            const conversionsSnapshot = await getDocs(conversionsQuery);
            const campaignConversions = conversionsSnapshot.docs.map(doc => ({ 
              id: doc.id, 
              ...doc.data(),
              campaignId: cId 
            }));
            allConversions = [...allConversions, ...campaignConversions];
            console.log(`📊 Conversions pour campagne ${cId}:`, campaignConversions.length);
          } catch (error) {
            console.warn(`⚠️ Erreur lors du chargement des conversions pour ${cId}:`, error);
          }
        }

        // Récupérer tous les affiliés
        let allAffiliates: any[] = [];
        for (const cId of campaignIds) {
          try {
            const affiliatesQuery = query(
              collection(db, 'affiliates'),
              where('campaignId', '==', cId)
            );
            const affiliatesSnapshot = await getDocs(affiliatesQuery);
            const campaignAffiliates = affiliatesSnapshot.docs.map(doc => ({ 
              id: doc.id, 
              ...doc.data(),
              campaignId: cId 
            }));
            allAffiliates = [...allAffiliates, ...campaignAffiliates];
            console.log(`📊 Affiliés pour campagne ${cId}:`, campaignAffiliates.length);
          } catch (error) {
            console.warn(`⚠️ Erreur lors du chargement des affiliés pour ${cId}:`, error);
          }
        }

        console.log('📊 TOTAUX:', { 
          clicks: allClicks.length, 
          conversions: allConversions.length, 
          affiliates: allAffiliates.length 
        });

        // Calculer les stats journalières (derniers 30 jours)
        const last30Days = Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        }).reverse();

        const dailyStats = last30Days.map(date => {
          const dayClicks = allClicks.filter(click => {
            if (!click.timestamp) return false;
            try {
              const clickDate = click.timestamp.toDate ? 
                click.timestamp.toDate().toISOString().split('T')[0] : 
                new Date(click.timestamp).toISOString().split('T')[0];
              return clickDate === date;
            } catch (error) {
              return false;
            }
          });
          
          const dayConversions = allConversions.filter(conversion => {
            if (!conversion.timestamp) return false;
            try {
              const conversionDate = conversion.timestamp.toDate ? 
                conversion.timestamp.toDate().toISOString().split('T')[0] : 
                new Date(conversion.timestamp).toISOString().split('T')[0];
              return conversionDate === date;
            } catch (error) {
              return false;
            }
          });

          const dayRevenue = dayConversions.reduce((sum, conv) => sum + (parseFloat(conv.amount) || 0), 0);
          const dayCommissions = dayConversions.reduce((sum, conv) => sum + (parseFloat(conv.commission) || 0), 0);

          return {
            date,
            clicks: dayClicks.length,
            conversions: dayConversions.length,
            revenue: dayRevenue,
            commissions: dayCommissions,
          };
        });

        // Calculer les performances par affilié
        const affiliatePerformance = allAffiliates.map(affiliate => {
          const affiliateClicks = allClicks.filter(click => click.affiliateId === affiliate.id);
          const affiliateConversions = allConversions.filter(conv => conv.affiliateId === affiliate.id);
          const affiliateCommissions = affiliateConversions.reduce((sum, conv) => sum + (parseFloat(conv.commission) || 0), 0);
          const conversionRate = affiliateClicks.length > 0 ? (affiliateConversions.length / affiliateClicks.length) * 100 : 0;

          return {
            id: affiliate.id,
            name: affiliate.name || 'Affilié anonyme',
            email: affiliate.email || 'Email non renseigné',
            clicks: affiliateClicks.length,
            conversions: affiliateConversions.length,
            commissions: affiliateCommissions,
            conversionRate,
          };
        }).sort((a, b) => b.commissions - a.commissions);

        // Calculer les métriques globales
        const totalClicks = allClicks.length;
        const totalConversions = allConversions.length;
        const totalRevenue = allConversions.reduce((sum, conv) => sum + (parseFloat(conv.amount) || 0), 0);
        const totalCommissions = allConversions.reduce((sum, conv) => sum + (parseFloat(conv.commission) || 0), 0);
        const netRevenue = totalRevenue - totalCommissions;
        const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
        const averageCPA = totalConversions > 0 ? totalCommissions / totalConversions : 0;
        const averageROAS = totalCommissions > 0 ? totalRevenue / totalCommissions : 0;

        console.log('📊 MÉTRIQUES CALCULÉES:', {
          totalClicks,
          totalConversions,
          totalRevenue,
          totalCommissions,
          netRevenue,
          conversionRate,
          averageCPA,
          averageROAS
        });

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
