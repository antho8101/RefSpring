
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AffiliateStats {
  clicks: number;
  conversions: number;
  commissions: number;
}

export const useAffiliateStats = (affiliateId: string | null) => {
  const [stats, setStats] = useState<AffiliateStats>({
    clicks: 0,
    conversions: 0,
    commissions: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!affiliateId) {
      console.log('📊 AFFILIATE STATS - Pas d\'affiliateId fourni');
      setStats({ clicks: 0, conversions: 0, commissions: 0 });
      return;
    }

    const loadStats = async () => {
      setLoading(true);
      
      try {
        console.log('📊 AFFILIATE STATS - Chargement des stats pour affilié:', affiliateId);
        
        // Compter les clics
        console.log('📊 AFFILIATE STATS - Recherche des clics...');
        const clicksQuery = query(
          collection(db, 'clicks'),
          where('affiliateId', '==', affiliateId)
        );
        const clicksSnapshot = await getDocs(clicksQuery);
        const clicksCount = clicksSnapshot.size;
        console.log('📊 AFFILIATE STATS - Clics trouvés:', clicksCount);

        // Compter les conversions et UTILISER les commissions stockées
        console.log('📊 AFFILIATE STATS - Recherche des conversions...');
        const conversionsQuery = query(
          collection(db, 'conversions'),
          where('affiliateId', '==', affiliateId)
        );
        const conversionsSnapshot = await getDocs(conversionsQuery);
        const conversionsCount = conversionsSnapshot.size;
        console.log('📊 AFFILIATE STATS - Conversions trouvées:', conversionsCount);
        
        // CORRECTION MAJEURE : Utiliser directement les commissions stockées dans Firebase
        const totalCommissions = conversionsSnapshot.docs.reduce((total, doc) => {
          const data = doc.data();
          const storedCommission = parseFloat(data.commission) || 0;
          
          console.log('📊 AFFILIATE STATS - Conversion détail:', {
            docId: doc.id,
            amount: data.amount,
            commissionRate: data.commissionRate,
            storedCommission: storedCommission
          });
          
          return total + storedCommission;
        }, 0);

        console.log('📊 AFFILIATE STATS - Stats finales calculées:', {
          clicks: clicksCount,
          conversions: conversionsCount,
          commissions: totalCommissions
        });

        setStats({
          clicks: clicksCount,
          conversions: conversionsCount,
          commissions: totalCommissions,
        });
      } catch (error) {
        console.error('❌ AFFILIATE STATS - Erreur lors du chargement des stats:', error);
        setStats({ clicks: 0, conversions: 0, commissions: 0 });
      }
      
      setLoading(false);
    };

    loadStats();
  }, [affiliateId]);

  return { stats, loading };
};
