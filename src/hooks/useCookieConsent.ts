
import { useState, useEffect } from 'react';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

const COOKIE_CONSENT_KEY = 'refspring_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'refspring_cookie_preferences';
const COOKIE_TIMESTAMP_KEY = 'refspring_cookie_timestamp';

// Les cookies expirent après 1 an
const COOKIE_EXPIRY_DAYS = 365;

export const useCookieConsent = () => {
  const [hasConsented, setHasConsented] = useState<boolean | null>(null);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Toujours vrai, non modifiable
    analytics: false,
    marketing: false,
    personalization: false,
  });
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    const timestamp = localStorage.getItem(COOKIE_TIMESTAMP_KEY);
    
    // Vérifier si le consentement a expiré
    if (timestamp) {
      const consentDate = new Date(timestamp);
      const now = new Date();
      const daysSinceConsent = (now.getTime() - consentDate.getTime()) / (1000 * 3600 * 24);
      
      if (daysSinceConsent > COOKIE_EXPIRY_DAYS) {
        // Le consentement a expiré, demander à nouveau
        resetConsent();
        return;
      }
    }
    
    if (consent) {
      setHasConsented(consent === 'true');
      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(parsed);
        // Appliquer les préférences sauvegardées
        applyPreferences(parsed);
      }
    } else {
      setShowBanner(true);
    }
  }, []);

  const saveConsent = (newPreferences: CookiePreferences) => {
    setHasConsented(true);
    setPreferences(newPreferences);
    setShowBanner(false);
    
    const timestamp = new Date().toISOString();
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(newPreferences));
    localStorage.setItem(COOKIE_TIMESTAMP_KEY, timestamp);
    
    applyPreferences(newPreferences);
  };

  const acceptAll = () => {
    const newPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true,
    };
    
    saveConsent(newPreferences);
  };

  const acceptNecessaryOnly = () => {
    const newPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false,
    };
    
    saveConsent(newPreferences);
  };

  const updatePreferences = (newPreferences: CookiePreferences) => {
    setPreferences(newPreferences);
    const timestamp = new Date().toISOString();
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(newPreferences));
    localStorage.setItem(COOKIE_TIMESTAMP_KEY, timestamp);
    
    applyPreferences(newPreferences);
  };

  const resetConsent = () => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    localStorage.removeItem(COOKIE_PREFERENCES_KEY);
    localStorage.removeItem(COOKIE_TIMESTAMP_KEY);
    setHasConsented(null);
    setShowBanner(true);
    
    // Désactiver tous les services
    disableAllServices();
  };

  const applyPreferences = (prefs: CookiePreferences) => {
    if (prefs.analytics) {
      enableAnalytics();
    } else {
      disableAnalytics();
    }
    
    if (prefs.marketing) {
      enableMarketing();
    } else {
      disableMarketing();
    }
    
    if (prefs.personalization) {
      enablePersonalization();
    } else {
      disablePersonalization();
    }
  };

  const getConsentTimestamp = () => {
    const timestamp = localStorage.getItem(COOKIE_TIMESTAMP_KEY);
    return timestamp ? new Date(timestamp) : null;
  };

  return {
    hasConsented,
    preferences,
    showBanner,
    acceptAll,
    acceptNecessaryOnly,
    updatePreferences,
    resetConsent,
    getConsentTimestamp,
  };
};

// Fonctions pour gérer les services externes
const enableAnalytics = () => {
  console.log('Analytics activé - Google Analytics, Hotjar, etc.');
  // Activer Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('consent', 'update', {
      'analytics_storage': 'granted'
    });
  }
};

const disableAnalytics = () => {
  console.log('Analytics désactivé');
  if (typeof gtag !== 'undefined') {
    gtag('consent', 'update', {
      'analytics_storage': 'denied'
    });
  }
};

const enableMarketing = () => {
  console.log('Marketing activé - Facebook Pixel, Google Ads, etc.');
  if (typeof gtag !== 'undefined') {
    gtag('consent', 'update', {
      'ad_storage': 'granted'
    });
  }
};

const disableMarketing = () => {
  console.log('Marketing désactivé');
  if (typeof gtag !== 'undefined') {
    gtag('consent', 'update', {
      'ad_storage': 'denied'
    });
  }
};

const enablePersonalization = () => {
  console.log('Personnalisation activée - Recommandations, préférences UI, etc.');
};

const disablePersonalization = () => {
  console.log('Personnalisation désactivée');
};

const disableAllServices = () => {
  disableAnalytics();
  disableMarketing();
  disablePersonalization();
};
