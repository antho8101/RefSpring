
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAntifraud } from './useAntifraud';
import { useConversionVerification } from './useConversionVerification';

export const useTracking = () => {
  const { validateClick } = useAntifraud();
  const { createConversion } = useConversionVerification();

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

      // Validation anti-fraude
      const antifraudData = {
        ip: null, // Sera récupéré côté serveur si besoin
        userAgent: navigator.userAgent,
        affiliateId,
        campaignId
      };

      console.log('🛡️ TRACKING - Validation anti-fraude...');
      const validation = await validateClick(antifraudData);
      
      if (!validation.valid) {
        console.log('🚫 TRACKING - Clic rejeté par anti-fraude:', validation.reasons);
        // On enregistre quand même le clic mais on le marque comme suspect
      }

      const clickData = {
        affiliateId,
        campaignId,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || null,
        targetUrl,
        ip: null,
        antifraudFlags: validation.valid ? [] : validation.reasons,
        validated: validation.valid
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
      
      // PROTECTION ANTI-DOUBLE CONVERSION
      const conversionKey = `conversion_recorded_${affiliateId}_${campaignId}_${amount}`;
      const alreadyRecorded = sessionStorage.getItem(conversionKey);
      
      if (alreadyRecorded) {
        console.log('🚫 TRACKING - Conversion déjà enregistrée dans cette session, ignoré');
        return alreadyRecorded;
      }
      
      // Récupérer le taux de commission de l'affilié
      let commissionRate = 10; // Valeur par défaut en pourcentage
      let calculatedCommission = (amount * 10) / 100; // 10% par défaut
      
      try {
        const affiliateDoc = await getDoc(doc(db, 'affiliates', affiliateId));
        if (affiliateDoc.exists()) {
          const affiliateData = affiliateDoc.data();
          const rawCommissionRate = affiliateData.commissionRate;
          
          console.log('💰 TRACKING - Commission rate récupéré:', rawCommissionRate, typeof rawCommissionRate);
          
          if (typeof rawCommissionRate === 'string') {
            commissionRate = parseFloat(rawCommissionRate);
          } else if (typeof rawCommissionRate === 'number') {
            commissionRate = rawCommissionRate;
          }
          
          // CORRECTION CRITIQUE : Le taux est TOUJOURS en pourcentage dans la DB
          calculatedCommission = (amount * commissionRate) / 100;
          
          console.log('💰 TRACKING - CALCUL COMMISSION CORRIGÉ:', {
            affiliateId,
            amount,
            commissionRate: `${commissionRate}%`,
            calculatedCommission,
            formula: `${amount} * ${commissionRate} / 100 = ${calculatedCommission}`
          });
        } else {
          console.log('⚠️ TRACKING - Affiliate not found, using default 10%');
        }
      } catch (affiliateError) {
        console.log('⚠️ TRACKING - Could not fetch affiliate, using default commission');
      }

      // Utiliser le nouveau système de vérification
      console.log('🔍 TRACKING - Création conversion avec système de vérification');
      
      // Métadonnées pour l'analyse de risque
      const metadata = {
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        timestamp: new Date().toISOString(),
        rapid_succession: false,
        suspicious_amount: amount > 50000 // Plus de 500€
      };

      const conversionId = await createConversion(
        affiliateId,
        campaignId,
        parseFloat(amount.toString()),
        calculatedCommission,
        metadata
      );

      console.log('✅ TRACKING - Conversion created with verification system:', conversionId);
      
      // Marquer cette conversion comme enregistrée
      sessionStorage.setItem(conversionKey, conversionId);
      
      return conversionId;
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
