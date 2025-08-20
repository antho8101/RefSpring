import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

export interface SEOPageData {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: any;
  alternateLanguages?: { lang: string; url: string }[];
  noIndex?: boolean;
  noFollow?: boolean;
}

const updateMetaTag = (
  name: string, 
  content: string, 
  attribute: 'name' | 'property' = 'name'
) => {
  if (!content) return;

  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (element) {
    element.setAttribute('content', content);
  } else {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    element.setAttribute('content', content);
    document.head.appendChild(element);
  }
};

const updateCanonicalLink = (href: string) => {
  if (!href) return;

  let element = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  
  if (element) {
    element.href = href;
  } else {
    element = document.createElement('link');
    element.rel = 'canonical';
    element.href = href;
    document.head.appendChild(element);
  }
};

const updateStructuredData = (data: any) => {
  if (!data) return;

  // Remove existing structured data
  const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
  existingScripts.forEach(script => {
    if (script.getAttribute('data-seo-managed') === 'true') {
      script.remove();
    }
  });

  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-seo-managed', 'true');
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

const updateAlternateLanguages = (languages: { lang: string; url: string }[]) => {
  if (!languages || languages.length === 0) return;

  // Remove existing hreflang links
  const existingLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
  existingLinks.forEach(link => {
    if (link.getAttribute('data-seo-managed') === 'true') {
      link.remove();
    }
  });

  // Add new hreflang links
  languages.forEach(({ lang, url }) => {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = lang;
    link.href = url;
    link.setAttribute('data-seo-managed', 'true');
    document.head.appendChild(link);
  });

  // Add x-default link
  const defaultLink = document.createElement('link');
  defaultLink.rel = 'alternate';
  defaultLink.hreflang = 'x-default';
  defaultLink.href = languages[0].url; // Use first language as default
  defaultLink.setAttribute('data-seo-managed', 'true');
  document.head.appendChild(defaultLink);
};

export const useSEO = (pageData: SEOPageData) => {
  const location = useLocation();

  const {
    title,
    description,
    keywords,
    canonicalUrl,
    ogImage,
    ogType = 'website',
    structuredData,
    alternateLanguages,
    noIndex = false,
    noFollow = false
  } = pageData;

  useEffect(() => {
    // Update title
    document.title = title.includes('RefSpring') ? title : `${title} | RefSpring`;

    // Update meta description
    updateMetaTag('description', description);

    // Update keywords (if provided)
    if (keywords && keywords.length > 0) {
      updateMetaTag('keywords', keywords.join(', '));
    }

    // Update robots meta
    const robotsContent = [
      noIndex ? 'noindex' : 'index',
      noFollow ? 'nofollow' : 'follow'
    ].join(', ');
    updateMetaTag('robots', robotsContent);

    // Update Open Graph tags
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:type', ogType, 'property');
    updateMetaTag('og:url', canonicalUrl || `https://refspring.com${location.pathname}`, 'property');
    
    if (ogImage) {
      updateMetaTag('og:image', ogImage, 'property');
      updateMetaTag('og:image:width', '1200', 'property');
      updateMetaTag('og:image:height', '630', 'property');
    }

    // Update Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    if (ogImage) {
      updateMetaTag('twitter:image', ogImage);
    }

    // Update canonical URL
    updateCanonicalLink(canonicalUrl || `https://refspring.com${location.pathname}`);

    // Update structured data
    if (structuredData) {
      updateStructuredData(structuredData);
    }

    // Update alternate languages
    if (alternateLanguages) {
      updateAlternateLanguages(alternateLanguages);
    }
  }, [
    title,
    description,
    keywords,
    canonicalUrl,
    ogImage,
    ogType,
    structuredData,
    alternateLanguages,
    noIndex,
    noFollow,
    location.pathname
  ]);
};

// Declare gtag function
declare global {
  function gtag(...args: any[]): void;
}

// Hook for tracking SEO events
export const useSEOAnalytics = () => {
  const location = useLocation();

  const trackPageView = useCallback((title: string) => {
    // Google Analytics 4
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: title,
        page_location: window.location.href
      });
    }

    // Custom analytics
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('Page Viewed', {
        title,
        url: window.location.href,
        path: location.pathname,
        referrer: document.referrer
      });
    }
  }, [location.pathname]);

  const trackSEOEvent = useCallback((
    action: string, 
    label?: string, 
    value?: number
  ) => {
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', action, {
        event_category: 'SEO',
        event_label: label,
        value: value
      });
    }
  }, []);

  return {
    trackPageView,
    trackSEOEvent
  };
};

// Hook for Core Web Vitals monitoring
export const useCoreWebVitals = () => {
  useEffect(() => {
    const reportWebVitals = async () => {
      try {
        const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import('web-vitals');

        const sendToAnalytics = ({ name, value, rating, delta, id }: any) => {
          // Send to Google Analytics
          if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
            (window as any).gtag('event', name, {
              event_category: 'Web Vitals',
              event_label: rating,
              value: Math.round(value),
              non_interaction: true
            });
          }

          // Send to custom analytics
          if (typeof window !== 'undefined' && (window as any).analytics) {
            (window as any).analytics.track('Web Vital', {
              name,
              value,
              rating,
              delta,
              id,
              url: window.location.href
            });
          }
        };

        onCLS(sendToAnalytics);
        onINP(sendToAnalytics);
        onFCP(sendToAnalytics);
        onLCP(sendToAnalytics);
        onTTFB(sendToAnalytics);
      } catch (error) {
        console.warn('Web Vitals not available:', error);
      }
    };

    reportWebVitals();
  }, []);
};

// SEO utilities
export const SEOUtils = {
  // Generate OG image URL
  generateOGImage: (title: string, description?: string): string => {
    const params = new URLSearchParams({
      title,
      ...(description && { description })
    });
    return `https://refspring.com/api/og?${params.toString()}`;
  },

  // Generate structured data for different page types
  generateOrganizationStructuredData: () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "RefSpring",
    "description": "Plateforme d'affiliation nouvelle génération",
    "url": "https://refspring.com",
    "logo": "https://refspring.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "contact@refspring.com",
      "contactType": "customer service"
    },
    "sameAs": [
      "https://twitter.com/refspring",
      "https://linkedin.com/company/refspring"
    ]
  }),

  generateSoftwareStructuredData: () => ({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "RefSpring",
    "description": "Plateforme d'affiliation pour maximiser vos revenus",
    "url": "https://refspring.com",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR"
    }
  }),

  generateFAQStructuredData: (faqs: { question: string; answer: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }),

  // Validate meta tags
  validateSEO: (pageData: SEOPageData): string[] => {
    const errors: string[] = [];

    if (!pageData.title) {
      errors.push('Title is required');
    } else if (pageData.title.length > 60) {
      errors.push('Title should be under 60 characters');
    }

    if (!pageData.description) {
      errors.push('Description is required');
    } else if (pageData.description.length > 160) {
      errors.push('Description should be under 160 characters');
    }

    return errors;
  }
};