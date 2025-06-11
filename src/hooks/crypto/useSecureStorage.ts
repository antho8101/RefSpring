
import { useCallback } from 'react';
import { useEncryption } from './useEncryption';
import { useSignature } from './useSignature';

interface SecureTrackingData {
  encrypted: string;
  signature: string;
  timestamp: number;
  integrity: string;
}

export const useSecureStorage = () => {
  const { encrypt, decrypt } = useEncryption();
  const { signData, verifySignature } = useSignature();

  // 🛡️ Stockage sécurisé
  const secureStore = useCallback((key: string, data: any): void => {
    const encrypted = encrypt(data);
    const signature = signData(data);
    const integrity = btoa(JSON.stringify(data)).substring(0, 16);
    
    const secureData: SecureTrackingData = {
      encrypted,
      signature,
      timestamp: Date.now(),
      integrity
    };
    
    localStorage.setItem(`refspring_secure_${key}`, JSON.stringify(secureData));
    console.log('🔒 CRYPTO - Données stockées de manière sécurisée:', key);
  }, [encrypt, signData]);

  // 🔍 Récupération sécurisée
  const secureRetrieve = useCallback((key: string): any => {
    try {
      const stored = localStorage.getItem(`refspring_secure_${key}`);
      if (!stored) return null;
      
      const secureData: SecureTrackingData = JSON.parse(stored);
      
      // Vérifier l'âge des données (max 24h)
      if (Date.now() - secureData.timestamp > 24 * 60 * 60 * 1000) {
        console.log('🔒 CRYPTO - Données expirées, suppression');
        localStorage.removeItem(`refspring_secure_${key}`);
        return null;
      }
      
      const decryptedData = decrypt(secureData.encrypted);
      if (!decryptedData) return null;
      
      // Vérifier l'intégrité
      const currentIntegrity = btoa(JSON.stringify(decryptedData)).substring(0, 16);
      if (currentIntegrity !== secureData.integrity) {
        console.log('🔒 CRYPTO - Intégrité compromise, suppression');
        localStorage.removeItem(`refspring_secure_${key}`);
        return null;
      }
      
      // Vérifier la signature
      if (!verifySignature(decryptedData, secureData.signature)) {
        console.log('🔒 CRYPTO - Signature invalide, suppression');
        localStorage.removeItem(`refspring_secure_${key}`);
        return null;
      }
      
      return decryptedData;
    } catch (error) {
      console.error('🔒 CRYPTO - Erreur récupération sécurisée:', error);
      return null;
    }
  }, [decrypt, verifySignature]);

  return {
    secureStore,
    secureRetrieve
  };
};
