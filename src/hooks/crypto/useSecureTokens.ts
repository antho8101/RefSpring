
import { useCallback } from 'react';
import { useSignature } from './useSignature';

export const useSecureTokens = () => {
  const { signData, verifySignature } = useSignature();

  // 🎫 Génération de token temporaire
  const generateSecureToken = useCallback((affiliateId: string, campaignId: string): string => {
    const tokenData = {
      affiliateId,
      campaignId,
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substring(2, 15),
      clientFingerprint: navigator.userAgent.substring(0, 50)
    };
    
    const signature = signData(tokenData);
    const token = btoa(JSON.stringify({ ...tokenData, signature }));
    
    console.log('🎫 CRYPTO - Token sécurisé généré');
    return token;
  }, [signData]);

  // 🔍 Validation de token
  const validateSecureToken = useCallback((token: string): { valid: boolean; data?: any } => {
    try {
      const decoded = JSON.parse(atob(token));
      const { signature, ...tokenData } = decoded;
      
      // Vérifier l'âge du token (max 1 heure)
      if (Date.now() - tokenData.timestamp > 60 * 60 * 1000) {
        return { valid: false };
      }
      
      // Vérifier la signature
      if (!verifySignature(tokenData, signature)) {
        return { valid: false };
      }
      
      return { valid: true, data: tokenData };
    } catch (error) {
      console.error('🎫 CRYPTO - Erreur validation token:', error);
      return { valid: false };
    }
  }, [verifySignature]);

  return {
    generateSecureToken,
    validateSecureToken
  };
};
