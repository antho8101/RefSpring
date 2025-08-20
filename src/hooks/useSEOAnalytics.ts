/**
 * 🎯 ENTERPRISE SEO ANALYTICS & MONITORING
 * Système de monitoring SEO temps réel niveau enterprise
 */

import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Types pour analytics SEO enterprise
interface SEOAnalytics {
  pageViews: number;
  organicTraffic: number;
  avgTimeOnPage: number;
  bounceRate: number;
  conversionRate: number;
  searchImpressions: number;
  avgPosition: number;
  clickThroughRate: number;
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
    ttfb: number;
  };
  seoScore: number;
  issues: string[];
  opportunities: string[];
}

interface KeywordPerformance {
  keyword: string;
  position: number;
  impressions: number;
  clicks: number;
  ctr: number;
  difficulty: number;
  searchVolume: number;
  trend: 'up' | 'down' | 'stable';
}

interface CompetitorAnalysis {
  competitor: string;
  domain: string;
  organicKeywords: number;
  organicTraffic: number;
  backlinks: number;
  domainAuthority: number;
  commonKeywords: string[];
  gapKeywords: string[];
}

/**
 * Hook pour analytics SEO en temps réel
 */
export const useSEOAnalytics = () => {
  const location = useLocation();
  const [analytics, setAnalytics] = useState<SEOAnalytics | null>(null);
  const [keywords, setKeywords] = useState<KeywordPerformance[]>([]);
  const [competitors, setCompetitors] = useState<CompetitorAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  // Collecter les métriques en temps réel
  const collectMetrics = useCallback(async () => {
    try {
      setLoading(true);
      
      // Métriques Core Web Vitals
      const webVitals = await measureCoreWebVitals();
      
      // Score SEO de la page actuelle
      const seoScore = calculatePageSEOScore();
      
      // Détection automatique des problèmes
      const issues = await detectSEOIssues();
      
      // Opportunités d'optimisation
      const opportunities = await identifyOpportunities();
      
      // Simuler des données analytics (en production: intégration GA4/GSC)
      const analyticsData: SEOAnalytics = {
        pageViews: Math.floor(Math.random() * 10000) + 1000,
        organicTraffic: Math.floor(Math.random() * 5000) + 500,
        avgTimeOnPage: Math.floor(Math.random() * 300) + 60,
        bounceRate: Math.floor(Math.random() * 40) + 20,
        conversionRate: Math.floor(Math.random() * 10) + 2,
        searchImpressions: Math.floor(Math.random() * 50000) + 5000,
        avgPosition: Math.floor(Math.random() * 20) + 5,
        clickThroughRate: Math.floor(Math.random() * 15) + 3,
        coreWebVitals: webVitals,
        seoScore,
        issues,
        opportunities
      };
      
      setAnalytics(analyticsData);
      
      // Données keywords performance
      const keywordData = await fetchKeywordPerformance();
      setKeywords(keywordData);
      
      // Analyse concurrentielle
      const competitorData = await fetchCompetitorAnalysis();
      setCompetitors(competitorData);
      
    } catch (error) {
      console.error('🔍 SEO Analytics Error:', error);
    } finally {
      setLoading(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    collectMetrics();
    
    // Rafraîchir les métriques toutes les 5 minutes
    const interval = setInterval(collectMetrics, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [collectMetrics]);

  return {
    analytics,
    keywords,
    competitors,
    loading,
    refresh: collectMetrics
  };
};

/**
 * Mesurer les Core Web Vitals en temps réel
 */
const measureCoreWebVitals = async (): Promise<SEOAnalytics['coreWebVitals']> => {
  return new Promise((resolve) => {
    const metrics = {
      lcp: 0,
      fid: 0,
      cls: 0,
      fcp: 0,
      ttfb: 0
    };

    // LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      metrics.lcp = lastEntry.startTime;
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // FID (First Input Delay) 
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        metrics.fid = entry.processingStart - entry.startTime;
      });
    });
    fidObserver.observe({ type: 'first-input', buffered: true });

    // CLS (Cumulative Layout Shift)
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      metrics.cls = clsValue;
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    // FCP (First Contentful Paint)
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          metrics.fcp = entry.startTime;
        }
      });
    });
    fcpObserver.observe({ type: 'paint', buffered: true });

    // TTFB (Time to First Byte)
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navEntry) {
      metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
    }

    setTimeout(() => {
      resolve(metrics);
    }, 1000);
  });
};

/**
 * Calculer le score SEO de la page actuelle
 */
