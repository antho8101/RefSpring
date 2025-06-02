
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff, Signal } from 'lucide-react';

export const NetworkStatus = () => {
  const { isOnline, isSlowConnection } = useNetworkStatus();

  if (isOnline && !isSlowConnection) {
    return null; // Tout va bien, on n'affiche rien
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {!isOnline ? (
        <Alert variant="destructive" className="rounded-none border-0 border-b">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            Pas de connexion internet. Certaines fonctionnalités peuvent être limitées.
          </AlertDescription>
        </Alert>
      ) : isSlowConnection ? (
        <Alert className="rounded-none border-0 border-b bg-orange-50 border-orange-200">
          <Signal className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Connexion lente détectée. L'application peut être plus lente que d'habitude.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
};
