import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { StorySection } from "@/components/landing/StorySection";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { AdvancedFeaturesSection } from "@/components/landing/AdvancedFeaturesSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { StatsSection } from "@/components/landing/StatsSection";
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
    window.location.href = '/app?signup=true';
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "RefSpring",
    "applicationCategory": "Business Software",
    "operatingSystem": "Web Browser",
    "description": "Créez votre programme d'affiliation en quelques minutes et ne payez que quand vos affiliés vous ramènent des ventes. Fini les 99-299€/mois !",
    "url": "https://refspring.com",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
      "description": "Gratuit au démarrage - Seulement 2,5% sur les ventes générées"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "847"
    },
    "features": [
      "Création de programme d'affiliation en 3 minutes",
      "Suivi des ventes en temps réel", 
      "Aucun frais mensuel fixe",
      "Commission uniquement sur résultats"
    ]
  };

  return (
    <>
      <Helmet>
        <title>RefSpring - Créez votre programme d'affiliation et ne payez que quand ça marche !</title>
        <meta name="description" content="Créez votre programme d'affiliation en 3 minutes et ne payez que 2,5% sur les ventes générées. Fini les 99-299€/mois ! Nous gagnons seulement quand vous gagnez." />
        
        <meta name="keywords" content="programme affiliation, créer affiliation, commission vente, affiliation gratuite, plateforme affiliation, revenus affiliation, marketing affiliation, vente en ligne" />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        
        <meta property="og:title" content="RefSpring - Créez votre programme d'affiliation et ne payez que quand ça marche !" />
        <meta property="og:description" content="Fini les plateformes à 99-299€/mois ! Créez votre programme d'affiliation gratuitement et ne payez que 2,5% sur les ventes générées. Simple, transparent, honnête." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://refspring.com" />
        <meta property="og:image" content="https://refspring.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="RefSpring" />
        <meta property="og:locale" content="fr_FR" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@refspring" />
        <meta name="twitter:creator" content="@refspring" />
        <meta name="twitter:title" content="RefSpring - Programme d'affiliation qui marche" />
        <meta name="twitter:description" content="Créez votre programme d'affiliation en 3 minutes. Ne payez que 2,5% sur les ventes générées. Fini les frais mensuels !" />
        <meta name="twitter:image" content="https://refspring.com/og-image.jpg" />
        
        <link rel="canonical" href="https://refspring.com" />
        <link rel="alternate" hrefLang="fr" href="https://refspring.com" />
        <link rel="alternate" hrefLang="en" href="https://refspring.com/en" />
        
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        
        <meta httpEquiv="Cache-Control" content="public, max-age=31536000" />
        
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Helmet>

      <div className="min-h-screen bg-white overflow-hidden">
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
        <StorySection />
        <div id="dashboard">
          <DashboardPreview />
        </div>
        <AdvancedFeaturesSection />
        <div id="testimonials">
          <TestimonialsSection />
        </div>
        <FeaturesSection />
        <StatsSection />
        <CTASection onRedirectToDashboard={redirectToDashboard} />
        <LandingFooter />
      </div>
    </>
  );
};

export default LandingPage;
