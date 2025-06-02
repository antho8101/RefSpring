
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
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
      console.log('📊 STATS - Pas d\'affiliateId fourni');
      setStats({ clicks: 0, conversions: 0, commissions: 0 });
      return;
    }

    const loadStats = async () => {
      setLoading(true);
      
      try {
        console.log('📊 STATS - Chargement des stats pour affilié:', affiliateId);
        
        // Compter les clics
        console.log('📊 STATS - Recherche des clics...');
        const clicksQuery = query(
          collection(db, 'clicks'),
          where('affiliateId', '==', affiliateId)
        );
        const clicksSnapshot = await getDocs(clicksQuery);
        const clicksCount = clicksSnapshot.size;
        console.log('📊 STATS - Clics trouvés:', clicksCount);
        console.log('📊 STATS - Documents clics:', clicksSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })));

        // Compter les conversions et calculer les commissions
        console.log('📊 STATS - Recherche des conversions...');
        const conversionsQuery = query(
          collection(db, 'conversions'),
          where('affiliateId', '==', affiliateId)
        );
        const conversionsSnapshot = await getDocs(conversionsQuery);
        const conversionsCount = conversionsSnapshot.size;
        console.log('📊 STATS - Conversions trouvées:', conversionsCount);
        console.log('📊 STATS - Documents conversions:', conversionsSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })));
        
        const totalCommissions = conversionsSnapshot.docs.reduce((total, doc) => {
          const data = doc.data();
          const commission = data.commission || 0;
          console.log('📊 STATS - Commission doc:', doc.id, commission);
          return total + commission;
        }, 0);

        console.log('📊 STATS - Stats finales calculées:', {
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
        console.error('❌ STATS - Erreur lors du chargement des stats:', error);
        console.log('❌ STATS - Détails erreur:', error);
        // En cas d'erreur (permissions), on garde les stats à 0 au lieu de faire planter
        setStats({ clicks: 0, conversions: 0, commissions: 0 });
      }
      
      setLoading(false);
    };

    loadStats();
  }, [affiliateId]);

  return { stats, loading };
};
