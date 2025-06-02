
import { useEffect } from 'react';

const TrackingJsRoute = () => {
  useEffect(() => {
    // Définir les headers pour servir du JavaScript
    const response = document.querySelector('html');
    if (response) {
      document.querySelector('html')?.setAttribute('data-content-type', 'application/javascript');
    }
  }, []);

  const currentHostname = window.location.hostname;
  const baseUrl = currentHostname.includes('localhost') || currentHostname.includes('lovableproject.com') 
    ? window.location.origin 
    : 'https://refspring.com';

  const trackingScript = `console.log('🔥 RefSpring Tracking Script v1.0 loaded');

(function() {
  const REFSPRING_API = '${baseUrl}';
  
  // Obtenir l'ID de campagne depuis l'attribut data-campaign
  const scriptTag = document.querySelector('script[data-campaign]');
  const campaignId = scriptTag ? scriptTag.getAttribute('data-campaign') : null;
  
  console.log('📊 RefSpring - Campaign ID détecté:', campaignId);
  
  if (!campaignId) {
    console.warn('⚠️ RefSpring - Aucun data-campaign trouvé dans le script');
    return;
  }
  
  // Vérifier les paramètres URL pour détecter l'affiliation
  const urlParams = new URLSearchParams(window.location.search);
  const affiliateFromUrl = urlParams.get('ref') || urlParams.get('affiliate');
  
  // Vérifier le localStorage pour les données d'affiliation persistantes
  let affiliateData = localStorage.getItem('refspring_affiliate');
  let affiliateId = null;
  
  if (affiliateFromUrl) {
    // Nouveau visiteur affilié, stocker les infos
    affiliateId = affiliateFromUrl;
    const data = {
      affiliateId: affiliateId,
      campaignId: campaignId,
      timestamp: new Date().toISOString(),
      source: 'url_param'
    };
    localStorage.setItem('refspring_affiliate', JSON.stringify(data));
    console.log('📊 RefSpring - Nouvel affilié détecté et stocké:', affiliateId);
  } else if (affiliateData) {
    // Visiteur revenant avec données d'affiliation existantes
    try {
      const data = JSON.parse(affiliateData);
      affiliateId = data.affiliateId;
      console.log('📊 RefSpring - Affiliate existant récupéré:', affiliateId);
    } catch (e) {
      console.warn('⚠️ RefSpring - Erreur parsing localStorage:', e);
    }
  }
  
  // Fonction pour enregistrer une page vue
  function trackPageView() {
    if (!affiliateId) {
      console.log('📊 RefSpring - Pas d\\'affilié associé, pas de tracking nécessaire');
      return;
    }
    
    console.log('📊 RefSpring - Tracking page vue pour affiliate:', affiliateId, 'campaign:', campaignId);
    
    // Pour l'instant on log juste, l'API sera implémentée plus tard
    console.log('📊 RefSpring - Page vue trackée:', {
      affiliateId: affiliateId,
      campaignId: campaignId,
      url: window.location.href,
      referrer: document.referrer,
      timestamp: new Date().toISOString()
    });
  }
  
  // API publique pour tracker les conversions
  window.RefSpring = window.RefSpring || {};
  window.RefSpring.trackConversion = function(amount, commission) {
    if (!affiliateId) {
      console.warn('⚠️ RefSpring - Impossible de tracker conversion: pas d\\'affilié associé');
      return false;
    }
    
    console.log('💰 RefSpring - Tracking conversion:', {
      amount: amount,
      commission: commission || (amount * 0.1), // 10% par défaut
      affiliateId: affiliateId,
      campaignId: campaignId,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
    
    // Pour l'instant on log juste, l'API sera implémentée plus tard
    return true;
  };
  
  // Tracker la page vue au chargement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackPageView);
  } else {
    trackPageView();
  }
  
  console.log('✅ RefSpring - Script initialisé avec succès');
  console.log('💡 RefSpring - Utilisez RefSpring.trackConversion(amount, commission) pour tracker les ventes');
})();`;

  return (
    <pre style={{ 
      fontFamily: 'monospace', 
      whiteSpace: 'pre-wrap', 
      margin: 0,
      padding: 0,
      background: 'transparent'
    }}>
      {trackingScript}
    </pre>
  );
};

export default TrackingJsRoute;
