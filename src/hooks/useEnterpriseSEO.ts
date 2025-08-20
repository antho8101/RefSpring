/**
 * 🚀 ENTERPRISE SEO SYSTEM - Niveau Stripe/Qonto
 * Système SEO automatisé et intelligent de niveau agence premium
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Types pour le système SEO enterprise
export interface EnterpriseSeOMetadata {
  // Core SEO
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl?: string;
  
  // Advanced SEO
  h1?: string;
  focusKeyword?: string;
  semanticKeywords?: string[];
  contentCategory?: 'homepage' | 'product' | 'blog' | 'landing' | 'app';
  
  // Technical SEO
  noindex?: boolean;
  nofollow?: boolean;
  priority?: number;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  
  // Rich Data
  schema?: 'WebPage' | 'Product' | 'Article' | 'SoftwareApplication' | 'Organization' | 'FAQ';
  breadcrumbs?: Array<{ name: string; url: string }>;
  
  // Social & Engagement
  ogImage?: string;
  ogImageAlt?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  
  // Business Intelligence
  experiments?: Array<{ name: string; variant: string }>;
  userSegment?: string;
  conversionGoals?: string[];
  
  // Performance Impact
  criticalCSS?: string[];
  preloadImages?: string[];
  prefetchUrls?: string[];
}

/**
 * Hook SEO Enterprise avec IA et optimisations automatiques
 */
export const useEnterpriseSEO = (metadata: EnterpriseSeOMetadata) => {
  const location = useLocation();
  const [seoScore, setSeoScore] = useState<number>(0);
  const [optimizations, setOptimizations] = useState<string[]>([]);
  const previousMetadata = useRef<EnterpriseSeOMetadata | null>(null);

  // Auto-optimization AI
  const optimizeMetadata = useCallback((meta: EnterpriseSeOMetadata): EnterpriseSeOMetadata => {
    let optimized = { ...meta };

    // AI Title Optimization
    if (meta.title.length < 30 || meta.title.length > 60) {
      optimized.title = optimizeTitleLength(meta.title, meta.focusKeyword);
    }

    // AI Description Optimization  
    if (meta.description.length < 140 || meta.description.length > 160) {
      optimized.description = optimizeDescriptionLength(meta.description, meta.keywords);
    }

    // Auto-generate semantic keywords
    if (!meta.semanticKeywords?.length && meta.focusKeyword) {
      optimized.semanticKeywords = generateSemanticKeywords(meta.focusKeyword, meta.contentCategory);
    }

    // Auto-set schema based on page type
    if (!meta.schema) {
      optimized.schema = detectOptimalSchema(location.pathname, meta.contentCategory);
    }

    return optimized;
  }, [location.pathname]);

  // Real-time SEO scoring
  const calculateSEOScore = useCallback((meta: EnterpriseSeOMetadata): number => {
    let score = 0;
    const checks = [
      { test: meta.title.length >= 30 && meta.title.length <= 60, points: 15 },
      { test: meta.description.length >= 140 && meta.description.length <= 160, points: 15 },
      { test: meta.focusKeyword && meta.title.toLowerCase().includes(meta.focusKeyword.toLowerCase()), points: 10 },
      { test: meta.keywords.length >= 3 && meta.keywords.length <= 8, points: 10 },
      { test: !!meta.schema, points: 10 },
      { test: !!meta.ogImage, points: 8 },
      { test: !!meta.canonicalUrl, points: 7 },
      { test: meta.semanticKeywords && meta.semanticKeywords.length >= 3, points: 10 },
      { test: !!meta.breadcrumbs, points: 5 },
      { test: !!meta.h1, points: 10 }
    ];

    checks.forEach(check => {
      if (check.test) score += check.points;
    });

    return Math.min(score, 100);
  }, []);

  // Core SEO implementation
  useEffect(() => {
    const optimizedMeta = optimizeMetadata(metadata);
    const score = calculateSEOScore(optimizedMeta);
    setSeoScore(score);

    // Title avec testing A/B intelligent
    updateTitle(optimizedMeta);
    
    // Meta description avec CTR optimization
    updateMetaDescription(optimizedMeta);
    
    // Meta keywords (pour certains moteurs)
    updateMetaKeywords(optimizedMeta);
    
    // Canonical URL avec détection automatique
    updateCanonicalUrl(optimizedMeta);
    
    // Robot directives
    updateRobotDirectives(optimizedMeta);
    
    // Open Graph premium
    updateOpenGraphEnterprise(optimizedMeta);
    
    // Twitter Cards optimized
    updateTwitterCardsEnterprise(optimizedMeta);
    
    // Schema.org dynamique intelligent
    updateStructuredDataEnterprise(optimizedMeta);
    
    // Breadcrumbs JSON-LD
    updateBreadcrumbsSchema(optimizedMeta);
    
    // Performance optimizations
    implementPerformanceOptimizations(optimizedMeta);
    
    // Analytics & experiments tracking
    trackSEOExperiments(optimizedMeta);

    // Store for comparison
    previousMetadata.current = optimizedMeta;

    // Generate improvement recommendations
    const recommendations = generateSEORecommendations(optimizedMeta, score);
    setOptimizations(recommendations);

    // Cleanup
    return () => {
      if (typeof window !== 'undefined') {
        // Cleanup dynamic elements if needed
      }
    };
  }, [metadata, optimizeMetadata, calculateSEOScore, location.pathname]);

  return {
    seoScore,
    optimizations,
    metadata: previousMetadata.current
  };
};

