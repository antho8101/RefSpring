
import { useCallback } from 'react';
import { useClientSecret } from './useClientSecret';

export const useEncryption = () => {
  const { getClientSecret } = useClientSecret();

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

  return {
    encrypt,
    decrypt
  };
};
