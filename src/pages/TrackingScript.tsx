
import { useEffect } from 'react';

const TrackingScript = () => {
  useEffect(() => {
    // Générer le contenu du script tracking.js
    const trackingScript = `
console.log('🔥 RefSpring Tracking Script loaded');

(function() {
  // Configuration
  const REFSPRING_API = '${window.location.origin}';
  
  // Obtenir l'ID de campagne depuis l'attribut data-campaign
  const scriptTag = document.querySelector('script[data-campaign]');
  const campaignId = scriptTag ? scriptTag.getAttribute('data-campaign') : null;
  
  console.log('📊 RefSpring - Campaign ID détecté:', campaignId);
  
  if (!campaignId) {
    console.warn('⚠️ RefSpring - Aucun data-campaign trouvé');
    return;
  }
  
  // Vérifier s'il y a des infos d'affiliation dans le localStorage
  const affiliateData = localStorage.getItem('refspring_affiliate');
  let affiliateId = null;
  
  if (affiliateData) {
    try {
      const data = JSON.parse(affiliateData);
      affiliateId = data.affiliateId;
      console.log('📊 RefSpring - Affiliate ID récupéré du localStorage:', affiliateId);
    } catch (e) {
      console.warn('⚠️ RefSpring - Erreur parsing localStorage:', e);
    }
  }
  
  // Fonction pour enregistrer une page vue
  function trackPageView() {
    if (!affiliateId) {
      console.log('📊 RefSpring - Pas d\\'affilié associé, pas de tracking');
      return;
    }
    
    console.log('📊 RefSpring - Tracking page vue pour affiliate:', affiliateId);
    
    // Simuler l'enregistrement (en réalité, on ferait un appel API)
    fetch(REFSPRING_API + '/api/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        affiliateId: affiliateId,
        campaignId: campaignId,
        url: window.location.href,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      })
    }).then(response => {
      console.log('✅ RefSpring - Page vue enregistrée');
    }).catch(error => {
      console.warn('⚠️ RefSpring - Erreur tracking page vue:', error);
    });
  }
  
  // Fonction pour tracker les conversions
  window.RefSpring = {
    trackConversion: function(amount, commission) {
      if (!affiliateId) {
        console.warn('⚠️ RefSpring - Impossible de tracker conversion: pas d\\'affilié');
        return;
      }
      
      console.log('💰 RefSpring - Tracking conversion:', { amount, commission, affiliateId, campaignId });
      
      fetch(REFSPRING_API + '/api/track-conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          affiliateId: affiliateId,
          campaignId: campaignId,
          amount: amount,
          commission: commission,
          url: window.location.href,
          timestamp: new Date().toISOString()
        })
      }).then(response => {
        console.log('✅ RefSpring - Conversion enregistrée');
      }).catch(error => {
        console.warn('⚠️ RefSpring - Erreur tracking conversion:', error);
      });
    }
  };
  
  // Tracker la page vue au chargement
  trackPageView();
  
  console.log('✅ RefSpring - Script initialisé avec succès');
})();
`;
    
    // Définir le type de contenu et retourner le script
    const response = new Response(trackingScript, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
    // Pour le développement, on affiche juste le script dans la console
    console.log('📄 Contenu tracking.js généré:', trackingScript);
    
  }, []);

  return (
    <div className="p-4">
      <h1>Tracking Script Generator</h1>
      <p>Ce script sera servi dynamiquement via /tracking.js</p>
    </div>
  );
};

export default TrackingScript;
