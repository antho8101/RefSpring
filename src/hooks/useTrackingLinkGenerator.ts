
import { useMemo } from 'react';
import { useShortLinks } from './useShortLinks';

export const useTrackingLinkGenerator = () => {
  const { createShortLink } = useShortLinks();

  const generateTrackingLink = useMemo(() => {
    return async (campaignId: string, affiliateId: string, targetUrl: string) => {
      const currentHostname = window.location.hostname;
      let baseUrl;
      
      if (currentHostname.includes('localhost') || currentHostname.includes('lovableproject.com')) {
        baseUrl = window.location.origin;
      } else {
        baseUrl = 'https://refspring.com';
      }
      
      try {
        // Créer un lien court
        const shortCode = await createShortLink(campaignId, affiliateId, targetUrl);
        return `${baseUrl}/s/${shortCode}`;
      } catch (error) {
        console.error('Erreur lors de la création du lien court, utilisation du lien long:', error);
        // Fallback vers le lien long en cas d'erreur
        return `${baseUrl}/track/${campaignId}/${affiliateId}?url=${encodeURIComponent(targetUrl)}`;
      }
    };
  }, [createShortLink]);

  return { generateTrackingLink };
};