const calculatePageSEOScore = (): number => {
  let score = 0;
  const checks = [
    // Title optimization
    { 
      test: () => {
        const title = document.title;
        return title.length >= 30 && title.length <= 60;
      }, 
      points: 15 
    },
    
    // Meta description
    { 
      test: () => {
        const desc = document.querySelector('meta[name="description"]')?.getAttribute('content');
        return desc && desc.length >= 140 && desc.length <= 160;
      }, 
      points: 15 
    },
    
    // H1 tag
    { 
      test: () => document.querySelectorAll('h1').length === 1, 
      points: 10 
    },
    
    // Images with alt
    { 
      test: () => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.every(img => img.hasAttribute('alt'));
      }, 
      points: 10 
    },
    
    // Internal links
    { 
      test: () => document.querySelectorAll('a[href^="/"], a[href^="https://refspring.com"]').length >= 3, 
      points: 8 
    },
    
    // Canonical URL
    { 
      test: () => !!document.querySelector('link[rel="canonical"]'), 
      points: 7 
    },
    
    // Open Graph
    { 
      test: () => !!document.querySelector('meta[property="og:title"]'), 
      points: 8 
    },
    
    // Schema.org
    { 
      test: () => !!document.querySelector('script[type="application/ld+json"]'), 
      points: 10 
    },
    
    // Mobile viewport
    { 
      test: () => !!document.querySelector('meta[name="viewport"]'), 
      points: 5 
    },
    
    // SSL (always true in modern browsers)
    { 
      test: () => location.protocol === 'https:', 
      points: 5 
    },
    
    // Page speed (simplified check)
    { 
      test: () => performance.now() < 2000, 
      points: 7 
    }
  ];

  checks.forEach(check => {
    try {
      if (check.test()) {
        score += check.points;
      }
    } catch (error) {
      console.warn('SEO check failed:', error);
    }
  });

  return Math.min(score, 100);
};

/**
 * Détecter automatiquement les problèmes SEO
 */
const detectSEOIssues = async (): Promise<string[]> => {
  const issues: string[] = [];

  // Vérifier le titre
  const title = document.title;
  if (!title) issues.push('❌ Titre manquant');
  else if (title.length < 30) issues.push('⚠️ Titre trop court (< 30 caractères)');
  else if (title.length > 60) issues.push('⚠️ Titre trop long (> 60 caractères)');

  // Vérifier la description
  const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
  if (!description) issues.push('❌ Meta description manquante');
  else if (description.length < 140) issues.push('⚠️ Description trop courte (< 140 caractères)');
  else if (description.length > 160) issues.push('⚠️ Description trop longue (> 160 caractères)');

  // Vérifier les H1
  const h1Tags = document.querySelectorAll('h1');
  if (h1Tags.length === 0) issues.push('❌ Aucun titre H1 trouvé');
  else if (h1Tags.length > 1) issues.push('⚠️ Plusieurs H1 détectés');

  // Vérifier les images
  const imagesWithoutAlt = Array.from(document.querySelectorAll('img')).filter(img => !img.hasAttribute('alt'));
  if (imagesWithoutAlt.length > 0) {
    issues.push(`⚠️ ${imagesWithoutAlt.length} image(s) sans attribut alt`);
  }

  // Vérifier les liens internes
  const internalLinks = document.querySelectorAll('a[href^="/"], a[href^="https://refspring.com"]');
  if (internalLinks.length < 3) {
    issues.push('⚠️ Peu de liens internes (< 3)');
  }

  // Vérifier le canonical
  if (!document.querySelector('link[rel="canonical"]')) {
    issues.push('❌ URL canonique manquante');
  }

  // Vérifier les Core Web Vitals
  const vitals = await measureCoreWebVitals();
  if (vitals.lcp > 2500) issues.push('🐌 LCP trop lent (> 2.5s)');
  if (vitals.fid > 100) issues.push('🐌 FID trop lent (> 100ms)');
  if (vitals.cls > 0.1) issues.push('🔄 CLS trop élevé (> 0.1)');

  return issues;
};

/**
 * Identifier les opportunités d'optimisation
 */
const identifyOpportunities = async (): Promise<string[]> => {
  const opportunities: string[] = [];

  // Analyse du contenu
  const textContent = document.body.textContent || '';
  const wordCount = textContent.split(/\s+/).length;

  if (wordCount < 300) {
    opportunities.push('📝 Enrichir le contenu (< 300 mots)');
  }

  // Vérifier les données structurées
  const schemaScripts = document.querySelectorAll('script[type="application/ld+json"]');
  if (schemaScripts.length === 0) {
    opportunities.push('📊 Ajouter des données structurées');
  }

  // Vérifier Open Graph
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (!ogImage) {
    opportunities.push('🖼️ Ajouter une image Open Graph');
  }

  // Vérifier la hiérarchie des titres
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  if (headings.length < 3) {
    opportunities.push('🏷️ Structurer avec plus de sous-titres');
  }

  // Vérifier les mots-clés dans l'URL
  const pathname = window.location.pathname;
  if (!pathname.includes('-') && pathname !== '/') {
    opportunities.push('🔗 Optimiser l\'URL avec des mots-clés');
  }

  // Vérifier la présence de CTA
  const ctaButtons = document.querySelectorAll('button, .btn, [role="button"]');
  if (ctaButtons.length < 2) {
    opportunities.push('🎯 Ajouter plus d\'appels à l\'action');
  }

  // Opportunités de maillage interne
  const currentPage = window.location.pathname;
  const suggestedLinks = getSuggestedInternalLinks(currentPage);
  if (suggestedLinks.length > 0) {
    opportunities.push(`🔗 Ajouter des liens vers: ${suggestedLinks.slice(0, 3).join(', ')}`);
  }

  return opportunities;
};

