
import { useCallback } from 'react';
import { useTracking } from './useTracking';
import { useTrackingCrypto } from './useTrackingCrypto';

export const useSecureTracking = () => {
  const { trackClick, trackConversion } = useTracking();
  const { 
    secureStore, 
    secureRetrieve, 
    generateSecureToken, 
    validateSecureToken,
    signData,
    verifySignature 
  } = useTrackingCrypto();

  // 🔒 Enregistrement sécurisé des clics
  const secureRecordClick = useCallback(async (
    affiliateId: string, 
    campaignId: string, 
    targetUrl: string
  ) => {
    try {
      console.log('🔒 SECURE TRACKING - Début enregistrement clic sécurisé');
      
      // Générer un token sécurisé pour cette session
      const secureToken = generateSecureToken(affiliateId, campaignId);
      
      // Vérifier si c'est le premier clic (avec protection crypto)
      const existingData = secureRetrieve('first_click');
      if (existingData && existingData.affiliateId === affiliateId) {
        console.log('🔒 SECURE TRACKING - Premier clic déjà enregistré (vérification crypto)');
        return existingData.clickId;
      }
      
      // Enregistrer le clic avec le système existant
      await trackClick({ affiliateId, campaignId });
      
      // Stocker de manière sécurisée
      const clickData = {
        affiliateId,
        campaignId,
        targetUrl,
        secureToken,
        timestamp: Date.now()
      };
      
      secureStore('first_click', clickData);
      secureStore('affiliate_data', { affiliateId, campaignId });
      
      console.log('🔒 SECURE TRACKING - Clic enregistré et chiffré');
      
      return true;
    } catch (error) {
      console.error('🔒 SECURE TRACKING - Erreur clic sécurisé:', error);
      return false;
    }
  }, [trackClick, generateSecureToken, secureRetrieve, secureStore]);

  // 🔒 Enregistrement sécurisé des conversions
  const secureRecordConversion = useCallback(async (
    amount: number,
    customCommission?: number
  ) => {
    try {
      console.log('🔒 SECURE TRACKING - Début conversion sécurisée');
      
      // Récupérer les données d'affiliation chiffrées
      const affiliateData = secureRetrieve('affiliate_data');
      if (!affiliateData) {
        console.log('🔒 SECURE TRACKING - Pas de données d\'affiliation sécurisées');
        return null;
      }
      
      const { affiliateId, campaignId } = affiliateData;
      
      // Générer une signature pour cette conversion
      const conversionData = {
        amount,
        customCommission,
        affiliateId,
        campaignId,
        timestamp: Date.now(),
        url: window.location.href
      };
      
      const signature = signData(conversionData);
      
      // Vérifier qu'on n'a pas déjà une conversion récente similaire
      const recentConversions = secureRetrieve('recent_conversions') || [];
      const isDuplicate = recentConversions.some((conv: any) => 
        Math.abs(conv.amount - amount) < 100 && // Moins de 1€ de différence
        Date.now() - conv.timestamp < 60000 // Moins d'1 minute
      );
      
      if (isDuplicate) {
        console.log('🔒 SECURE TRACKING - Conversion en double détectée (crypto)');
        return null;
      }
      
      // Enregistrer la conversion avec le système existant
      await trackConversion({ affiliateId, campaignId, amount, commission: customCommission || 0 });
      
      // Ajouter à la liste des conversions récentes (chiffrée)
      const conversionRecord = {
        ...conversionData,
        signature
      };
      
      recentConversions.push(conversionRecord);
      
      // Garder seulement les 10 dernières conversions des 10 dernières minutes
      const filtered = recentConversions.filter((conv: any) => 
        Date.now() - conv.timestamp < 10 * 60 * 1000
      ).slice(-10);
      
      secureStore('recent_conversions', filtered);
      
      console.log('🔒 SECURE TRACKING - Conversion sécurisée enregistrée');
      
      return true;
    } catch (error) {
      console.error('🔒 SECURE TRACKING - Erreur conversion sécurisée:', error);
      return false;
    }
  }, [trackConversion, secureRetrieve, secureStore, signData]);

  // 🛡️ API sécurisée pour la console (avec vérification)
  const createSecureAPI = useCallback(() => {
    const originalConsoleLog = console.log;
    
    return {
      trackConversion: (amount: number, customCommission?: number) => {
        // Détecter si appelé depuis la console
        const stack = new Error().stack || '';
        const isConsoleCall = stack.includes('eval') || stack.includes('<anonymous>');
        
        if (isConsoleCall) {
          originalConsoleLog('🚨 SECURE TRACKING - Tentative d\'injection console détectée !');
          originalConsoleLog('🛡️ SECURE TRACKING - Utilisation d\'API sécurisée requise');
          
          // Log de l'activité suspecte
          const suspiciousActivity = {
            type: 'console_injection_attempt',
            amount,
            customCommission,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
          };
          
          secureStore('suspicious_console_activity', suspiciousActivity);
          
          return false;
        }
        
        // Si appelé légitimement, utiliser l'API sécurisée
        return secureRecordConversion(amount, customCommission);
      }
    };
  }, [secureRecordConversion, secureStore]);

  return {
    secureRecordClick,
    secureRecordConversion,
    createSecureAPI
  };
};