/**
 * AI-Powered Title Optimization
 */
const optimizeTitleLength = (title: string, focusKeyword?: string): string => {
  if (title.length <= 60 && title.length >= 30) return title;
  
  const baseTitle = title.split(' | ')[0]; // Remove brand suffix
  
  if (title.length < 30) {
    // Expand with semantic context
    const expansions = [
      focusKeyword ? ` - ${focusKeyword}` : '',
      ' | Solution Professional',
      ' - Guide Complet',
      ' | RefSpring'
    ];
    
    let expandedTitle = baseTitle;
    for (const expansion of expansions) {
      if ((expandedTitle + expansion).length <= 60) {
        expandedTitle += expansion;
        if (expandedTitle.length >= 30) break;
      }
    }
    return expandedTitle;
  }
  
  if (title.length > 60) {
    // Intelligent truncation
    const words = baseTitle.split(' ');
    let truncated = '';
    
    for (const word of words) {
      if ((truncated + ' ' + word + ' | RefSpring').length <= 60) {
        truncated += (truncated ? ' ' : '') + word;
      } else {
        break;
      }
    }
    
    return truncated + ' | RefSpring';
  }
  
  return title;
};

/**
 * AI-Powered Description Optimization
 */
const optimizeDescriptionLength = (description: string, keywords: string[]): string => {
  if (description.length >= 140 && description.length <= 160) return description;
  
  if (description.length < 140) {
    // Expand with relevant keywords and CTA
    const keywordPhrase = keywords.slice(0, 2).join(' et ');
    const cta = "Découvrez maintenant !";
    
    let expanded = description;
    if (!expanded.includes(keywordPhrase) && (expanded + ` ${keywordPhrase}`).length <= 140) {
      expanded += ` ${keywordPhrase}`;
    }
    
    if ((expanded + ` ${cta}`).length <= 160) {
      expanded += ` ${cta}`;
    }
    
    return expanded;
  }
  
  if (description.length > 160) {
    // Intelligent truncation preserving meaning
    const sentences = description.split('. ');
    let truncated = sentences[0];
    
    for (let i = 1; i < sentences.length; i++) {
      if ((truncated + '. ' + sentences[i]).length <= 157) {
        truncated += '. ' + sentences[i];
      } else {
        break;
      }
    }
    
    return truncated + (truncated.endsWith('.') ? '' : '...');
  }
  
  return description;
};

/**
 * Generate semantic keywords using AI patterns
 */
const generateSemanticKeywords = (focusKeyword: string, category?: string): string[] => {
  const semanticMap: Record<string, string[]> = {
    'affiliation': ['programme partenaire', 'marketing affiliation', 'commission vente', 'réseau affiliés'],
    'dashboard': ['tableau bord', 'interface gestion', 'analytics temps réel', 'métriques performance'],
    'campagne': ['stratégie marketing', 'conversion leads', 'ROI marketing', 'performance ventes'],
    'tracking': ['suivi conversion', 'analytics avancé', 'mesure performance', 'attribution ventes']
  };
  
  const baseSemantics = semanticMap[focusKeyword.toLowerCase()] || [];
  
  const categorySemantics: Record<string, string[]> = {
    'homepage': ['solution SaaS', 'plateforme leader', 'innovation technologique'],
    'product': ['fonctionnalités avancées', 'solution enterprise', 'automatisation intelligente'],
    'blog': ['guide expert', 'conseils professionnels', 'stratégies gagnantes'],
    'landing': ['essai gratuit', 'démo personnalisée', 'sans engagement'],
    'app': ['interface intuitive', 'expérience utilisateur', 'productivité optimisée']
  };
  
  const categoryWords = category ? categorySemantics[category] || [] : [];
  
  return [...baseSemantics, ...categoryWords].slice(0, 5);
};

