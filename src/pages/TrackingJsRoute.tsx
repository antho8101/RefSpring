
import { useEffect } from 'react';
import { createCryptoSystem } from '@/components/tracking/CryptoSystem';
import { createAffiliateDetection } from '@/components/tracking/AffiliateDetection';
import { createTrackingFunctions } from '@/components/tracking/TrackingFunctions';
import { createSecureAPI } from '@/components/tracking/SecureAPI';

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

  const trackingScript = `console.log('🔥 RefSpring Tracking Script v2.0 SÉCURISÉ loaded');

(function() {
  const REFSPRING_API = '${baseUrl}';
  
  ${createCryptoSystem()}
  
  const affiliateDetection = function() {
    ${createAffiliateDetection()}
  };
  
  const detectionResult = affiliateDetection();
  if (!detectionResult) return;
  
  const { affiliateId, campaignId } = detectionResult;
  
  ${createTrackingFunctions()}
  
  ${createSecureAPI()}
  
  // Tracker la page vue au chargement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackPageView);
  } else {
    trackPageView();
  }
  
  console.log('✅ RefSpring - Script SÉCURISÉ initialisé avec succès');
  console.log('🔒 RefSpring - Données chiffrées, signatures cryptographiques actives');
  console.log('🛡️ RefSpring - Protection anti-injection console activée');
  console.log('💡 RefSpring - Utilisez RefSpring.trackConversion(amount) pour tracker les ventes');
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
