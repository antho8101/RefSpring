
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
      console.log('🔗 Paramètres reçus:', { campaignId, affiliateId, targetUrl });
      
      if (currentHostname.includes('localhost') || currentHostname.includes('lovableproject.com')) {
        baseUrl = window.location.origin;
      } else {
        baseUrl = 'https://refspring.com';
      }
      
      console.log('🔗 Base URL déterminée:', baseUrl);
      
      try {
        console.log('🔗 Tentative création lien court...');
        
        // Ajouter les paramètres d'affiliation à l'URL de destination
        const url = new URL(targetUrl);
        url.searchParams.set('ref', affiliateId);
        url.searchParams.set('campaign', campaignId);
        const enhancedTargetUrl = url.toString();
        
        console.log('🔗 URL ORIGINALE:', targetUrl);
        console.log('🔗 URL ENRICHIE avec paramètres affiliation:', enhancedTargetUrl);
        console.log('🔗 Paramètre ref ajouté:', url.searchParams.get('ref'));
        console.log('🔗 Paramètre campaign ajouté:', url.searchParams.get('campaign'));
        
        // Créer un lien court avec l'URL enrichie
        const shortCode = await createShortLink(campaignId, affiliateId, enhancedTargetUrl);
        console.log('✅ Lien court créé:', shortCode);
        const finalLink = `${baseUrl}/s/${shortCode}`;
        console.log('✅ Lien final:', finalLink);
        console.log('🔍 VÉRIFICATION: Le lien court devrait rediriger vers:', enhancedTargetUrl);
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
