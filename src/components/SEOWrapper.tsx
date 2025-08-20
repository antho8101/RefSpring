import { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useSEO, useSEOAnalytics, useCoreWebVitals, SEOPageData, SEOUtils } from '@/hooks/useSEO';

interface SEOWrapperProps extends SEOPageData {
  children: ReactNode;
}

export const SEOWrapper = ({ 
  children, 
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
}: SEOWrapperProps) => {
  const location = useLocation();
  const { trackPageView } = useSEOAnalytics();

  // Use our SEO hook
  useSEO({
    title,
    description,
    keywords,
    canonicalUrl,
    ogImage,
    ogType,
    structuredData,
    alternateLanguages,
    noIndex,
    noFollow
  });

  // Track page view
  useCoreWebVitals();

  // Generate default values
  const finalCanonicalUrl = canonicalUrl || `https://refspring.com${location.pathname}`;
  const finalOGImage = ogImage || SEOUtils.generateOGImage(title, description);
  const finalTitle = title.includes('RefSpring') ? title : `${title} | RefSpring`;

  // Validate SEO data in development
  if (process.env.NODE_ENV === 'development') {
    const errors = SEOUtils.validateSEO({ title, description });
    if (errors.length > 0) {
      console.warn('SEO validation errors:', errors);
    }
  }

  return (
    <>
      <Helmet>
        {/* Basic meta tags */}
        <title>{finalTitle}</title>
        <meta name="description" content={description} />
        {keywords && keywords.length > 0 && (
          <meta name="keywords" content={keywords.join(', ')} />
        )}
        
        {/* Robots */}
        <meta name="robots" content={`${noIndex ? 'noindex' : 'index'}, ${noFollow ? 'nofollow' : 'follow'}`} />
        
        {/* Canonical */}
        <link rel="canonical" href={finalCanonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content={ogType} />
        <meta property="og:url" content={finalCanonicalUrl} />
        <meta property="og:image" content={finalOGImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="RefSpring" />
        <meta property="og:locale" content="fr_FR" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={finalOGImage} />
        <meta name="twitter:site" content="@refspring" />
        
        {/* Additional meta tags for better SEO */}
        <meta name="author" content="RefSpring" />
        <meta name="publisher" content="RefSpring" />
        <meta name="theme-color" content="#0066ff" />
        
        {/* Alternate languages */}
        {alternateLanguages?.map(({ lang, url }) => (
          <link key={lang} rel="alternate" hrefLang={lang} href={url} />
        ))}
        {alternateLanguages && (
          <link rel="alternate" hrefLang="x-default" href={finalCanonicalUrl} />
        )}
        
        {/* Structured Data */}
        {structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )}

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </Helmet>
      
      {children}
    </>
  );
};

// Specialized SEO components for different page types
export const LandingPageSEO = ({ children }: { children: ReactNode }) => {
  const structuredData = {
    ...SEOUtils.generateOrganizationStructuredData(),
    ...SEOUtils.generateSoftwareStructuredData()
  };

  return (
    <SEOWrapper
      title="RefSpring - Plateforme d'Affiliation Nouvelle Génération"
      description="Maximisez vos revenus d'affiliation avec RefSpring. Tracking précis, commissions transparentes, paiements rapides. Rejoignez +1000 affiliés satisfaits."
      keywords={[
        'affiliation',
        'programme partenaire',
        'commission',
        'tracking',
        'revenus passifs',
        'marketing digital',
        'plateforme affiliation',
        'RefSpring'
      ]}
      structuredData={structuredData}
    >
      {children}
    </SEOWrapper>
  );
};

export const PricingPageSEO = ({ children }: { children: ReactNode }) => {
  const structuredData = SEOUtils.generateSoftwareStructuredData();

  return (
    <SEOWrapper
      title="Tarifs RefSpring - Plans d'Affiliation Transparents"
      description="Découvrez nos tarifs transparents pour la plateforme d'affiliation RefSpring. Commissions attractives, pas de frais cachés. Commencez gratuitement."
      keywords={[
        'tarifs affiliation',
        'prix commission',
        'plateforme gratuite',
        'RefSpring pricing'
      ]}
      structuredData={structuredData}
    >
      {children}
    </SEOWrapper>
  );
};

export const AboutPageSEO = ({ children }: { children: ReactNode }) => {
  const structuredData = SEOUtils.generateOrganizationStructuredData();

  return (
    <SEOWrapper
      title="À Propos de RefSpring - Notre Mission d'Affiliation"
      description="Découvrez l'histoire de RefSpring, notre mission de révolutionner l'affiliation et notre engagement envers la transparence et l'innovation."
      keywords={[
        'RefSpring équipe',
        'mission affiliation',
        'à propos',
        'histoire entreprise'
      ]}
      structuredData={structuredData}
    >
      {children}
    </SEOWrapper>
  );
};

export const ContactPageSEO = ({ children }: { children: ReactNode }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contacter RefSpring",
    "description": "Contactez l'équipe RefSpring pour toute question sur notre plateforme d'affiliation",
    "url": "https://refspring.com/contact"
  };

  return (
    <SEOWrapper
      title="Contacter RefSpring - Support et Questions"
      description="Contactez l'équipe RefSpring pour toute question sur notre plateforme d'affiliation. Support réactif et assistance personnalisée."
      keywords={[
        'contact RefSpring',
        'support affiliation',
        'aide plateforme',
        'assistance'
      ]}
      structuredData={structuredData}
    >
      {children}
    </SEOWrapper>
  );
};

export const PrivacyPageSEO = ({ children }: { children: ReactNode }) => {
  return (
    <SEOWrapper
      title="Politique de Confidentialité - RefSpring"
      description="Consultez la politique de confidentialité de RefSpring. Découvrez comment nous protégeons vos données personnelles conformément au RGPD."
      noIndex={true}
      noFollow={true}
    >
      {children}
    </SEOWrapper>
  );
};

export const LegalPageSEO = ({ children }: { children: ReactNode }) => {
  return (
    <SEOWrapper
      title="Mentions Légales - RefSpring"
      description="Mentions légales de RefSpring. Informations sur notre société, hébergement et conditions d'utilisation de la plateforme d'affiliation."
      noIndex={true}
      noFollow={true}
    >
      {children}
    </SEOWrapper>
  );
};