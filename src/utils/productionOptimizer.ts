/**
 * Optimisations critiques pour la production
 * Nettoyage automatique des logs et optimisations de sécurité
 */

import Logger from './logger';

// Supprime tous les logs en production sauf les erreurs critiques
export const cleanProductionLogs = () => {
  if (import.meta.env.PROD) {
    // Override console en production pour ne garder que les erreurs critiques
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.log = () => {};
    console.info = () => {};
    console.debug = () => {};
    console.warn = (message: any, ...args: any[]) => {
      // Ne conserver que les warnings critiques de sécurité
      if (typeof message === 'string' && (
        message.includes('SECURITY') || 
        message.includes('CRITICAL') ||
        message.includes('BREACH')
      )) {
        originalWarn(message, ...args);
      }
    };
    console.error = (message: any, ...args: any[]) => {
      // Conserver toutes les erreurs mais les nettoyer
      if (typeof message === 'string') {
        // Supprimer les informations sensibles des erreurs
        const cleanMessage = message
          .replace(/user-\w+/g, 'user-***')
          .replace(/campaign-\w+/g, 'campaign-***')
          .replace(/email: [^\s]+/g, 'email: ***')
          .replace(/id: [^\s]+/g, 'id: ***');
        originalError(cleanMessage, ...args);
      } else {
        originalError(message, ...args);
      }
    };
  }
};

// Nettoie les données sensibles des objets avant logging
export const sanitizeLogData = (data: any): any => {
  if (!data) return data;
  
  const sensitiveKeys = [
    'password', 'token', 'secret', 'key', 'authorization', 
    'email', 'phone', 'address', 'ssn', 'creditCard',
    'userId', 'campaignId', 'affiliateId', 'paymentId'
  ];
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = { ...data };
    
    for (const key of Object.keys(sanitized)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '***';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = sanitizeLogData(sanitized[key]);
      }
    }
    
    return sanitized;
  }
  
  return data;
};

// Monitor les performances critiques
export const monitorCriticalPerformance = () => {
  if ('performance' in window) {
    // Monitor les métriques Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          if (navEntry.loadEventEnd - navEntry.loadEventStart > 3000) {
            Logger.warning('Slow page load detected', {
              loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
              page: window.location.pathname
            });
          }
        }
      }
    });
    
    try {
      observer.observe({ entryTypes: ['navigation', 'measure'] });
    } catch (error) {
      Logger.error('Performance monitoring setup failed', error);
    }
  }
};

// Initialise toutes les optimisations de production
export const initProductionOptimizations = () => {
  cleanProductionLogs();
  monitorCriticalPerformance();
  
  // Monitor les erreurs non gérées
  window.addEventListener('error', (event) => {
    Logger.error('Unhandled error', sanitizeLogData({
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    }));
  });
  
  // Monitor les promesses rejetées
  window.addEventListener('unhandledrejection', (event) => {
    Logger.error('Unhandled promise rejection', sanitizeLogData({
      reason: event.reason,
      stack: event.reason?.stack
    }));
  });
  
  Logger.info('Production optimizations initialized');
};