
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
        const clicksQuery = query(
          collection(db, 'clicks'),
          where('affiliateId', '==', affiliateId)
        );
        const clicksSnapshot = await getDocs(clicksQuery);
        const clicksCount = clicksSnapshot.size;
        console.log('📊 AFFILIATE STATS - Clics trouvés:', clicksCount);

        // Compter les conversions et utiliser DIRECTEMENT les commissions stockées
        const conversionsQuery = query(
          collection(db, 'conversions'),
          where('affiliateId', '==', affiliateId)
        );
        const conversionsSnapshot = await getDocs(conversionsQuery);
        const conversionsCount = conversionsSnapshot.size;
        console.log('📊 AFFILIATE STATS - Conversions trouvées:', conversionsCount);
        
        // UTILISER DIRECTEMENT les commissions stockées - PAS DE RECALCUL
        const totalCommissions = conversionsSnapshot.docs.reduce((total, doc) => {
          const data = doc.data();
          const commission = parseFloat(data.commission) || 0;
          
          console.log('📊 AFFILIATE STATS - Commission DEBUG:', {
            docId: doc.id,
            rawCommission: data.commission,
            parsedCommission: commission,
            amount: data.amount,
            commissionRate: data.commissionRate,
            type: typeof data.commission
          });
          
          return total + commission;
        }, 0);

        console.log('📊 AFFILIATE STATS - TOTAL COMMISSIONS CALCULATED:', totalCommissions);

        setStats({
          clicks: clicksCount,
          conversions: conversionsCount,
          commissions: totalCommissions,
        });
      } catch (error) {
        console.error('❌ AFFILIATE STATS - Erreur:', error);
        setStats({ clicks: 0, conversions: 0, commissions: 0 });
      }
      
      setLoading(false);
    };

    loadStats();
  }, [affiliateId]);

  return { stats, loading };
};
