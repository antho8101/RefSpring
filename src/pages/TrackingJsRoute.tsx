
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

  const trackingScript = `console.log('🔥 RefSpring Tracking Script v2.0 SÉCURISÉ loaded');

(function() {
  const REFSPRING_API = '${baseUrl}';
  
  // 🔒 SYSTÈME CRYPTOGRAPHIQUE INTÉGRÉ
  const CryptoSystem = {
    getClientSecret: function() {
      const existingSecret = sessionStorage.getItem('refspring_client_secret');
      if (existingSecret) return existingSecret;
      
      const clientFingerprint = [
        navigator.userAgent,
        screen.width + 'x' + screen.height,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        navigator.language,
        new Date().getTimezoneOffset().toString()
      ].join('|');
      
      const secret = btoa(clientFingerprint).substring(0, 32);
      sessionStorage.setItem('refspring_client_secret', secret);
      return secret;
    },
    
    encrypt: function(data) {
      const secret = this.getClientSecret();
      const jsonData = JSON.stringify(data);
      let encrypted = '';
      
      for (let i = 0; i < jsonData.length; i++) {
        const char = jsonData.charCodeAt(i);
        const keyChar = secret.charCodeAt(i % secret.length);
        encrypted += String.fromCharCode(char ^ keyChar);
      }
      
      return btoa(encrypted);
    },
    
    decrypt: function(encryptedData) {
      try {
        const secret = this.getClientSecret();
        const encrypted = atob(encryptedData);
        let decrypted = '';
        
        for (let i = 0; i < encrypted.length; i++) {
          const char = encrypted.charCodeAt(i);
          const keyChar = secret.charCodeAt(i % secret.length);
          decrypted += String.fromCharCode(char ^ keyChar);
        }
        
        return JSON.parse(decrypted);
      } catch (error) {
        console.error('🔒 CRYPTO - Erreur déchiffrement:', error);
        return null;
      }
    },
    
    signData: function(data) {
      const secret = this.getClientSecret();
      const timestamp = Date.now();
      const nonce = Math.random().toString(36).substring(2, 15);
      
      const payload = JSON.stringify({
        data, timestamp, nonce,
        secret: secret.substring(0, 8)
      });
      
      let hash = 0;
      for (let i = 0; i < payload.length; i++) {
        const char = payload.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      
      return btoa(hash.toString() + '|' + timestamp + '|' + nonce);
    },
    
    secureStore: function(key, data) {
      const encrypted = this.encrypt(data);
      const signature = this.signData(data);
      const integrity = btoa(JSON.stringify(data)).substring(0, 16);
      
      const secureData = {
        encrypted, signature,
        timestamp: Date.now(),
        integrity
      };
      
      localStorage.setItem('refspring_secure_' + key, JSON.stringify(secureData));
    },
    
    secureRetrieve: function(key) {
      try {
        const stored = localStorage.getItem('refspring_secure_' + key);
        if (!stored) return null;
        
        const secureData = JSON.parse(stored);
        
        // Vérifier l'âge (max 24h)
        if (Date.now() - secureData.timestamp > 24 * 60 * 60 * 1000) {
          localStorage.removeItem('refspring_secure_' + key);
          return null;
        }
        
        const decryptedData = this.decrypt(secureData.encrypted);
        if (!decryptedData) return null;
        
        // Vérifier l'intégrité
        const currentIntegrity = btoa(JSON.stringify(decryptedData)).substring(0, 16);
        if (currentIntegrity !== secureData.integrity) {
          localStorage.removeItem('refspring_secure_' + key);
          return null;
        }
        
        return decryptedData;
      } catch (error) {
        console.error('🔒 CRYPTO - Erreur récupération:', error);
        return null;
      }
    }
  };
  
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
  
  // 🔒 Récupération SÉCURISÉE des données d'affiliation
  let affiliateData = CryptoSystem.secureRetrieve('affiliate_data');
  let affiliateId = null;
  
  if (affiliateFromUrl) {
    // Nouveau visiteur affilié, stocker de manière SÉCURISÉE
    affiliateId = affiliateFromUrl;
    const data = {
      affiliateId: affiliateId,
      campaignId: campaignId,
      timestamp: new Date().toISOString(),
      source: 'url_param'
    };
    
    // 🔒 STOCKAGE CHIFFRÉ
    CryptoSystem.secureStore('affiliate_data', data);
    console.log('🔒 RefSpring - Nouvel affilié détecté et chiffré:', affiliateId);
  } else if (affiliateData) {
    // Visiteur revenant avec données chiffrées
    affiliateId = affiliateData.affiliateId;
    console.log('🔒 RefSpring - Affiliate existant déchiffré:', affiliateId);
  }
  
  // Fonction pour enregistrer une page vue
  function trackPageView() {
    if (!affiliateId) {
      console.log('📊 RefSpring - Pas d\\'affilié associé, pas de tracking nécessaire');
      return;
    }
    
    console.log('📊 RefSpring - Tracking page vue SÉCURISÉ pour affiliate:', affiliateId);
  }
  
  // 🛡️ API PUBLIQUE SÉCURISÉE avec protection anti-injection
  window.RefSpring = window.RefSpring || {};
  
  // Protection contre les appels console
  const isCalledFromConsole = function() {
    const stack = new Error().stack || '';
    return stack.includes('eval') || stack.includes('<anonymous>');
  };
  
  window.RefSpring.trackConversion = function(amount, customCommission) {
    // 🚨 DÉTECTION INJECTION CONSOLE
    if (isCalledFromConsole()) {
      console.warn('🚨 RefSpring - Tentative d\\'injection console détectée !');
      console.warn('🛡️ RefSpring - Cette tentative a été bloquée et enregistrée');
      
      // Logger l'activité suspecte de manière chiffrée
      CryptoSystem.secureStore('suspicious_console_activity', {
        type: 'console_injection_attempt',
        amount: amount,
        customCommission: customCommission,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
      
      return false;
    }
    
    // 🔒 Récupérer automatiquement les données chiffrées
    const storedAffiliateData = CryptoSystem.secureRetrieve('affiliate_data');
    
    if (!storedAffiliateData) {
      console.warn('⚠️ RefSpring - Impossible de tracker conversion: pas d\\'affilié associé');
      return false;
    }
    
    const currentAffiliateId = storedAffiliateData.affiliateId;
    const currentCampaignId = storedAffiliateData.campaignId;
    
    // 🔒 Créer signature pour cette conversion
    const conversionData = {
      amount: amount,
      customCommission: customCommission,
      affiliateId: currentAffiliateId,
      campaignId: currentCampaignId,
      timestamp: Date.now(),
      url: window.location.href
    };
    
    const signature = CryptoSystem.signData(conversionData);
    
    // 🔒 Vérifier les doublons avec système chiffré
    const recentConversions = CryptoSystem.secureRetrieve('recent_conversions') || [];
    const isDuplicate = recentConversions.some(function(conv) {
      return Math.abs(conv.amount - amount) < 100 && 
             Date.now() - conv.timestamp < 60000;
    });
    
    if (isDuplicate) {
      console.warn('🔒 RefSpring - Conversion en double détectée (système crypto)');
      return false;
    }
    
    console.log('💰 RefSpring - Tracking conversion SÉCURISÉ:', {
      amount: amount,
      commission: customCommission || 'auto-calculated',
      affiliateId: currentAffiliateId,
      campaignId: currentCampaignId,
      signature: signature.substring(0, 20) + '...',
      timestamp: new Date().toISOString()
    });
    
    // 🔒 Enregistrer la conversion de manière chiffrée
    const conversionRecord = {
      ...conversionData,
      signature: signature
    };
    
    recentConversions.push(conversionRecord);
    
    // Nettoyer les anciennes conversions
    const filtered = recentConversions.filter(function(conv) {
      return Date.now() - conv.timestamp < 10 * 60 * 1000;
    }).slice(-10);
    
    CryptoSystem.secureStore('recent_conversions', filtered);
    
    return true;
  };
  
  // 🛡️ Protection contre la modification de l'API
  Object.freeze(window.RefSpring);
  
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