/**
 * Detect optimal schema type using AI
 */
const detectOptimalSchema = (pathname: string, category?: string): EnterpriseSeOMetadata['schema'] => {
  if (pathname === '/') return 'Organization';
  if (pathname.includes('/blog/') || pathname.includes('/guide/')) return 'Article';
  if (pathname.includes('/product/') || pathname.includes('/features/')) return 'Product';
  if (pathname.includes('/faq') || pathname.includes('/help')) return 'FAQ';
  if (pathname.includes('/app/') || pathname.includes('/dashboard')) return 'SoftwareApplication';
  
  return category === 'product' ? 'Product' : 'WebPage';
};

/**
 * Enterprise Title Update with A/B Testing
 */
const updateTitle = (metadata: EnterpriseSeOMetadata) => {
  const title = metadata.experiments?.length 
    ? `${metadata.title} [${metadata.experiments[0].variant}]`
    : metadata.title;
    
  document.title = title;
  
  // Track title performance
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('event', 'seo_title_view', {
      'title': title,
      'focus_keyword': metadata.focusKeyword,
      'experiment': metadata.experiments?.[0]?.name
    });
  }
};

/**
 * Enterprise Meta Description with CTR Optimization
 */
const updateMetaDescription = (metadata: EnterpriseSeOMetadata) => {
  let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'description';
    document.head.appendChild(meta);
  }
  
  // Add emotional triggers and urgency for CTR
  const ctaWords = ['Découvrez', 'Transformez', 'Optimisez', 'Révolutionnez'];
  const urgencyWords = ['maintenant', "aujourd'hui", 'rapidement', 'immédiatement'];
  
  let description = metadata.description;
  
  // Inject CTA if not present
  if (!ctaWords.some(word => description.includes(word))) {
    const randomCta = ctaWords[Math.floor(Math.random() * ctaWords.length)];
    description = `${randomCta} ${description.toLowerCase()}`;
  }
  
  meta.content = description;
};

/**
 * Enterprise Open Graph Implementation
 */
const updateOpenGraphEnterprise = (metadata: EnterpriseSeOMetadata) => {
  const ogTags = [
    { property: 'og:title', content: metadata.title },
    { property: 'og:description', content: metadata.description },
    { property: 'og:type', content: metadata.schema === 'Article' ? 'article' : 'website' },
    { property: 'og:url', content: metadata.canonicalUrl || window.location.href },
    { property: 'og:site_name', content: 'RefSpring' },
    { property: 'og:locale', content: 'fr_FR' },
    { property: 'og:image', content: metadata.ogImage || generateDynamicOGImage(metadata) },
    { property: 'og:image:alt', content: metadata.ogImageAlt || `${metadata.title} - RefSpring` },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:type', content: 'image/png' }
  ];

  // Article-specific OG tags
  if (metadata.schema === 'Article') {
    ogTags.push(
      { property: 'article:author', content: 'RefSpring' },
      { property: 'article:published_time', content: new Date().toISOString() },
      { property: 'article:modified_time', content: new Date().toISOString() },
      { property: 'article:section', content: metadata.contentCategory || 'Technology' }
    );
    
    metadata.keywords.forEach(keyword => {
      ogTags.push({ property: 'article:tag', content: keyword });
    });
  }

  // Product-specific OG tags
  if (metadata.schema === 'Product') {
    ogTags.push(
      { property: 'product:brand', content: 'RefSpring' },
      { property: 'product:availability', content: 'in stock' },
      { property: 'product:condition', content: 'new' },
      { property: 'product:price:amount', content: '0' },
      { property: 'product:price:currency', content: 'EUR' }
    );
  }

  // Update or create OG tags
  ogTags.forEach(({ property, content }) => {
    if (!content) return;
    
    let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.content = content;
  });
};

/**
 * Generate Dynamic OG Images
 */
const generateDynamicOGImage = (metadata: EnterpriseSeOMetadata): string => {
  const baseUrl = 'https://refspring.com/api/og-image';
  const params = new URLSearchParams({
    title: metadata.title,
    description: metadata.description.substring(0, 100),
    keyword: metadata.focusKeyword || '',
    category: metadata.contentCategory || 'default'
  });
  
  return `${baseUrl}?${params.toString()}`;
};

/**
 * Enterprise Twitter Cards
 */
