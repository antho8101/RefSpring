
import { useMemo } from 'react';
import { useShortLinks } from './useShortLinks';

export const useTrackingLinkGenerator = () => {
  const { createShortLink } = useShortLinks();

  const generateTrackingLink = useMemo(() => {
    return async (campaignId: string, affiliateId: string, targetUrl: string) => {
      const currentHostname = window.location.hostname;
      let baseUrl;
      
      console.log('🔗 TRACKING LINK GENERATOR - Début génération');
      console.log('🔗 Hostname actuel:', currentHostname);
      
      if (currentHostname.includes('localhost') || currentHostname.includes('lovableproject.com')) {
        baseUrl = window.location.origin;
      } else {
        baseUrl = 'https://refspring.com';
      }
      
      console.log('🔗 Base URL déterminée:', baseUrl);
      
      try {
        console.log('🔗 Tentative création lien court...');
        // Créer un lien court
        const shortCode = await createShortLink(campaignId, affiliateId, targetUrl);
        console.log('✅ Lien court créé:', shortCode);
        const finalLink = `${baseUrl}/s/${shortCode}`;
        console.log('✅ Lien final:', finalLink);
        return finalLink;
      } catch (error) {
        console.error('❌ Erreur création lien court:', error);
        console.log('🔄 Fallback vers lien long...');
        // Fallback vers le lien long en cas d'erreur
        const fallbackLink = `${baseUrl}/track/${campaignId}/${affiliateId}?url=${encodeURIComponent(targetUrl)}`;
        console.log('🔄 Lien fallback:', fallbackLink);
        return fallbackLink;
      }
    };
  }, [createShortLink]);

  return { generateTrackingLink };
};
