
import { useMemo } from 'react';

export const useTrackingLinkGenerator = () => {
  const generateTrackingLink = useMemo(() => {
    return (campaignId: string, affiliateId: string, targetUrl: string) => {
      const currentHostname = window.location.hostname;
      let baseUrl;
      
      if (currentHostname.includes('localhost') || currentHostname.includes('lovableproject.com')) {
        baseUrl = window.location.origin;
      } else {
        baseUrl = 'https://refspring.com';
      }
      
      // IMPORTANT: Toujours ajouter le paramètre url avec l'URL de destination
      return `${baseUrl}/track/${campaignId}/${affiliateId}?url=${encodeURIComponent(targetUrl)}`;
    };
  }, []);

  return { generateTrackingLink };
};
