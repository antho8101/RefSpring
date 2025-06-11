
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
      
      // Vérifier d'abord que l'URL de destination est valide
      if (!targetUrl || !targetUrl.startsWith('http')) {
        console.error('❌ URL de destination invalide:', targetUrl);
        throw new Error('URL de destination invalide');
      }
      
      try {
        console.log('🔗 Tentative création lien court...');
        
        // Ajouter les paramètres d'affiliation à l'URL de destination
        const url = new URL(targetUrl);
        url.searchParams.set('ref', affiliateId);
        url.searchParams.set('campaign', campaignId);
        const enhancedTargetUrl = url.toString();
        
        console.log('🔗 URL ORIGINALE:', targetUrl);
        console.log('🔗 URL ENRICHIE avec paramètres affiliation:', enhancedTargetUrl);
        
        // Créer un lien court avec l'URL enrichie
        const shortCode = await createShortLink(campaignId, affiliateId, enhancedTargetUrl);
        
        if (!shortCode) {
          console.warn('⚠️ Échec création lien court, génération lien direct avec paramètres');
          // Fallback: créer un lien direct avec les paramètres
          const fallbackUrl = new URL('/track', baseUrl);
          fallbackUrl.searchParams.set('c', campaignId);
          fallbackUrl.searchParams.set('a', affiliateId);
          fallbackUrl.searchParams.set('u', encodeURIComponent(targetUrl));
          return fallbackUrl.toString();
        }
        
        console.log('✅ Lien court créé avec succès:', shortCode);
        const finalLink = `${baseUrl}/s/${shortCode}`;
        console.log('✅ Lien final généré:', finalLink);
        
        return finalLink;
        
      } catch (error) {
        console.error('❌ Erreur création lien court:', error);
        
        // Fallback robuste : créer un lien de tracking direct
        console.log('🔄 Utilisation du fallback de tracking direct');
        try {
          const fallbackUrl = new URL('/track', baseUrl);
          fallbackUrl.searchParams.set('c', campaignId);
          fallbackUrl.searchParams.set('a', affiliateId);
          fallbackUrl.searchParams.set('u', encodeURIComponent(targetUrl));
          
          const directLink = fallbackUrl.toString();
          console.log('✅ Lien de fallback généré:', directLink);
          return directLink;
        } catch (fallbackError) {
          console.error('❌ Échec complet génération lien:', fallbackError);
          throw new Error('Impossible de générer un lien de tracking');
        }
      }
    };
  }, [createShortLink]);

  return { generateTrackingLink };
};
