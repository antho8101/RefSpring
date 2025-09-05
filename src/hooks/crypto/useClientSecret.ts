
import { useCallback } from 'react';

export const useClientSecret = () => {
  // 🔐 Clé secrète générée dynamiquement (côté client)
  const getClientSecret = useCallback((): string => {
    const existingSecret = sessionStorage.getItem('refspring_client_secret');
    if (existingSecret) {
      return existingSecret;
    }
    
    // Secure client fingerprinting with additional entropy
    const entropy = new Uint8Array(16);
    crypto.getRandomValues(entropy);
    
    const clientFingerprint = [
      navigator.userAgent,
      screen.width + 'x' + screen.height,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.language,
      new Date().getTimezoneOffset().toString(),
      Array.from(entropy).map(b => b.toString(16).padStart(2, '0')).join('')
    ].join('|');
    
    const secret = btoa(clientFingerprint).substring(0, 32);
    sessionStorage.setItem('refspring_client_secret', secret);
    return secret;
  }, []);

  return {
    getClientSecret
  };
};
