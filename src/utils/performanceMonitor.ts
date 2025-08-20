/**
 * Monitoring des performances critiques pour RefSpring
 * Surveillance en temps réel des métriques importantes
 */

import Logger from './logger';

interface PerformanceThresholds {
  pageLoadTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  bundleSize: number;
}

const THRESHOLDS: PerformanceThresholds = {
  pageLoadTime: 3000, // 3 secondes
  apiResponseTime: 2000, // 2 secondes
  memoryUsage: 100, // 100MB
  bundleSize: 1000000 // 1MB
};

// Monitor les performances de chargement
export const monitorPagePerformance = () => {
  if ('performance' in window && 'PerformanceObserver' in window) {
    // Navigation timing
    const navObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          const loadTime = navEntry.loadEventEnd - navEntry.loadEventStart;
          
          if (loadTime > THRESHOLDS.pageLoadTime) {
            Logger.warning('Slow page load detected', {
              loadTime,
              page: window.location.pathname,
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              ttfb: navEntry.responseStart - navEntry.requestStart
            });
          }
        }
      }
    });

    // Paint timing
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          const fcp = entry.startTime;
          if (fcp > 1500) {
            Logger.warning('Slow First Contentful Paint', {
              fcp,
              page: window.location.pathname
            });
          }
        }
      }
    });

    try {
      navObserver.observe({ entryTypes: ['navigation'] });
      paintObserver.observe({ entryTypes: ['paint'] });
    } catch (error) {
      Logger.error('Performance observer setup failed', error);
    }
  }
};

// Monitor les appels API
export const monitorAPIPerformance = () => {
  const originalFetch = window.fetch;
  
  window.fetch = async function(...args) {
    const startTime = performance.now();
    const url = args[0] as string;
    
    try {
      const response = await originalFetch.apply(this, args);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Log des appels API lents
      if (duration > THRESHOLDS.apiResponseTime) {
        Logger.warning('Slow API call detected', {
          url: typeof url === 'string' ? url.replace(/user-\w+|campaign-\w+/g, '***') : 'Unknown',
          duration,
          status: response.status
        });
      }
      
      // Monitor les erreurs API
      if (!response.ok) {
        Logger.error('API call failed', {
          url: typeof url === 'string' ? url.replace(/user-\w+|campaign-\w+/g, '***') : 'Unknown',
          status: response.status,
          statusText: response.statusText
        });
      }
      
      return response;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      Logger.error('API call error', {
        url: typeof url === 'string' ? url.replace(/user-\w+|campaign-\w+/g, '***') : 'Unknown',
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  };
};

// Monitor l'utilisation mémoire
export const monitorMemoryUsage = () => {
  if ('memory' in performance) {
    const checkMemory = () => {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      
      if (usedMB > THRESHOLDS.memoryUsage) {
        Logger.warning('High memory usage detected', {
          usedMB: Math.round(usedMB),
          totalMB: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          limitMB: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
        });
      }
    };
    
    // Vérifier toutes les 30 secondes
    setInterval(checkMemory, 30000);
    
    // Vérification initiale après 10 secondes
    setTimeout(checkMemory, 10000);
  }
};

// Monitor les erreurs critiques
export const monitorCriticalErrors = () => {
  // Erreurs non gérées
  window.addEventListener('error', (event) => {
    Logger.error('Unhandled error', {
      message: event.message,
      filename: event.filename?.replace(/.*\//, '') || 'unknown',
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack?.split('\n').slice(0, 3).join('\n') || 'No stack trace'
    });
  });

  // Promesses rejetées
  window.addEventListener('unhandledrejection', (event) => {
    Logger.error('Unhandled promise rejection', {
      reason: event.reason instanceof Error ? event.reason.message : String(event.reason),
      stack: event.reason?.stack?.split('\n').slice(0, 3).join('\n') || 'No stack trace'
    });
  });
};

// Monitor les métriques Firebase
export const monitorFirebasePerformance = () => {
  // Wrapper pour les opérations Firestore
  const monitorFirestoreQuery = (operationType: string, collectionName: string) => {
    const startTime = performance.now();
    
    return {
      end: (success: boolean, resultCount?: number) => {
        const duration = performance.now() - startTime;
        
        if (duration > 1000) { // Plus de 1 seconde
          Logger.warning('Slow Firestore operation', {
            operation: operationType,
            collection: collectionName,
            duration: Math.round(duration),
            success,
            resultCount
          });
        }
      }
    };
  };
  
  return { monitorFirestoreQuery };
};

// Rapport de performance périodique
export const generatePerformanceReport = () => {
  const getPageMetrics = () => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        loadTime: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
        ttfb: Math.round(navigation.responseStart - navigation.requestStart),
        fcp: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        lcp: 0 // À implémenter avec web-vitals
      };
    }
    return null;
  };
  
  // Rapport toutes les 5 minutes
  setInterval(() => {
    const metrics = getPageMetrics();
    if (metrics) {
      Logger.info('Performance report', {
        page: window.location.pathname,
        ...metrics,
        timestamp: new Date().toISOString()
      });
    }
  }, 300000); // 5 minutes
};

// Initialisation complète du monitoring
export const initPerformanceMonitoring = () => {
  monitorPagePerformance();
  monitorAPIPerformance();
  monitorMemoryUsage();
  monitorCriticalErrors();
  generatePerformanceReport();
  
  Logger.info('Performance monitoring initialized');
  
  return monitorFirebasePerformance();
};