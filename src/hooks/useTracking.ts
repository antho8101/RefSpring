
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const useTracking = () => {
  const recordClick = async (affiliateId: string, campaignId: string, targetUrl: string) => {
    try {
      // Clé basée uniquement sur l'affilié pour cette session - PAS sur la campagne
      // Un visiteur = un clic maximum par affilié, peu importe les navigations
      const sessionKey = `first_click_recorded_${affiliateId}`;
      const alreadyRecorded = sessionStorage.getItem(sessionKey);
      
      console.log('🔍 TRACKING - Vérification premier clic:', {
        affiliateId,
        campaignId,
        targetUrl,
        sessionKey,
        alreadyRecorded: !!alreadyRecorded,
        callStack: new Error().stack
      });
      
      if (alreadyRecorded) {
        console.log('🚫 TRACKING - PREMIER clic déjà enregistré pour cet affilié dans cette session, ignoré');
        return alreadyRecorded;
      }

      const clickData = {
        affiliateId,
        campaignId,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || null,
        targetUrl,
        ip: null,
      };

      console.log('📊 TRACKING - Enregistrement du PREMIER clic:', clickData);
      
      const docRef = await addDoc(collection(db, 'clicks'), clickData);
      console.log('✅ TRACKING - PREMIER clic enregistré avec ID:', docRef.id);
      
      // Marquer ce PREMIER clic comme enregistré pour toute la session
      sessionStorage.setItem(sessionKey, docRef.id);
      
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
          const rawCommissionRate = affiliateData.commissionRate;
          
          console.log('💰 TRACKING - RAW COMMISSION RATE FROM DB:', rawCommissionRate, typeof rawCommissionRate);
          
          // CORRECTION CRITIQUE : Gérer les différents formats possibles
          if (typeof rawCommissionRate === 'string') {
            commissionRate = parseFloat(rawCommissionRate);
          } else if (typeof rawCommissionRate === 'number') {
            commissionRate = rawCommissionRate;
          }
          
          // Si le taux est > 1, c'est probablement un pourcentage (99 au lieu de 0.99)
          if (commissionRate > 1) {
            console.log('💰 TRACKING - Commission rate is > 1, treating as percentage');
            calculatedCommission = (amount * commissionRate) / 100;
          } else {
            console.log('💰 TRACKING - Commission rate is <= 1, treating as decimal');
            calculatedCommission = amount * commissionRate;
          }
          
          console.log('💰 TRACKING - COMMISSION CALCULATION DEBUG:', {
            affiliateId,
            rawCommissionRate,
            parsedCommissionRate: commissionRate,
            amount,
            calculatedCommission,
            isPercentage: commissionRate > 1
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
        verified: true,
      };

      console.log('💰 TRACKING - FINAL CONVERSION DATA TO SAVE:', conversionData);
      
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
