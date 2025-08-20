/**
 * Durcissement de sécurité pour la production
 * Protection contre les attaques courantes et fuites de données
 */

import Logger from './logger';

// Protection contre les attaques XSS
export const enableXSSProtection = () => {
  // Content Security Policy Headers (à configurer côté serveur aussi)
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com https://firebase.googleapis.com";
  document.head.appendChild(meta);

  // Protection contre le clickjacking
  const frameOptions = document.createElement('meta');
  frameOptions.httpEquiv = 'X-Frame-Options';
  frameOptions.content = 'DENY';
  document.head.appendChild(frameOptions);
};

// Nettoyage des données sensibles du DOM
export const sanitizeDOM = () => {
  // Supprimer tous les attributs de débogage en production
  if (import.meta.env.PROD) {
    const elementsWithDataTestId = document.querySelectorAll('[data-testid]');
    elementsWithDataTestId.forEach(element => {
      element.removeAttribute('data-testid');
    });

    const elementsWithDataCy = document.querySelectorAll('[data-cy]');
    elementsWithDataCy.forEach(element => {
      element.removeAttribute('data-cy');
    });
  }
};

// Protection contre l'inspection du code
export const enableDeveloperToolsProtection = () => {
  if (import.meta.env.PROD) {
    // Désactiver le clic droit (peut être contourné mais décourage)
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      Logger.security('Right-click blocked in production');
    });

    // Détecter l'ouverture des outils de développeur
    let devtools = { open: false, orientation: null };
    const threshold = 160;

    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          Logger.security('Developer tools opened detected', {
            userAgent: navigator.userAgent,
            timestamp: Date.now()
          });
          
          // Optionnel: rediriger ou masquer le contenu sensible
          // window.location.href = '/security-warning';
        }
      } else {
        devtools.open = false;
      }
    }, 500);

    // Bloquer les raccourcis clavier de débogage
    document.addEventListener('keydown', (e) => {
      // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
          (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
        Logger.security('Debug shortcut blocked', { key: e.key, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey });
      }
    });
  }
};

// Protection des données en mémoire
export const protectSensitiveData = () => {
  // Override du localStorage pour chiffrer les données sensibles
  const originalSetItem = localStorage.setItem;
  const originalGetItem = localStorage.getItem;

  localStorage.setItem = function(key: string, value: string) {
    if (key.includes('token') || key.includes('secret') || key.includes('key')) {
      Logger.security('Attempt to store sensitive data in localStorage blocked', { key });
      return;
    }
    return originalSetItem.call(this, key, value);
  };

  // Protection contre l'injection de code dans les URLs
  const urlParams = new URLSearchParams(window.location.search);
  for (const [key, value] of urlParams.entries()) {
    if (/<script|javascript:|data:/i.test(value)) {
      Logger.security('Malicious URL parameter detected', { key, value: value.substring(0, 50) });
      urlParams.delete(key);
      const newUrl = window.location.pathname + '?' + urlParams.toString();
      window.history.replaceState({}, '', newUrl);
    }
  }
};

// Surveillance des erreurs de sécurité
export const monitorSecurityEvents = () => {
  // Monitor les tentatives d'accès non autorisé
  window.addEventListener('error', (event) => {
    if (event.message.includes('Permission denied') || 
        event.message.includes('Access denied') ||
        event.message.includes('Unauthorized')) {
      Logger.security('Security-related error detected', {
        message: event.message,
        filename: event.filename,
        line: event.lineno
      });
    }
  });

  // Monitor les tentatives de manipulation du DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.tagName === 'SCRIPT' && !element.hasAttribute('data-allowed')) {
              Logger.security('Unauthorized script injection detected', {
                outerHTML: element.outerHTML.substring(0, 200)
              });
              element.remove();
            }
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};

// Initialisation de toutes les protections de sécurité
export const initSecurityHardening = () => {
  enableXSSProtection();
  sanitizeDOM();
  enableDeveloperToolsProtection();
  protectSensitiveData();
  monitorSecurityEvents();
  
  Logger.security('Security hardening initialized for production');
};