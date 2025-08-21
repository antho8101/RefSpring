
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

  // Détecter l'origine du script (WordPress/Shopify/Standard)
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isWordPress = userAgent.includes('WordPress') || document.querySelector('meta[name="generator"][content*="WordPress"]');
  const isShopify = userAgent.includes('Shopify') || document.querySelector('script[src*="shopify"]') || window.location.hostname.includes('.myshopify.com');
  
  const trackingScript = `console.log('🔥 RefSpring Tracking Script v3.0 ADAPTATIF loaded');
console.log('🔍 RefSpring - Plateforme détectée:', '${isWordPress ? 'WordPress' : isShopify ? 'Shopify' : 'Standard'}');

(function() {
  const REFSPRING_API = '${baseUrl}';
  const PLATFORM = '${isWordPress ? 'wordpress' : isShopify ? 'shopify' : 'standard'}';
  
  ${createCryptoSystem()}
  
  const affiliateDetection = function() {
    ${createAffiliateDetection()}
  };
  
  const detectionResult = affiliateDetection();
  if (!detectionResult) return;
  
  const { affiliateId, campaignId } = detectionResult;
  
  ${createTrackingFunctions()}
  
  ${createSecureAPI()}
  
  // Auto-détection des conversions e-commerce
  function setupEcommerceTracking() {
    if (PLATFORM === 'wordpress') {
      // WooCommerce auto-tracking
      if (window.wc_add_to_cart_params || document.querySelector('.woocommerce')) {
        console.log('🛒 RefSpring - WooCommerce détecté, tracking automatique activé');
        // Observer les événements WooCommerce
        document.addEventListener('wc_checkout_place_order', function() {
          console.log('💰 RefSpring - Commande WooCommerce détectée');
        });
      }
    } else if (PLATFORM === 'shopify') {
      // Shopify auto-tracking
      if (window.Shopify || document.querySelector('[data-shopify]')) {
        console.log('🛒 RefSpring - Shopify détecté, tracking automatique activé');
        // Observer les événements Shopify
        document.addEventListener('page:loaded', function() {
          if (window.location.pathname.includes('/checkouts/') && window.location.search.includes('thank_you=1')) {
            console.log('💰 RefSpring - Commande Shopify détectée');
            // Récupérer le montant depuis Shopify
            if (window.Shopify && window.Shopify.checkout) {
              const amount = window.Shopify.checkout.total_price / 100;
              window.RefSpring.trackConversion(amount);
            }
          }
        });
      }
    }
  }
  
  // Tracker la page vue au chargement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      trackPageView();
      setupEcommerceTracking();
    });
  } else {
    trackPageView();
    setupEcommerceTracking();
  }
  
  console.log('✅ RefSpring - Script ADAPTATIF initialisé avec succès');
  console.log('🔒 RefSpring - Données chiffrées, signatures cryptographiques actives');
  console.log('🛡️ RefSpring - Protection anti-injection console activée');
  console.log('🤖 RefSpring - Auto-tracking e-commerce activé pour', PLATFORM);
  console.log('💡 RefSpring - Utilisez RefSpring.trackConversion(amount) pour tracker les ventes manuelles');
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
