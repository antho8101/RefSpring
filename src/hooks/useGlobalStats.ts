
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

interface GlobalStats {
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number; // CA brut total (montant des ventes)
  totalCommissions: number; // Total des commissions à verser aux affiliés
  netRevenue: number; // CA net (après déduction des commissions)
  conversionRate: number; // Taux de conversion global
}

export const useGlobalStats = () => {
  const [stats, setStats] = useState<GlobalStats>({
    totalClicks: 0,
    totalConversions: 0,
    totalRevenue: 0,
    totalCommissions: 0,
    netRevenue: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      console.log('📊 GLOBAL STATS - Pas d\'utilisateur connecté');
      setStats({
        totalClicks: 0,
        totalConversions: 0,
        totalRevenue: 0,
        totalCommissions: 0,
        netRevenue: 0,
        conversionRate: 0,
      });
      return;
    }

    const loadGlobalStats = async () => {
      setLoading(true);
      
      try {
        console.log('📊 GLOBAL STATS - Chargement des stats globales pour user:', user.uid);
        
        // 1. Récupérer toutes les campagnes de l'utilisateur
        console.log('📊 GLOBAL STATS - Recherche des campagnes...');
        const campaignsQuery = query(
          collection(db, 'campaigns'),
          where('userId', '==', user.uid)
        );
        const campaignsSnapshot = await getDocs(campaignsQuery);
        const campaignIds = campaignsSnapshot.docs.map(doc => doc.id);
        console.log('📊 GLOBAL STATS - Campagnes trouvées:', campaignIds.length);

        if (campaignIds.length === 0) {
          console.log('📊 GLOBAL STATS - Aucune campagne trouvée');
          setStats({
            totalClicks: 0,
            totalConversions: 0,
            totalRevenue: 0,
            totalCommissions: 0,
            netRevenue: 0,
            conversionRate: 0,
          });
          setLoading(false);
          return;
        }

        // 2. Compter tous les clics pour toutes les campagnes
        console.log('📊 GLOBAL STATS - Recherche des clics...');
        let totalClicks = 0;
        for (const campaignId of campaignIds) {
          const clicksQuery = query(
            collection(db, 'clicks'),
            where('campaignId', '==', campaignId)
          );
          const clicksSnapshot = await getDocs(clicksQuery);
          totalClicks += clicksSnapshot.size;
        }
        console.log('📊 GLOBAL STATS - Clics totaux:', totalClicks);

        // 3. Récupérer toutes les conversions pour toutes les campagnes
        console.log('📊 GLOBAL STATS - Recherche des conversions...');
        let totalConversions = 0;
        let totalRevenue = 0;
        let totalCommissions = 0;

        for (const campaignId of campaignIds) {
          const conversionsQuery = query(
            collection(db, 'conversions'),
            where('campaignId', '==', campaignId)
          );
          const conversionsSnapshot = await getDocs(conversionsQuery);
          
          conversionsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const amount = data.amount || 0;
            const commission = data.commission || 0;
            
            totalConversions++;
            totalRevenue += amount;
            totalCommissions += commission;
            
            console.log('📊 GLOBAL STATS - Conversion:', {
              id: doc.id,
              amount,
              commission,
              campaignId
            });
          });
        }

        // 4. Calculer le CA net et le taux de conversion
        const netRevenue = totalRevenue - totalCommissions;
        const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

        console.log('📊 GLOBAL STATS - Stats finales calculées:', {
          totalClicks,
          totalConversions,
          totalRevenue,
          totalCommissions,
          netRevenue,
          conversionRate: conversionRate.toFixed(2)
        });

        setStats({
          totalClicks,
          totalConversions,
          totalRevenue,
          totalCommissions,
          netRevenue,
          conversionRate,
        });
      } catch (error) {
        console.error('❌ GLOBAL STATS - Erreur lors du chargement des stats globales:', error);
        setStats({
          totalClicks: 0,
          totalConversions: 0,
          totalRevenue: 0,
          totalCommissions: 0,
          netRevenue: 0,
          conversionRate: 0,
        });
      }
      
      setLoading(false);
    };

    loadGlobalStats();
  }, [user]);

  return { stats, loading };
};
