
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
      setStats({ clicks: 0, conversions: 0, commissions: 0 });
      return;
    }

    const loadStats = async () => {
      setLoading(true);
      
      try {
        // Compter les clics
        const clicksQuery = query(
          collection(db, 'clicks'),
          where('affiliateId', '==', affiliateId)
        );
        const clicksSnapshot = await getDocs(clicksQuery);
        const clicksCount = clicksSnapshot.size;

        // Compter les conversions et calculer les commissions
        const conversionsQuery = query(
          collection(db, 'conversions'),
          where('affiliateId', '==', affiliateId)
        );
        const conversionsSnapshot = await getDocs(conversionsQuery);
        const conversionsCount = conversionsSnapshot.size;
        
        const totalCommissions = conversionsSnapshot.docs.reduce((total, doc) => {
          const data = doc.data();
          return total + (data.commission || 0);
        }, 0);

        console.log('Stats loaded for affiliate:', affiliateId, {
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
        console.error('Error loading affiliate stats:', error);
        // En cas d'erreur, on garde les stats à 0
      }
      
      setLoading(false);
    };

    loadStats();
  }, [affiliateId]);

  return { stats, loading };
};
