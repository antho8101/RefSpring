
import { useState, useEffect } from 'react';

// Type declaration for gtag function
declare global {
  interface Window {
    gtag: (command: string, action: string, parameters?: any) => void;
  }
}

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

export interface CookieOptions {
  strictMode: boolean;
  autoExpiry: boolean;
  trackingOptOut: boolean;
}

const COOKIE_CONSENT_KEY = 'refspring_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'refspring_cookie_preferences';
const COOKIE_TIMESTAMP_KEY = 'refspring_cookie_timestamp';
const COOKIE_OPTIONS_KEY = 'refspring_cookie_options';

// Les cookies expirent après 1 an par défaut
const COOKIE_EXPIRY_DAYS = 365;

export const useCookieConsent = () => {
  const [hasConsented, setHasConsented] = useState<boolean | null>(null);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    personalization: false,
  });
  const [options, setOptions] = useState<CookieOptions>({
    strictMode: false,
    autoExpiry: true,
    trackingOptOut: false,
  });
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    const savedOptions = localStorage.getItem(COOKIE_OPTIONS_KEY);
    const timestamp = localStorage.getItem(COOKIE_TIMESTAMP_KEY);
    
    // Charger les options sauvegardées
    if (savedOptions) {
      const parsedOptions = JSON.parse(savedOptions);
      setOptions(parsedOptions);
    }
    
    // Vérifier si le consentement a expiré
    if (timestamp && options.autoExpiry) {
      const consentDate = new Date(timestamp);
      const now = new Date();
      const daysSinceConsent = (now.getTime() - consentDate.getTime()) / (1000 * 3600 * 24);
      
      if (daysSinceConsent > COOKIE_EXPIRY_DAYS) {
        resetConsent();
        return;
      }
    }
    
    if (consent) {
      setHasConsented(consent === 'true');
      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(parsed);
        applyPreferences(parsed);
      }
    } else {
      setShowBanner(true);
    }
  }, [options.autoExpiry]);

  const saveConsent = (newPreferences: CookiePreferences, newOptions?: CookieOptions) => {
    setHasConsented(true);
    setPreferences(newPreferences);
    if (newOptions) {
      setOptions(newOptions);
    }
    setShowBanner(false);
    
    const timestamp = new Date().toISOString();
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(newPreferences));
    localStorage.setItem(COOKIE_TIMESTAMP_KEY, timestamp);
    if (newOptions) {
      localStorage.setItem(COOKIE_OPTIONS_KEY, JSON.stringify(newOptions));
    }
    
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

  const updatePreferences = (newPreferences: CookiePreferences, newOptions?: CookieOptions) => {
    setPreferences(newPreferences);
    if (newOptions) {
      setOptions(newOptions);
    }
    
    const timestamp = new Date().toISOString();
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(newPreferences));
    localStorage.setItem(COOKIE_TIMESTAMP_KEY, timestamp);
    if (newOptions) {
      localStorage.setItem(COOKIE_OPTIONS_KEY, JSON.stringify(newOptions));
    }
    
    applyPreferences(newPreferences);
  };

  const resetConsent = () => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    localStorage.removeItem(COOKIE_PREFERENCES_KEY);
    localStorage.removeItem(COOKIE_TIMESTAMP_KEY);
    localStorage.removeItem(COOKIE_OPTIONS_KEY);
    setHasConsented(null);
    setShowBanner(true);
    
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

  const getExpiryDate = () => {
    const timestamp = getConsentTimestamp();
    if (timestamp) {
      const expiryDate = new Date(timestamp);
      expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS);
      return expiryDate;
    }
    return null;
  };

  return {
    hasConsented,
    preferences,
    options,
    showBanner,
    acceptAll,
    acceptNecessaryOnly,
    updatePreferences,
    resetConsent,
    getConsentTimestamp,
    getExpiryDate,
  };
};

// Fonctions pour gérer les services externes
const enableAnalytics = () => {
  console.log('Analytics activé - Google Analytics, Hotjar, etc.');
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      'analytics_storage': 'granted'
    });
  }
};

const disableAnalytics = () => {
  console.log('Analytics désactivé');
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      'analytics_storage': 'denied'
    });
  }
};

const enableMarketing = () => {
  console.log('Marketing activé - Facebook Pixel, Google Ads, etc.');
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      'ad_storage': 'granted'
    });
  }
};

const disableMarketing = () => {
  console.log('Marketing désactivé');
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
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
