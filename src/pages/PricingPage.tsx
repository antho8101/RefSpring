
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { RefSpringLogo } from "@/components/RefSpringLogo";
import { Link } from "react-router-dom";
import { PricingHeader } from "@/components/pricing/PricingHeader";
import { ComparisonSection } from "@/components/shared/ComparisonSection";
import { Calculator } from "@/components/shared/Calculator";
import { TransparencySection } from "@/components/shared/TransparencySection";
import { FAQ } from "@/components/shared/FAQ";
import { PricingCTA } from "@/components/pricing/PricingCTA";
import { PricingFooter } from "@/components/pricing/PricingFooter";

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

        {/* Header */}
        <header className="fixed top-0 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl z-50 transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center gap-2 animate-fade-in hover:opacity-80 transition-opacity">
                <RefSpringLogo width="32" height="32" />
                <div className="font-bold text-2xl text-slate-900">RefSpring</div>
              </Link>
              <nav className="hidden md:flex space-x-8" role="navigation" aria-label="Navigation principale">
                <Link to="/#features" className="text-slate-600 hover:text-slate-900 font-medium transition-all hover:scale-105">
                  Fonctionnalités
                </Link>
                <Link to="/pricing" className="text-slate-900 font-semibold transition-all hover:scale-105">
                  Tarifs
                </Link>
                <Link to="/#dashboard" className="text-slate-600 hover:text-slate-900 font-medium transition-all hover:scale-105">
                  Dashboard
                </Link>
                <Link to="/#testimonials" className="text-slate-600 hover:text-slate-900 font-medium transition-all hover:scale-105">
                  Témoignages
                </Link>
              </nav>
              <Button variant="outline" className="hidden md:flex hover:scale-105 transition-transform" onClick={redirectToDashboard}>
                Se connecter
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content starts right after header */}
        <div className="pt-16">
          <PricingHeader />
          <ComparisonSection onGetStarted={redirectToDashboard} variant="pricing" />
          <Calculator variant="pricing" />
          <TransparencySection variant="pricing" />
          <FAQ variant="pricing" />
          <PricingCTA onGetStarted={redirectToDashboard} />
          <PricingFooter />
        </div>
      </div>
    </>
  );
};

export default PricingPage;
