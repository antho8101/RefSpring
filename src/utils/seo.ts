/**
 * 🔍 Utilitaires SEO - Optimisation pour moteurs de recherche
 */

import { useEffect } from 'react';

/**
 * Interface pour métadonnées SEO
 */
export interface SEOMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  author?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  locale?: string;
  siteName?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

/**
 * Hook pour gestion dynamique des métadonnées SEO
 */
export const useSEO = (metadata: SEOMetadata) => {
  useEffect(() => {
    const originalTitle = document.title;
    const originalDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');

    // Mettre à jour le titre
    if (metadata.title) {
      document.title = `${metadata.title} | RefSpring`;
    }

    // Mettre à jour la description
    if (metadata.description) {
      let descMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
      if (!descMeta) {
        descMeta = document.createElement('meta');
        descMeta.name = 'description';
        document.head.appendChild(descMeta);
      }
      descMeta.content = metadata.description;
    }

    // Mettre à jour les mots-clés
    if (metadata.keywords?.length) {
      let keywordsMeta = document.querySelector('meta[name="keywords"]') as HTMLMetaElement;
      if (!keywordsMeta) {
        keywordsMeta = document.createElement('meta');
        keywordsMeta.name = 'keywords';
        document.head.appendChild(keywordsMeta);
      }
      keywordsMeta.content = metadata.keywords.join(', ');
    }

    // Mettre à jour Open Graph
    updateOpenGraph(metadata);

    // Mettre à jour Twitter Cards
    updateTwitterCards(metadata);

    // Mettre à jour les données structurées
    updateStructuredData(metadata);

    // Cleanup au démontage
    return () => {
      document.title = originalTitle;
      if (originalDescription) {
        const descMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
        if (descMeta) descMeta.content = originalDescription;
      }
    };
  }, [metadata]);
};

/**
 * Mettre à jour les balises Open Graph
 */
const updateOpenGraph = (metadata: SEOMetadata) => {
  const ogTags = [
    { property: 'og:title', content: metadata.title },
    { property: 'og:description', content: metadata.description },
    { property: 'og:image', content: metadata.image },
    { property: 'og:url', content: metadata.url },
    { property: 'og:type', content: metadata.type || 'website' },
    { property: 'og:locale', content: metadata.locale || 'fr_FR' },
    { property: 'og:site_name', content: metadata.siteName || 'RefSpring' },
    { property: 'article:published_time', content: metadata.publishedTime },
    { property: 'article:modified_time', content: metadata.modifiedTime },
    { property: 'article:section', content: metadata.section }
  ];

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

  // Tags multiples
  if (metadata.tags?.length) {
    // Supprimer les anciens tags
    document.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove());
    
    // Ajouter les nouveaux
    metadata.tags.forEach(tag => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'article:tag');
      meta.content = tag;
      document.head.appendChild(meta);
    });
  }
};

/**
 * Mettre à jour les Twitter Cards
 */
const updateTwitterCards = (metadata: SEOMetadata) => {
  const twitterTags = [
    { name: 'twitter:title', content: metadata.title },
    { name: 'twitter:description', content: metadata.description },
    { name: 'twitter:image', content: metadata.image },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: '@refspring' }
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
 * Mettre à jour les données structurées JSON-LD
 */
const updateStructuredData = (metadata: SEOMetadata) => {
  // Supprimer l'ancien script s'il existe
  const existingScript = document.querySelector('script[data-seo="structured-data"]');
  if (existingScript) {
    existingScript.remove();
  }

  // Créer les nouvelles données structurées
  const structuredData = createStructuredData(metadata);
  
  if (structuredData) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo', 'structured-data');
    script.textContent = JSON.stringify(structuredData, null, 2);
    document.head.appendChild(script);
  }
};

/**
 * Créer les données structurées selon le type de contenu
 */
const createStructuredData = (metadata: SEOMetadata) => {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': getSchemaType(metadata.type),
    name: metadata.title,
    description: metadata.description,
    url: metadata.url,
    image: metadata.image
  };

  // Enrichir selon le type
  switch (metadata.type) {
    case 'article':
      return {
        ...baseData,
        '@type': 'Article',
        headline: metadata.title,
        datePublished: metadata.publishedTime,
        dateModified: metadata.modifiedTime,
        author: {
          '@type': 'Organization',
          name: metadata.author || 'RefSpring'
        },
        publisher: {
          '@type': 'Organization',
          name: 'RefSpring',
          logo: {
            '@type': 'ImageObject',
            url: 'https://refspring.com/logo.png'
          }
        },
        articleSection: metadata.section,
        keywords: metadata.keywords?.join(', ')
      };

    case 'product':
      return {
        ...baseData,
        '@type': 'Product',
        brand: {
          '@type': 'Brand',
          name: 'RefSpring'
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock'
        }
      };

    default:
      return {
        ...baseData,
        '@type': 'WebPage',
        isPartOf: {
          '@type': 'WebSite',
          name: 'RefSpring',
          url: 'https://refspring.com'
        }
      };
  }
};

/**
 * Convertir le type de contenu en type Schema.org
 */
const getSchemaType = (type?: string) => {
  switch (type) {
    case 'article': return 'Article';
    case 'product': return 'Product';
    case 'website': return 'WebPage';
    default: return 'WebPage';
  }
};

/**
 * Générer un sitemap dynamique
 */
