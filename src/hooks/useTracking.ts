
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const useTracking = () => {
  const recordClick = async (affiliateId: string, campaignId: string, targetUrl: string) => {
    try {
      const clickData = {
        affiliateId,
        campaignId,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || null,
        targetUrl,
        ip: null,
      };

      console.log('📊 TRACKING - Recording click:', clickData);
      
      const docRef = await addDoc(collection(db, 'clicks'), clickData);
      console.log('✅ TRACKING - Click recorded with ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ TRACKING - Error recording click:', error);
      return null;
    }
  };

  const recordConversion = async (affiliateId: string, campaignId: string, amount: number, providedCommission?: number) => {
    try {
      console.log('💰 TRACKING - Starting conversion recording:', { affiliateId, campaignId, amount, providedCommission });
      
      // Récupérer le taux de commission de l'affilié
      let commissionRate = 10; // Valeur par défaut
      let calculatedCommission = amount * 0.1;
      
      try {
        const affiliateDoc = await getDoc(doc(db, 'affiliates', affiliateId));
        if (affiliateDoc.exists()) {
          const affiliateData = affiliateDoc.data();
          commissionRate = parseFloat(affiliateData.commissionRate) || 10;
          calculatedCommission = (amount * commissionRate) / 100;
          
          console.log('💰 TRACKING - Affiliate found:', {
            affiliateId,
            commissionRate,
            amount,
            calculatedCommission
          });
        } else {
          console.log('⚠️ TRACKING - Affiliate not found, using default 10%');
        }
      } catch (affiliateError) {
        console.log('⚠️ TRACKING - Could not fetch affiliate, using default commission');
      }

      const conversionData = {
        affiliateId,
        campaignId,
        amount: parseFloat(amount.toString()),
        commissionRate: commissionRate,
        commission: calculatedCommission,
        timestamp: new Date(),
        verified: true, // Auto-vérifié pour les tests
      };

      console.log('💰 TRACKING - Final conversion data:', conversionData);
      
      const docRef = await addDoc(collection(db, 'conversions'), conversionData);
      console.log('✅ TRACKING - Conversion recorded with ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ TRACKING - Error recording conversion:', error);
      return null;
    }
  };

  return {
    recordClick,
    recordConversion,
  };
};
