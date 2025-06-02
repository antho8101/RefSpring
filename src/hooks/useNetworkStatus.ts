
import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  effectiveType: string | null;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isSlowConnection: false,
    effectiveType: null
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      setNetworkStatus({
        isOnline: navigator.onLine,
        isSlowConnection: connection ? connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g' : false,
        effectiveType: connection ? connection.effectiveType : null
      });
    };

    const handleOnline = () => {
      console.log('🌐 Connexion rétablie');
      updateNetworkStatus();
    };

    const handleOffline = () => {
      console.log('🚫 Connexion perdue');
      updateNetworkStatus();
    };

    // Écouter les changements de connexion
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Écouter les changements de type de connexion si disponible
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    // Vérification initiale
    updateNetworkStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  return networkStatus;
};
