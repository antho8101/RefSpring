/**
 * 🚀 ENTERPRISE SEO COMPONENTS - Niveau Stripe/Qonto
 * Composants SEO réutilisables de niveau agence premium
 */

import React, { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

// Enterprise SEO Page Wrapper
interface EnterpriseSeOPageProps {
  children: ReactNode;
  title: string;
  description: string;
  keywords?: string[];
  focusKeyword?: string;
  contentCategory?: 'homepage' | 'product' | 'blog' | 'landing' | 'app';
  schema?: 'WebPage' | 'Product' | 'Article' | 'SoftwareApplication' | 'Organization' | 'FAQ';
  ogImage?: string;
  noindex?: boolean;
  breadcrumbs?: Array<{ name: string; url: string }>;
  alternateLanguages?: Array<{ lang: string; url: string }>;
}

export const EnterpriseSeOPage: React.FC<EnterpriseSeOPageProps> = ({
  children,
  title,
  description,
  keywords = [],
  focusKeyword,
  contentCategory = 'homepage',
  schema = 'WebPage',
  ogImage,
  noindex = false,
  breadcrumbs = [],
  alternateLanguages = []
}) => {
  const location = useLocation();
  const canonicalUrl = `https://refspring.com${location.pathname}`;
  
  // Auto-generate optimal meta data
  const optimizedTitle = generateOptimalTitle(title, focusKeyword);
  const optimizedDescription = generateOptimalDescription(description, keywords, focusKeyword);
  const dynamicOGImage = ogImage || generateDynamicOGImage(title, description);
  const structuredData = generateStructuredData(schema, title, description, canonicalUrl);
  
  return (
    <>
      <Helmet>
        {/* Core SEO Meta Tags */}
        <title>{optimizedTitle}</title>
        <meta name="description" content={optimizedDescription} />
        {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
        
        {/* Technical SEO */}
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1'} />
        
        {/* Open Graph - Optimized for Social Media */}
        <meta property="og:title" content={optimizedTitle} />
        <meta property="og:description" content={optimizedDescription} />
        <meta property="og:type" content={schema === 'Article' ? 'article' : 'website'} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={dynamicOGImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`${title} - RefSpring`} />
        <meta property="og:site_name" content="RefSpring" />
        <meta property="og:locale" content="fr_FR" />
        
        {/* Twitter Cards - Optimized */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@refspring" />
        <meta name="twitter:title" content={optimizedTitle} />
        <meta name="twitter:description" content={optimizedDescription} />
        <meta name="twitter:image" content={dynamicOGImage} />
        <meta name="twitter:image:alt" content={`${title} - RefSpring`} />
        
        {/* Alternate Languages for International SEO */}
        {alternateLanguages.map(alt => (
          <link key={alt.lang} rel="alternate" hrefLang={alt.lang} href={alt.url} />
        ))}
        
        {/* Article-specific Meta Tags */}
        {schema === 'Article' && (
          <>
            <meta property="article:author" content="RefSpring" />
            <meta property="article:published_time" content={new Date().toISOString()} />
            <meta property="article:modified_time" content={new Date().toISOString()} />
            <meta property="article:section" content={contentCategory} />
            {keywords.map(keyword => (
              <meta key={keyword} property="article:tag" content={keyword} />
            ))}
          </>
        )}
        
        {/* Structured Data JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        
        {/* Breadcrumbs Schema */}
        {breadcrumbs.length > 0 && (
          <script type="application/ld+json">
            {JSON.stringify(generateBreadcrumbSchema(breadcrumbs))}
          </script>
        )}
        
        {/* Performance & UX Optimizations */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Preconnect to Critical Resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        
        {/* Prefetch Critical Resources */}
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      </Helmet>
      
      {/* Skip Navigation for Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
      >
        Aller au contenu principal
      </a>
      
      {/* Breadcrumb Navigation */}
      {breadcrumbs.length > 0 && (
        <nav aria-label="Fil d'Ariane" className="px-4 py-2 text-sm">
          <ol className="flex items-center space-x-2">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && <span className="mx-2 text-muted-foreground">/</span>}
                {index === breadcrumbs.length - 1 ? (
                  <span className="font-medium" aria-current="page">{crumb.name}</span>
                ) : (
                  <a href={crumb.url} className="text-primary hover:underline">
                    {crumb.name}
                  </a>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      {/* Main Content with proper semantic structure */}
      <main id="main-content" className="flex-1">
        {children}
      </main>
    </>
  );
};

// Enterprise Blog Post Component
interface EnterpriseBlogPostProps {
  children: ReactNode;
  title: string;
  description: string;
  author?: string;
  publishDate: string;
  modifiedDate?: string;
  category: string;
  tags: string[];
  image?: string;
  readingTime?: number;
  wordCount?: number;
}

export const EnterpriseBlogPost: React.FC<EnterpriseBlogPostProps> = ({
  children,
  title,
  description,
  author = 'RefSpring',
  publishDate,
  modifiedDate,
  category,
  tags,
  image,
  readingTime,
  wordCount
}) => {
  const location = useLocation();
  const canonicalUrl = `https://refspring.com${location.pathname}`;
  
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: image || generateDynamicOGImage(title, description),
    datePublished: publishDate,
    dateModified: modifiedDate || publishDate,
    author: {
      '@type': 'Organization',
      name: author,
      url: 'https://refspring.com'
    },
    publisher: {
      '@type': 'Organization',
      name: 'RefSpring',
      logo: {
        '@type': 'ImageObject',
        url: 'https://refspring.com/logo-512.png',
        width: 512,
        height: 512
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
    },
    articleSection: category,
    keywords: tags.join(', '),
    wordCount: wordCount,
    timeRequired: readingTime ? `PT${readingTime}M` : undefined
  };

  return (
    <EnterpriseSeOPage
      title={title}
      description={description}
      keywords={tags}
      contentCategory="blog"
      schema="Article"
      ogImage={image}
      breadcrumbs={[
        { name: 'Accueil', url: '/' },
        { name: 'Blog', url: '/blog' },
        { name: category, url: `/blog/category/${category.toLowerCase()}` },
        { name: title, url: location.pathname }
      ]}
    >
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      </Helmet>
      
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Article Header */}
        <header className="mb-8">
          <div className="mb-4">
            <span className="text-sm text-primary font-medium bg-primary/10 px-2 py-1 rounded">
              {category}
            </span>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 leading-tight">{title}</h1>
          
          <p className="text-xl text-muted-foreground mb-6">{description}</p>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Par {author}</span>
            <span>•</span>
            <time dateTime={publishDate}>
              {new Date(publishDate).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
            {readingTime && (
              <>
                <span>•</span>
                <span>{readingTime} min de lecture</span>
              </>
            )}
          </div>
          
          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map(tag => (
                <span 
                  key={tag}
                  className="text-xs bg-muted px-2 py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>
        
        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          {children}
        </div>
        
        {/* Article Footer */}
        <footer className="mt-12 pt-8 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Dernière mise à jour: {' '}
              <time dateTime={modifiedDate || publishDate}>
                {new Date(modifiedDate || publishDate).toLocaleDateString('fr-FR')}
              </time>
            </div>
            
            <div className="flex space-x-4">
              <button 
                className="text-sm text-primary hover:underline"
                onClick={() => navigator.share?.({ title, url: canonicalUrl })}
              >
                Partager
              </button>
            </div>
          </div>
        </footer>
      </article>
    </EnterpriseSeOPage>
  );
};

// Enterprise Landing Page Component
interface EnterpriseLandingPageProps {
  children: ReactNode;
  title: string;
  description: string;
  mainKeyword: string;
  secondaryKeywords: string[];
  ctaText?: string;
  features?: string[];
  testimonials?: Array<{ name: string; comment: string; rating: number }>;
  pricing?: { currency: string; amount: number; period: string };
}

export const EnterpriseLandingPage: React.FC<EnterpriseLandingPageProps> = ({
  children,
  title,
  description,
  mainKeyword,
  secondaryKeywords,
  ctaText = 'Commencer gratuitement',
  features = [],
  testimonials = [],
  pricing
}) => {
  const location = useLocation();
  const canonicalUrl = `https://refspring.com${location.pathname}`;
  
  // Generate enhanced schema for landing pages
  const landingPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: description,
    url: canonicalUrl,
    mainEntity: {
      '@type': 'SoftwareApplication',
      name: 'RefSpring',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web Browser',
      offers: pricing ? {
        '@type': 'Offer',
        price: pricing.amount.toString(),
        priceCurrency: pricing.currency,
        description: `${pricing.amount}${pricing.currency} ${pricing.period}`
      } : {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
        description: 'Gratuit - Payez seulement sur les résultats'
      },
      aggregateRating: testimonials.length > 0 ? {
        '@type': 'AggregateRating',
        ratingValue: (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1),
        reviewCount: testimonials.length.toString(),
        bestRating: '5',
        worstRating: '1'
      } : undefined
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Accueil',
          item: 'https://refspring.com'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: title,
          item: canonicalUrl
        }
      ]
    }
  };

  // Generate FAQ schema from features
  const faqSchema = features.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: features.slice(0, 5).map(feature => ({
      '@type': 'Question',
      name: `Comment ${feature.toLowerCase()} ?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `RefSpring vous permet de ${feature.toLowerCase()} facilement grâce à notre plateforme intuitive et nos outils automatisés.`
      }
    }))
  } : null;

  return (
    <EnterpriseSeOPage
      title={title}
      description={description}
      keywords={[mainKeyword, ...secondaryKeywords]}
      focusKeyword={mainKeyword}
      contentCategory="landing"
      schema="Product"
      breadcrumbs={[
        { name: 'Accueil', url: '/' },
        { name: title, url: location.pathname }
      ]}
    >
      <Helmet>
        {/* Enhanced meta for landing pages */}
        <meta name="og:type" content="product" />
        <meta property="product:price:amount" content={pricing?.amount.toString() || '0'} />
        <meta property="product:price:currency" content={pricing?.currency || 'EUR'} />
        
        {/* Landing page schemas */}
        <script type="application/ld+json">
          {JSON.stringify(landingPageSchema)}
        </script>
        
        {faqSchema && (
          <script type="application/ld+json">
            {JSON.stringify(faqSchema)}
          </script>
        )}
        
        {/* Testimonials schema */}
        {testimonials.length > 0 && (
          <script type="application/ld+json">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'RefSpring',
              review: testimonials.map(testimonial => ({
                '@type': 'Review',
                author: {
                  '@type': 'Person',
                  name: testimonial.name
                },
                reviewBody: testimonial.comment,
                reviewRating: {
                  '@type': 'Rating',
                  ratingValue: testimonial.rating.toString(),
                  bestRating: '5',
                  worstRating: '1'
                }
              }))
            })}
          </script>
        )}
      </Helmet>
      
      {children}
    </EnterpriseSeOPage>
  );
};

// Utility functions
const generateOptimalTitle = (title: string, focusKeyword?: string): string => {
  if (title.includes('RefSpring')) return title;
  
  let optimized = title;
  
  // Add focus keyword if not present
  if (focusKeyword && !title.toLowerCase().includes(focusKeyword.toLowerCase())) {
    optimized = `${title} - ${focusKeyword}`;
  }
  
  // Add brand
  if (!optimized.includes('RefSpring')) {
    optimized += ' | RefSpring';
  }
  
  // Ensure optimal length
  if (optimized.length > 60) {
    optimized = title + ' | RefSpring';
  }
  
  return optimized;
};

const generateOptimalDescription = (description: string, keywords: string[], focusKeyword?: string): string => {
  let optimized = description;
  
  // Add focus keyword if not present
  if (focusKeyword && !description.toLowerCase().includes(focusKeyword.toLowerCase())) {
    optimized = `${focusKeyword}: ${description}`;
  }
  
  // Add CTA if description is short
  if (optimized.length < 140) {
    const ctas = ['Découvrez maintenant !', 'Essayez gratuitement !', 'Commencez aujourd\'hui !'];
    const randomCta = ctas[Math.floor(Math.random() * ctas.length)];
    optimized += ` ${randomCta}`;
  }
  
  // Ensure optimal length
  if (optimized.length > 160) {
    optimized = optimized.substring(0, 157) + '...';
  }
  
  return optimized;
};

const generateDynamicOGImage = (title: string, description: string): string => {
  const params = new URLSearchParams({
    title: title.substring(0, 60),
    description: description.substring(0, 100),
    brand: 'RefSpring'
  });
  
  return `https://refspring.com/api/og-image?${params.toString()}`;
};

const generateStructuredData = (schema: string, title: string, description: string, url: string) => {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': schema,
    name: title,
    description: description,
    url: url
  };
  
  switch (schema) {
    case 'Product':
      return {
        ...baseSchema,
        brand: { '@type': 'Brand', name: 'RefSpring' },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock'
        }
      };
      
    case 'SoftwareApplication':
      return {
        ...baseSchema,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web Browser'
      };
      
    default:
      return baseSchema;
  }
};

const generateBreadcrumbSchema = (breadcrumbs: Array<{ name: string; url: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  };
};