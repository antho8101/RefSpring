
import { useCallback } from 'react';

interface TrackingSignature {
  data: any;
  signature: string;
  timestamp: number;
  nonce: string;
}

interface SecureTrackingData {
  encrypted: string;
  signature: string;
  timestamp: number;
  integrity: string;
}

export const useTrackingCrypto = () => {
  
  // 🔐 Clé secrète générée dynamiquement (côté client)
  const getClientSecret = useCallback((): string => {
    const existingSecret = sessionStorage.getItem('refspring_client_secret');
    if (existingSecret) {
      return existingSecret;
    }
    
    // Générer une clé basée sur des éléments uniques du client
    const clientFingerprint = [
      navigator.userAgent,
      screen.width + 'x' + screen.height,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.language,
      new Date().getTimezoneOffset().toString()
    ].join('|');
    
    const secret = btoa(clientFingerprint).substring(0, 32);
    sessionStorage.setItem('refspring_client_secret', secret);
    return secret;
  }, []);

  // 🔒 Chiffrement simple mais efficace
  const encrypt = useCallback((data: any): string => {
    const secret = getClientSecret();
    const jsonData = JSON.stringify(data);
    let encrypted = '';
    
    for (let i = 0; i < jsonData.length; i++) {
      const char = jsonData.charCodeAt(i);
      const keyChar = secret.charCodeAt(i % secret.length);
      encrypted += String.fromCharCode(char ^ keyChar);
    }
    
    return btoa(encrypted);
  }, [getClientSecret]);

  // 🔓 Déchiffrement
  const decrypt = useCallback((encryptedData: string): any => {
    try {
      const secret = getClientSecret();
      const encrypted = atob(encryptedData);
      let decrypted = '';
      
      for (let i = 0; i < encrypted.length; i++) {
        const char = encrypted.charCodeAt(i);
        const keyChar = secret.charCodeAt(i % secret.length);
        decrypted += String.fromCharCode(char ^ keyChar);
      }
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('🔒 CRYPTO - Erreur déchiffrement:', error);
      return null;
    }
  }, [getClientSecret]);

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
    encrypt,
    decrypt,
    signData,
    verifySignature,
    secureStore,
    secureRetrieve,
    generateSecureToken,
    validateSecureToken
  };
};
