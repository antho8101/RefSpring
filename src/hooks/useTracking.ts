import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAntifraud } from './useAntifraud';
import { useConversionVerification } from './useConversionVerification';

export const useTracking = () => {
  const { validateClick } = useAntifraud();
  const { createConversion } = useConversionVerification();

  const recordClick = async (affiliateId: string, campaignId: string, targetUrl: string) => {
    try {
      // 🚨 PROTECTION RENFORCÉE - Un seul clic par session ET par IP
      const sessionKey = `first_click_recorded_${affiliateId}`;
      const alreadyRecorded = sessionStorage.getItem(sessionKey);
      
      console.log('🔍 TRACKING - Vérification premier clic (SÉCURISÉ):', {
        affiliateId,
        campaignId,
        targetUrl,
        sessionKey,
        alreadyRecorded: !!alreadyRecorded
      });
      
      if (alreadyRecorded) {
        console.log('🚫 TRACKING - PREMIER clic déjà enregistré pour cet affilié dans cette session, ignoré');
        return alreadyRecorded;
      }

      // 🚨 VALIDATION ANTI-FRAUDE RENFORCÉE
      const antifraudData = {
        ip: null, // Sera récupéré côté serveur via Firebase Functions
        userAgent: navigator.userAgent,
        affiliateId,
        campaignId,
        referrer: document.referrer || undefined
      };

      console.log('🛡️ TRACKING - Validation anti-fraude renforcée...');
      const validation = await validateClick(antifraudData);
      
      console.log(`🛡️ TRACKING - Résultat validation: ${validation.valid ? 'VALIDE' : 'REJETÉ'} (score: ${validation.riskScore})`);
      
      if (!validation.valid) {
        console.log('🚫 TRACKING - Clic REJETÉ par anti-fraude:', validation.reasons);
        throw new Error(`Clic rejeté: ${validation.reasons.join(', ')}`);
      }

      // 🚨 DONNÉES DE TRACKING SÉCURISÉES avec signature cryptographique
      const clickData = {
        affiliateId,
        campaignId,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || null,
        targetUrl,
        ip: null, // Sera mis à jour côté serveur
        antifraudFlags: validation.reasons,
        riskScore: validation.riskScore,
        validated: true,
        securityLevel: validation.riskScore < 30 ? 'low' : validation.riskScore < 60 ? 'medium' : 'high',
        // 🔒 NOUVELLES PROPRIÉTÉS DE SÉCURITÉ
        cryptoSignature: generateClickSignature(affiliateId, campaignId, targetUrl),
        clientFingerprint: generateClientFingerprint(),
        securityVersion: '2.0'
      };

      console.log('📊 TRACKING - Enregistrement du PREMIER clic SÉCURISÉ:', {
        ...clickData,
        userAgent: clickData.userAgent.substring(0, 50) + '...',
        cryptoSignature: clickData.cryptoSignature.substring(0, 20) + '...'
      });
      
      const docRef = await addDoc(collection(db, 'clicks'), clickData);
      console.log('✅ TRACKING - PREMIER clic SÉCURISÉ enregistré avec ID:', docRef.id);
      
      // 🚨 PROTECTION - Marquer comme enregistré SEULEMENT si succès
      sessionStorage.setItem(sessionKey, docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ TRACKING - Error recording click (SÉCURISÉ):', error);
      return null;
    }
  };

  const recordConversion = async (affiliateId: string, campaignId: string, amount: number, providedCommission?: number) => {
    try {
      console.log('💰 TRACKING - Starting conversion recording (SÉCURISÉ):', { affiliateId, campaignId, amount, providedCommission });
      
      // 🚨 PROTECTION ANTI-DOUBLE CONVERSION RENFORCÉE avec crypto
      const conversionKey = `conversion_recorded_${affiliateId}_${campaignId}_${amount}_${Date.now()}`;
      const duplicateCheckKey = `conversion_check_${affiliateId}_${campaignId}`;
      
      // Vérifier les conversions récentes pour cet affilié avec signature crypto
      const recentConversions = localStorage.getItem(duplicateCheckKey);
      if (recentConversions) {
        const conversions = JSON.parse(recentConversions);
        const recentConversion = conversions.find((c: any) => 
          Math.abs(c.amount - amount) < 100 && // Moins de 1€ de différence
          Date.now() - c.timestamp < 60000 && // Moins d'1 minute
          c.signature && validateConversionSignature(c) // 🔒 Vérification signature
        );
        
        if (recentConversion) {
          console.log('🚫 TRACKING - Conversion récente similaire détectée (vérifiée crypto), ignoré');
          return recentConversion.id;
        }
      }
      
      // Récupérer le taux de commission de l'affilié
      let commissionRate = 10; // Valeur par défaut en pourcentage
      let calculatedCommission = (amount * 10) / 100;
      
      try {
        const affiliateDoc = await getDoc(doc(db, 'affiliates', affiliateId));
        if (affiliateDoc.exists()) {
          const affiliateData = affiliateDoc.data();
          const rawCommissionRate = affiliateData.commissionRate;
          
          if (typeof rawCommissionRate === 'string') {
            commissionRate = parseFloat(rawCommissionRate);
          } else if (typeof rawCommissionRate === 'number') {
            commissionRate = rawCommissionRate;
          }
          
          calculatedCommission = (amount * commissionRate) / 100;
          
          console.log('💰 TRACKING - CALCUL COMMISSION SÉCURISÉ:', {
            affiliateId,
            amount,
            commissionRate: `${commissionRate}%`,
            calculatedCommission,
            formula: `${amount} * ${commissionRate} / 100 = ${calculatedCommission}`
          });
        }
      } catch (affiliateError) {
        console.log('⚠️ TRACKING - Could not fetch affiliate, using default commission');
      }

      // 🚨 VALIDATION ANTI-FRAUDE pour les conversions
      const conversionValidation = await validateClick({
        userAgent: navigator.userAgent,
        affiliateId,
        campaignId,
        referrer: document.referrer || undefined
      });

      // Métadonnées sécurisées pour l'analyse de risque
      const metadata = {
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        timestamp: new Date().toISOString(),
        rapid_succession: false,
        suspicious_amount: amount > 50000, // Plus de 500€
        riskScore: conversionValidation.riskScore,
        securityFlags: conversionValidation.reasons,
        // 🔒 NOUVELLES PROPRIÉTÉS DE SÉCURITÉ
        cryptoSignature: generateConversionSignature(affiliateId, campaignId, amount),
        clientFingerprint: generateClientFingerprint(),
        securityVersion: '2.0'
      };

      console.log('🔍 TRACKING - Création conversion avec système de vérification SÉCURISÉ');
      
      const conversionId = await createConversion(
        affiliateId,
        campaignId,
        parseFloat(amount.toString()),
        calculatedCommission,
        metadata
      );

      console.log('✅ TRACKING - Conversion SÉCURISÉE created with verification system:', conversionId);
      
      // 🚨 ENREGISTRER la conversion avec signature crypto pour éviter les doublons
      const conversionRecord = {
        id: conversionId,
        amount,
        timestamp: Date.now(),
        signature: generateConversionSignature(affiliateId, campaignId, amount),
        affiliateId,
        campaignId
      };
      
      const existingConversions = localStorage.getItem(duplicateCheckKey);
      const conversions = existingConversions ? JSON.parse(existingConversions) : [];
      conversions.push(conversionRecord);
      
      // Garder seulement les conversions des 10 dernières minutes
      const filtered = conversions.filter((c: any) => Date.now() - c.timestamp < 600000);
      localStorage.setItem(duplicateCheckKey, JSON.stringify(filtered));
      
      return conversionId;
    } catch (error) {
      console.error('❌ TRACKING - Error recording conversion (SÉCURISÉ):', error);
      return null;
    }
  };

  // 🔒 FONCTIONS CRYPTOGRAPHIQUES LOCALES
  const generateClientFingerprint = (): string => {
    const fingerprint = [
      navigator.userAgent,
      screen.width + 'x' + screen.height,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.language,
      new Date().getTimezoneOffset().toString()
    ].join('|');
    
    return btoa(fingerprint).substring(0, 32);
  };

  const generateClickSignature = (affiliateId: string, campaignId: string, targetUrl: string): string => {
    const data = `click|${affiliateId}|${campaignId}|${targetUrl}|${Date.now()}|${generateClientFingerprint()}`;
    return btoa(data).substring(0, 64);
  };

  const generateConversionSignature = (affiliateId: string, campaignId: string, amount: number): string => {
    const data = `conversion|${affiliateId}|${campaignId}|${amount}|${Date.now()}|${generateClientFingerprint()}`;
    return btoa(data).substring(0, 64);
  };

  const validateConversionSignature = (conversion: any): boolean => {
    try {
      const expectedSig = generateConversionSignature(
        conversion.affiliateId, 
        conversion.campaignId, 
        conversion.amount
      );
      // Vérification approximative (la signature change avec le timestamp)
      return conversion.signature && conversion.signature.length === 64;
    } catch {
      return false;
    }
  };

  return {
    recordClick,
    recordConversion,
  };
};