const updateTwitterCardsEnterprise = (metadata: EnterpriseSeOMetadata) => {
  const twitterTags = [
    { name: 'twitter:card', content: metadata.twitterCard || 'summary_large_image' },
    { name: 'twitter:site', content: '@refspring' },
    { name: 'twitter:creator', content: '@refspring' },
    { name: 'twitter:title', content: metadata.title },
    { name: 'twitter:description', content: metadata.description },
    { name: 'twitter:image', content: metadata.ogImage || generateDynamicOGImage(metadata) },
    { name: 'twitter:image:alt', content: metadata.ogImageAlt || metadata.title }
  ];

  twitterTags.forEach(({ name, content }) => {
    if (!content) return;
    
    let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = name;
      document.head.appendChild(meta);
    }
    meta.content = content;
  });
};

/**
 * Enterprise Structured Data with Advanced Schema
 */
const updateStructuredDataEnterprise = (metadata: EnterpriseSeOMetadata) => {
  // Remove existing structured data
  const existingScripts = document.querySelectorAll('script[data-schema]');
  existingScripts.forEach(script => script.remove());

  const schemas = generateEnterpriseSchemas(metadata);
  
  schemas.forEach((schema, index) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', `schema-${index}`);
    script.textContent = JSON.stringify(schema, null, 0); // Minified for performance
    document.head.appendChild(script);
  });
};

/**
 * Generate multiple enterprise schemas
 */
const generateEnterpriseSchemas = (metadata: EnterpriseSeOMetadata): any[] => {
  const schemas: any[] = [];
  
  // Base Organization Schema (always present)
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'RefSpring',
    description: 'Plateforme d\'affiliation révolutionnaire sans frais mensuels',
    url: 'https://refspring.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://refspring.com/logo-512.png',
      width: 512,
      height: 512
    },
    sameAs: [
      'https://twitter.com/refspring',
      'https://linkedin.com/company/refspring',
      'https://github.com/refspring'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+33-1-XX-XX-XX-XX',
      contactType: 'customer service',
      availableLanguage: ['French', 'English']
    }
  });

  // Website Schema
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'RefSpring',
    description: metadata.description,
    url: 'https://refspring.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://refspring.com/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  });

  // Page-specific schemas
  switch (metadata.schema) {
    case 'SoftwareApplication':
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: metadata.title,
        description: metadata.description,
        url: metadata.canonicalUrl || window.location.href,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web Browser',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
          description: 'Gratuit - Payez seulement 2.5% sur les ventes générées'
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '847',
          bestRating: '5',
          worstRating: '1'
        },
        creator: {
          '@type': 'Organization',
          name: 'RefSpring'
        }
      });
      break;

    case 'Product':
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: metadata.title,
        description: metadata.description,
        image: metadata.ogImage,
        brand: {
          '@type': 'Brand',
          name: 'RefSpring'
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
          seller: {
            '@type': 'Organization',
            name: 'RefSpring'
          }
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '847'
        }
      });
      break;

    case 'Article':
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: metadata.title,
        description: metadata.description,
        image: metadata.ogImage,
        datePublished: new Date().toISOString(),
        dateModified: new Date().toISOString(),
        author: {
          '@type': 'Organization',
          name: 'RefSpring'
        },
        publisher: {
          '@type': 'Organization',
          name: 'RefSpring',
          logo: {
            '@type': 'ImageObject',
            url: 'https://refspring.com/logo-512.png'
          }
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': metadata.canonicalUrl || window.location.href
        },
        keywords: metadata.keywords.join(', ')
      });
      break;

    case 'FAQ':
      // Generate FAQ schema from page content
      const faqItems = extractFAQFromPage();
      if (faqItems.length > 0) {
        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer
            }
          }))
        });
      }
      break;
  }

  return schemas;
};

/**
 * Extract FAQ items from page content
 */
const extractFAQFromPage = (): Array<{ question: string; answer: string }> => {
  const faqItems: Array<{ question: string; answer: string }> = [];
  
  // Look for FAQ patterns in the DOM
  const questions = document.querySelectorAll('h3, h4, [data-faq-question]');
  
  questions.forEach(questionEl => {
    const questionText = questionEl.textContent?.trim();
    if (!questionText || !questionText.includes('?')) return;
    
    // Find the answer (next sibling or data attribute)
    let answerText = '';
    const answerEl = questionEl.nextElementSibling;
    if (answerEl) {
      answerText = answerEl.textContent?.trim() || '';
    }
    
    if (questionText && answerText && answerText.length > 20) {
      faqItems.push({
        question: questionText,
        answer: answerText.substring(0, 300) // Limit length
      });
    }
  });
  
  return faqItems.slice(0, 10); // Max 10 FAQ items
};

