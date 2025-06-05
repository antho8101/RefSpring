
import { useState, useEffect } from 'react';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_CONSENT_KEY = 'refspring_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'refspring_cookie_preferences';

export const useCookieConsent = () => {
  const [hasConsented, setHasConsented] = useState<boolean | null>(null);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Toujours vrai, non modifiable
    analytics: false,
    marketing: false,
  });
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    
    if (consent) {
      setHasConsented(consent === 'true');
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    } else {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    const newPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    
    setHasConsented(true);
    setPreferences(newPreferences);
    setShowBanner(false);
    
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(newPreferences));
    
    // Activer les services externes
    enableAnalytics();
    enableMarketing();
  };

  const acceptNecessaryOnly = () => {
    const newPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    
    setHasConsented(true);
    setPreferences(newPreferences);
    setShowBanner(false);
    
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(newPreferences));
  };

  const updatePreferences = (newPreferences: CookiePreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(newPreferences));
    
    // Activer/désactiver les services selon les préférences
    if (newPreferences.analytics) {
      enableAnalytics();
    } else {
      disableAnalytics();
    }
    
    if (newPreferences.marketing) {
      enableMarketing();
    } else {
      disableMarketing();
    }
  };

  const resetConsent = () => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    localStorage.removeItem(COOKIE_PREFERENCES_KEY);
    setHasConsented(null);
    setShowBanner(true);
    disableAnalytics();
    disableMarketing();
  };

  return {
    hasConsented,
    preferences,
    showBanner,
    acceptAll,
    acceptNecessaryOnly,
    updatePreferences,
    resetConsent,
  };
};

// Fonctions pour gérer les services externes
const enableAnalytics = () => {
  // Activer Google Analytics ou autres services d'analyse
  console.log('Analytics activé');
};

const disableAnalytics = () => {
  // Désactiver Google Analytics
  console.log('Analytics désactivé');
};

const enableMarketing = () => {
  // Activer les cookies marketing
  console.log('Marketing activé');
};

const disableMarketing = () => {
  // Désactiver les cookies marketing
  console.log('Marketing désactivé');
};