export const generateSitemap = (routes: Array<{
  path: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}>) => {
  const urls = routes.map(route => `
    <url>
      <loc>https://refspring.com${route.path}</loc>
      <lastmod>${route.lastmod || new Date().toISOString().split('T')[0]}</lastmod>
      <changefreq>${route.changefreq || 'weekly'}</changefreq>
      <priority>${route.priority || 0.5}</priority>
    </url>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
};

/**
 * Générer le robots.txt
 */
export const generateRobotsTxt = (config: {
  sitemap?: string;
  disallowedPaths?: string[];
  allowedBots?: string[];
}) => {
  const { sitemap = 'https://refspring.com/sitemap.xml', disallowedPaths = [], allowedBots = ['*'] } = config;

  const rules = allowedBots.map(bot => `User-agent: ${bot}
${disallowedPaths.map(path => `Disallow: ${path}`).join('\n')}
Allow: /

`).join('');

  return `${rules}Sitemap: ${sitemap}`;
};

/**
 * Optimisation des URLs (slugification)
 */
export const seoUtils = {
  // Créer un slug SEO-friendly
  createSlug: (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces et tirets
      .trim()
      .replace(/\s+/g, '-') // Remplacer espaces par tirets
      .replace(/-+/g, '-'); // Éviter les tirets multiples
  },

  // Valider la longueur du titre SEO
  validateTitle: (title: string) => ({
    length: title.length,
    isValid: title.length >= 30 && title.length <= 60,
    recommendation: title.length < 30 
      ? 'Titre trop court (minimum 30 caractères)'
      : title.length > 60 
        ? 'Titre trop long (maximum 60 caractères)'
        : 'Longueur optimale'
  }),

  // Valider la longueur de la description
  validateDescription: (description: string) => ({
    length: description.length,
    isValid: description.length >= 120 && description.length <= 160,
    recommendation: description.length < 120
      ? 'Description trop courte (minimum 120 caractères)'
      : description.length > 160
        ? 'Description trop longue (maximum 160 caractères)'
        : 'Longueur optimale'
  }),

  // Analyser la densité des mots-clés
  analyzeKeywordDensity: (content: string, keywords: string[]) => {
    const words = content.toLowerCase().split(/\s+/);
    const totalWords = words.length;
    
    return keywords.map(keyword => {
      const keywordLower = keyword.toLowerCase();
      const occurrences = words.filter(word => word.includes(keywordLower)).length;
      const density = (occurrences / totalWords) * 100;
      
      return {
        keyword,
        occurrences,
        density: Math.round(density * 100) / 100,
        isOptimal: density >= 1 && density <= 3 // Densité optimale 1-3%
      };
    });
  },

  // Extraire les mots-clés automatiquement
  extractKeywords: (content: string, maxKeywords: number = 10) => {
    const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'mais', 'pour', 'avec', 'sans', 'sur', 'dans', 'par', 'vers', 'chez'];
    
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word));
    
    const frequency = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, maxKeywords)
      .map(([word, count]) => ({ keyword: word, frequency: count }));
  }
};

/**
 * Audit SEO automatisé
 */
export const seoAudit = {
  // Analyser la page actuelle
  auditCurrentPage: () => {
    const results = {
      title: {
        content: document.title,
        validation: seoUtils.validateTitle(document.title)
      },
      description: {
        content: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
        validation: seoUtils.validateDescription(document.querySelector('meta[name="description"]')?.getAttribute('content') || '')
      },
      headings: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
        tag: h.tagName,
        text: h.textContent?.substring(0, 100)
      })),
      images: Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt,
        hasAlt: !!img.alt
      })),
      links: Array.from(document.querySelectorAll('a')).length,
      canonicalUrl: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
      openGraph: Array.from(document.querySelectorAll('meta[property^="og:"]')).map(meta => ({
        property: meta.getAttribute('property'),
        content: meta.getAttribute('content')
      }))
    };

    console.group('🔍 SEO Audit');
    console.table(results);
    console.groupEnd();

    return results;
  },

  // Générer des recommandations
  generateRecommendations: (auditResults: ReturnType<typeof seoAudit.auditCurrentPage>) => {
    const recommendations: string[] = [];

    if (!auditResults.title.validation.isValid) {
      recommendations.push(`📝 ${auditResults.title.validation.recommendation}`);
    }

    if (!auditResults.description.validation.isValid) {
      recommendations.push(`📄 ${auditResults.description.validation.recommendation}`);
    }

    const h1Count = auditResults.headings.filter(h => h.tag === 'H1').length;
    if (h1Count === 0) {
      recommendations.push('🏷️ Ajouter un titre H1 à la page');
    } else if (h1Count > 1) {
      recommendations.push('🏷️ Utiliser un seul titre H1 par page');
    }

    const imagesWithoutAlt = auditResults.images.filter(img => !img.hasAlt).length;
    if (imagesWithoutAlt > 0) {
      recommendations.push(`🖼️ Ajouter des attributs alt à ${imagesWithoutAlt} image(s)`);
    }

    if (!auditResults.canonicalUrl) {
      recommendations.push('🔗 Ajouter une URL canonique');
    }

    const ogTags = auditResults.openGraph.length;
    if (ogTags < 4) {
      recommendations.push('📱 Compléter les balises Open Graph');
    }

    return recommendations;
  }
};