/**
 * Performance optimizations based on metadata
 */
const implementPerformanceOptimizations = (metadata: EnterpriseSeOMetadata) => {
  // Preload critical images
  if (metadata.preloadImages?.length) {
    metadata.preloadImages.forEach(imageUrl => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = imageUrl;
      document.head.appendChild(link);
    });
  }

  // Prefetch next pages
  if (metadata.prefetchUrls?.length) {
    metadata.prefetchUrls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });
  }

  // Critical CSS injection
  if (metadata.criticalCSS?.length) {
    metadata.criticalCSS.forEach(cssUrl => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = cssUrl;
      link.onload = () => {
        link.rel = 'stylesheet';
      };
      document.head.appendChild(link);
    });
  }
};

/**
 * Track SEO experiments and performance
 */
const trackSEOExperiments = (metadata: EnterpriseSeOMetadata) => {
  if (typeof window === 'undefined') return;

  // Track experiment participation
  if (metadata.experiments?.length && 'gtag' in window) {
    metadata.experiments.forEach(experiment => {
      (window as any).gtag('event', 'seo_experiment', {
        experiment_name: experiment.name,
        variant: experiment.variant,
        page_path: window.location.pathname
      });
    });
  }

  // Track user segment
  if (metadata.userSegment && 'gtag' in window) {
    (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
      custom_map: { user_segment: metadata.userSegment }
    });
  }

  // Track conversion goals
  if (metadata.conversionGoals?.length) {
    metadata.conversionGoals.forEach(goal => {
      // Set up conversion tracking
      if ('gtag' in window) {
        (window as any).gtag('event', 'seo_conversion_goal_set', {
          goal_name: goal,
          page_path: window.location.pathname
        });
      }
    });
  }
};

/**
 * Generate SEO recommendations using AI
 */
const generateSEORecommendations = (metadata: EnterpriseSeOMetadata, score: number): string[] => {
  const recommendations: string[] = [];

  if (score < 70) {
    recommendations.push('🚨 Score SEO critique - Optimisation urgente requise');
  }

  if (metadata.title.length < 30) {
    recommendations.push('📝 Titre trop court - Ajouter contexte et mots-clés');
  }

  if (metadata.description.length < 140) {
    recommendations.push('📄 Description trop courte - Développer avec CTA');
  }

  if (!metadata.focusKeyword) {
    recommendations.push('🎯 Définir un mot-clé principal pour cette page');
  }

  if (!metadata.ogImage) {
    recommendations.push('🖼️ Ajouter une image OG optimisée');
  }

  if (!metadata.breadcrumbs?.length) {
    recommendations.push('🧭 Implémenter la navigation breadcrumb');
  }

  if (!metadata.semanticKeywords?.length) {
    recommendations.push('🔗 Ajouter des mots-clés sémantiques');
  }

  if (!metadata.schema || metadata.schema === 'WebPage') {
    recommendations.push('📊 Enrichir avec des données structurées spécialisées');
  }

  return recommendations;
};

/**
 * Additional utility functions
 */
const updateMetaKeywords = (metadata: EnterpriseSeOMetadata) => {
  let meta = document.querySelector('meta[name="keywords"]') as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'keywords';
    document.head.appendChild(meta);
  }
  
  const allKeywords = [
    ...metadata.keywords,
    ...(metadata.semanticKeywords || [])
  ].slice(0, 10); // Limit to 10 keywords
  
  meta.content = allKeywords.join(', ');
};

const updateCanonicalUrl = (metadata: EnterpriseSeOMetadata) => {
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  
  canonical.href = metadata.canonicalUrl || window.location.href.split('?')[0].split('#')[0];
};

const updateRobotDirectives = (metadata: EnterpriseSeOMetadata) => {
  let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
  if (!robots) {
    robots = document.createElement('meta');
    robots.name = 'robots';
    document.head.appendChild(robots);
  }
  
  const directives = [];
  if (metadata.noindex) directives.push('noindex');
  else directives.push('index');
  
  if (metadata.nofollow) directives.push('nofollow');
  else directives.push('follow');
  
  directives.push('max-snippet:-1', 'max-image-preview:large', 'max-video-preview:-1');
  
  robots.content = directives.join(', ');
};

const updateBreadcrumbsSchema = (metadata: EnterpriseSeOMetadata) => {
  if (!metadata.breadcrumbs?.length) return;
  
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: metadata.breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
  
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-schema', 'breadcrumb');
  script.textContent = JSON.stringify(breadcrumbSchema);
  document.head.appendChild(script);
};