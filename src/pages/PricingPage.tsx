
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { UnifiedHeader } from "@/components/shared/UnifiedHeader";
import { PricingHeader } from "@/components/pricing/PricingHeader";
import { Calculator } from "@/components/shared/Calculator";
import { TransparencySection } from "@/components/shared/TransparencySection";
import { FAQ } from "@/components/shared/FAQ";
import { PricingCTA } from "@/components/pricing/PricingCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";

const PricingPage = () => {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const redirectToDashboard = () => {
    window.location.href = 'https://dashboard.refspring.com';
  };

  return (
    <>
      <Helmet>
        <title>Tarifs RefSpring - 0€/mois, 2.5% sur vos gains uniquement | Économisez des milliers d'euros</title>
        <meta name="description" content="Contrairement aux autres plateformes (299€/mois + 10%), RefSpring ne coûte que 2.5% sur vos gains. Calculez vos économies et voyez pourquoi 10K+ entreprises nous font confiance." />
        <link rel="canonical" href="https://refspring.com/pricing" />
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

        <UnifiedHeader onRedirectToDashboard={redirectToDashboard} currentPage="pricing" />

        {/* Main Content starts right after header */}
        <div className="pt-16">
          <PricingHeader onGetStarted={redirectToDashboard} />
          <Calculator variant="pricing" />
          <TransparencySection variant="pricing" />
          <FAQ variant="pricing" />
          <PricingCTA onGetStarted={redirectToDashboard} />
          <LandingFooter />
        </div>
      </div>
    </>
  );
};

export default PricingPage;
