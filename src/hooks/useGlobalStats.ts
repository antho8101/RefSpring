import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';

interface GlobalStats {
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalCommissions: number;
  netRevenue: number;
  conversionRate: number;
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
  const { user } = useOptimizedAuth();

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
        console.log('📊 GLOBAL STATS - Chargement OPTIMISÉ des stats globales pour user:', user.uid);
        
        // 1. Récupérer toutes les campagnes de l'utilisateur
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

        // 2. OPTIMISATION : Requêtes en parallèle au lieu de séquentielles
        console.log('📊 GLOBAL STATS - Lancement des requêtes EN PARALLÈLE...');
        
        const [clicksResults, conversionsResults] = await Promise.all([
          // Tous les clics en parallèle
          Promise.all(campaignIds.map(campaignId => 
            getDocs(query(collection(db, 'clicks'), where('campaignId', '==', campaignId)))
          )),
          // Toutes les conversions en parallèle
          Promise.all(campaignIds.map(campaignId => 
            getDocs(query(collection(db, 'conversions'), where('campaignId', '==', campaignId)))
          ))
        ]);

        // 3. Compter les résultats
        let totalClicks = 0;
        let totalConversions = 0;
        let totalRevenue = 0;
        let totalCommissions = 0;

        // Compter les clics
        clicksResults.forEach(snapshot => {
          totalClicks += snapshot.size;
        });

        // Compter les conversions et calculer revenus
        conversionsResults.forEach(snapshot => {
          snapshot.docs.forEach(doc => {
            const data = doc.data();
            const amount = data.amount || 0;
            const commission = data.commission || 0;
            
            totalConversions++;
            totalRevenue += amount;
            totalCommissions += commission;
          });
        });

        const netRevenue = totalRevenue - totalCommissions;
        const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

        console.log('📊 GLOBAL STATS - Stats calculées RAPIDEMENT:', {
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