/**
 * Suggérer des liens internes pertinents
 */
const getSuggestedInternalLinks = (currentPath: string): string[] => {
  const linkSuggestions: Record<string, string[]> = {
    '/': ['Dashboard', 'Pricing', 'Features'],
    '/dashboard': ['Campaigns', 'Stats', 'Affiliates'],
    '/pricing': ['Features', 'FAQ', 'Contact'],
    '/features': ['Pricing', 'Dashboard', 'API'],
    '/blog': ['Guides', 'Tutorials', 'Resources']
  };

  return linkSuggestions[currentPath] || ['Homepage', 'Features', 'Pricing'];
};

/**
 * Fetch keyword performance (simulation)
 */
const fetchKeywordPerformance = async (): Promise<KeywordPerformance[]> => {
  // En production: intégration Google Search Console API
  const keywords = [
    'programme affiliation',
    'plateforme affiliation',
    'tracking affiliation',
    'commission vente',
    'marketing affiliation'
  ];

  return keywords.map(keyword => ({
    keyword,
    position: Math.floor(Math.random() * 20) + 1,
    impressions: Math.floor(Math.random() * 10000) + 1000,
    clicks: Math.floor(Math.random() * 500) + 50,
    ctr: Math.floor(Math.random() * 15) + 2,
    difficulty: Math.floor(Math.random() * 60) + 20,
    searchVolume: Math.floor(Math.random() * 5000) + 500,
    trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any
  }));
};

/**
 * Fetch competitor analysis (simulation)
 */
const fetchCompetitorAnalysis = async (): Promise<CompetitorAnalysis[]> => {
  // En production: intégration Semrush/Ahrefs API
  const competitors = [
    'affily.io',
    'rewardful.com',
    'referralcandy.com',
    'postaffiliatepro.com'
  ];

  return competitors.map(domain => ({
    competitor: domain.split('.')[0],
    domain,
    organicKeywords: Math.floor(Math.random() * 5000) + 1000,
    organicTraffic: Math.floor(Math.random() * 50000) + 10000,
    backlinks: Math.floor(Math.random() * 10000) + 1000,
    domainAuthority: Math.floor(Math.random() * 40) + 40,
    commonKeywords: ['affiliation', 'tracking', 'commission'].slice(0, Math.floor(Math.random() * 3) + 1),
    gapKeywords: ['programme partenaire', 'marketing digital', 'conversion'].slice(0, Math.floor(Math.random() * 3) + 1)
  }));
};

/**
 * Hook pour tracking SEO en temps réel
 */
export const useSEOTracking = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Track page view avec métadonnées SEO
    const trackPageView = () => {
      const pageData = {
        path: location.pathname,
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      };

      // Envoyer à Google Analytics
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'page_view', {
          page_title: pageData.title,
          page_location: window.location.href,
          custom_map: {
            seo_score: calculatePageSEOScore(),
            has_schema: !!document.querySelector('script[type="application/ld+json"]'),
            meta_description_length: pageData.description?.length || 0
          }
        });
      }

      // Log pour debug
      console.log('🔍 SEO Page View Tracked:', pageData);
    };

    // Track après 1 seconde pour laisser le DOM se charger
    const timer = setTimeout(trackPageView, 1000);

    return () => clearTimeout(timer);
  }, [location]);

  // Track les interactions SEO importantes
  const trackSEOEvent = useCallback((eventName: string, parameters: Record<string, any> = {}) => {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', `seo_${eventName}`, {
        ...parameters,
        page_path: location.pathname,
        timestamp: new Date().toISOString()
      });
    }
  }, [location.pathname]);

  return { trackSEOEvent };
};

/**
 * Créer un widget de monitoring SEO (à implémenter en JSX)
 */
export const createSEOMonitoringWidget = () => {
  // Cette fonction retournera les données pour créer un widget de monitoring
  return {
    getSEOScore: calculatePageSEOScore,
    getIssues: detectSEOIssues,
    getOpportunities: identifyOpportunities
  };
};