
import { useCallback } from 'react';

export const useClientSecret = () => {
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

  return {
    getClientSecret
  };
};
