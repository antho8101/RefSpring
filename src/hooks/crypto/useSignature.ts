
import { useCallback } from 'react';
import { useClientSecret } from './useClientSecret';

export const useSignature = () => {
  const { getClientSecret } = useClientSecret();

  // ✍️ Signature cryptographique
  const signData = useCallback((data: any): string => {
    const secret = getClientSecret();
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2, 15);
    
    const payload = JSON.stringify({
      data,
      timestamp,
      nonce,
      secret: secret.substring(0, 8) // Partie de la clé seulement
    });
    
    // Hash simple mais efficace
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
      const char = payload.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return btoa(hash.toString() + '|' + timestamp + '|' + nonce);
  }, [getClientSecret]);

  // ✅ Vérification de signature
  const verifySignature = useCallback((data: any, signature: string): boolean => {
    try {
      const decoded = atob(signature);
      const [hash, timestamp, nonce] = decoded.split('|');
      
      // Vérifier l'âge (max 5 minutes)
      if (Date.now() - parseInt(timestamp) > 5 * 60 * 1000) {
        console.log('🔒 CRYPTO - Signature expirée');
        return false;
      }
      
      // Recalculer la signature
      const secret = getClientSecret();
      const payload = JSON.stringify({
        data,
        timestamp: parseInt(timestamp),
        nonce,
        secret: secret.substring(0, 8)
      });
      
      let expectedHash = 0;
      for (let i = 0; i < payload.length; i++) {
        const char = payload.charCodeAt(i);
        expectedHash = ((expectedHash << 5) - expectedHash) + char;
        expectedHash = expectedHash & expectedHash;
      }
      
      return expectedHash.toString() === hash;
    } catch (error) {
      console.error('🔒 CRYPTO - Erreur vérification signature:', error);
      return false;
    }
  }, [getClientSecret]);

  return {
    signData,
    verifySignature
  };
};
