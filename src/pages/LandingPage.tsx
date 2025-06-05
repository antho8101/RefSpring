import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { TransparencySection } from "@/components/landing/TransparencySection";
import { SimpleCalculator } from "@/components/landing/SimpleCalculator";
import { StorySection } from "@/components/landing/StorySection";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { LandingFAQ } from "@/components/landing/LandingFAQ";
import { CTASection } from "@/components/landing/CTASection";
import { LandingFooter } from "@/components/landing/LandingFooter";

const LandingPage = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const redirectToDashboard = () => {
    window.location.href = '/app';
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "RefSpring",
    "applicationCategory": "Business Software",
    "operatingSystem": "Web Browser",
    "description": "Plateforme d'affiliation révolutionnaire sans frais mensuels. Modèle basé sur les revenus : nous gagnons seulement quand vous gagnez.",
    "url": "https://refspring.com",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
      "description": "Accès gratuit - Rémunération basée sur les performances"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "847"
    },
    "features": [
      "Gestion d'affiliés intelligente",
      "Analytics en temps réel", 
      "Protection anti-fraude",
      "API complète"
    ]
  };

  return (
    <>
      <Helmet>
        {/* Title et Description */}
        <title>RefSpring - Plateforme d'Affiliation Sans Frais Mensuels | Modèle Basé sur les Revenus</title>
        <meta name="description" content="RefSpring révolutionne l'affiliation : 0€ de frais mensuels, accès complet gratuit. Nous gagnons seulement quand vous gagnez. +50M€ générés, 0€ d'avance." />
        
        {/* Mots-clés */}
        <meta name="keywords" content="affiliation, plateforme affiliation, marketing affiliation, commission affiliation, programme affiliation, revenus passifs, SaaS affiliation, tracking affiliation" />
        
        {/* Données structurées */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        
        {/* Open Graph optimisé */}
        <meta property="og:title" content="RefSpring - La Plateforme d'Affiliation qui Paie pour Elle-Même" />
        <meta property="og:description" content="Contrairement aux plateformes à 99-299€/mois, RefSpring utilise un modèle basé sur les revenus : 100% gratuit, nous gagnons seulement quand vous gagnez." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://refspring.com" />
        <meta property="og:image" content="https://refspring.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="RefSpring" />
        <meta property="og:locale" content="fr_FR" />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@refspring" />
        <meta name="twitter:creator" content="@refspring" />
        <meta name="twitter:title" content="RefSpring - Plateforme d'Affiliation Sans Frais" />
        <meta name="twitter:description" content="0€ de frais mensuels, 100% gratuit. Nous gagnons seulement quand vous gagnez. +50M€ générés." />
        <meta name="twitter:image" content="https://refspring.com/og-image.jpg" />
        
        {/* Canonical et liens */}
        <link rel="canonical" href="https://refspring.com" />
        <link rel="alternate" hrefLang="fr" href="https://refspring.com" />
        <link rel="alternate" hrefLang="en" href="https://refspring.com/en" />
        
        {/* Robots et indexation */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        
        {/* Performance et cache */}
        <meta httpEquiv="Cache-Control" content="public, max-age=31536000" />
        
        {/* Favicon et icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* Preconnect pour performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Helmet>

      <div className="min-h-screen bg-white overflow-hidden">
        {/* Floating Background Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div 
            className="absolute top-20 right-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"
            style={{ transform: `translateY(${scrollY * 0.1}px)` }}
          ></div>
          <div 
            className="absolute top-1/2 left-10 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl animate-pulse"
            style={{ transform: `translateY(${scrollY * -0.05}px)` }}
          ></div>
          <div 
            className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-green-500/5 rounded-full blur-2xl animate-pulse"
            style={{ transform: `translateY(${scrollY * 0.15}px)` }}
          ></div>
        </div>

        <LandingHeader onRedirectToDashboard={redirectToDashboard} />
        <HeroSection scrollY={scrollY} onRedirectToDashboard={redirectToDashboard} />
        <ComparisonSection onGetStarted={redirectToDashboard} />
        <TransparencySection />
        <SimpleCalculator />
        <StorySection />
        <DashboardPreview />
        <TestimonialsSection />
        <FeaturesSection />
        <StatsSection />
        <LandingFAQ />
        <CTASection onRedirectToDashboard={redirectToDashboard} />
        <LandingFooter />
      </div>
    </>
  );
};

export default LandingPage;
