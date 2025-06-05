import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Users, BarChart3, Shield, CheckCircle, Star, TrendingUp, DollarSign, Clock, Globe, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { RefSpringLogo } from "@/components/RefSpringLogo";

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

        {/* Header */}
        <header className="fixed top-0 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl z-50 transition-all">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <a href="/" className="flex items-center gap-2 animate-fade-in hover:opacity-80 transition-opacity">
                <RefSpringLogo width="32" height="32" />
                <div className="font-bold text-2xl text-slate-900">RefSpring</div>
              </a>
              <nav className="hidden md:flex space-x-8" role="navigation" aria-label="Navigation principale">
                <a href="#features" className="text-slate-600 hover:text-slate-900 font-medium transition-all hover:scale-105">
                  Fonctionnalités
                </a>
                <a href="/pricing" className="text-slate-600 hover:text-slate-900 font-medium transition-all hover:scale-105">
                  Tarifs
                </a>
                <a href="#dashboard" className="text-slate-600 hover:text-slate-900 font-medium transition-all hover:scale-105">
                  Dashboard
                </a>
                <a href="#testimonials" className="text-slate-600 hover:text-slate-900 font-medium transition-all hover:scale-105">
                  Témoignages
                </a>
              </nav>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="hidden md:flex hover:scale-105 transition-transform" onClick={redirectToDashboard}>
                  Se connecter
                </Button>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all animate-pulse"
                  onClick={redirectToDashboard}
                >
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section - Full Viewport */}
        <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 relative">
          {/* Animated Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] animate-pulse"></div>
          
          {/* Floating Icons */}
          <div className="absolute inset-0 pointer-events-none">
            <DollarSign 
              className="absolute top-1/4 left-1/4 w-8 h-8 text-green-500/20 animate-bounce" 
              style={{ animationDelay: '0s', animationDuration: '3s' }}
            />
            <TrendingUp 
              className="absolute top-1/3 right-1/3 w-6 h-6 text-blue-500/20 animate-bounce" 
              style={{ animationDelay: '1s', animationDuration: '4s' }}
            />
            <Zap 
              className="absolute bottom-1/3 left-1/5 w-7 h-7 text-purple-500/20 animate-bounce" 
              style={{ animationDelay: '2s', animationDuration: '3.5s' }}
            />
            <Globe 
              className="absolute top-1/5 right-1/5 w-9 h-9 text-indigo-500/20 animate-bounce" 
              style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}
            />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-6 py-3 rounded-full text-sm font-medium mb-8 border border-blue-200/50 backdrop-blur-sm animate-scale-in">
                <CheckCircle className="w-4 h-4" />
                0€ de frais mensuels • Rémunération sur performance uniquement
                <Star className="w-4 h-4 text-yellow-500" />
              </div>
              
              <h1 className="text-6xl md:text-8xl font-bold text-slate-900 leading-tight mb-8 animate-fade-in">
                La plateforme d'affiliation
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent animate-pulse">
                  qui paie pour elle-même
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Contrairement aux autres plateformes facturant 99-299€/mois, RefSpring utilise un <strong>modèle basé sur les revenus</strong> : 
                <br />
                <span className="text-slate-900 font-semibold">100% d'accès gratuit, nous gagnons seulement quand vous gagnez.</span>
              </p>

              {/* Value props with animations */}
              <div className="flex flex-wrap justify-center gap-6 mb-12">
                {[
                  { icon: CheckCircle, text: "0€ de frais d'installation", delay: "0.3s" },
                  { icon: CheckCircle, text: "0€ d'abonnement mensuel", delay: "0.4s" },
                  { icon: CheckCircle, text: "Accès complet à la plateforme", delay: "0.5s" }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-200 hover:scale-105 transition-all animate-fade-in shadow-lg"
                    style={{ animationDelay: item.delay }}
                  >
                    <item.icon className="w-5 h-5 text-green-600" />
                    <span className="text-slate-700 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <Button 
                  size="lg" 
                  className="text-lg px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-3xl transition-all hover:scale-105 border-0 text-white" 
                  onClick={redirectToDashboard}
                >
                  Commencer à gagner dès aujourd'hui
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-12 py-6 border-2 hover:bg-slate-50 shadow-lg hover:scale-105 transition-all backdrop-blur-sm" 
                  onClick={redirectToDashboard}
                >
                  Voir comment ça marche
                </Button>
              </div>

              {/* Social proof with animation */}
              <div className="mt-16 pt-8 border-t border-slate-200/50 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                <p className="text-slate-500 text-sm mb-6">Adopté par les entreprises qui veulent des résultats, pas des factures récurrentes</p>
                <div className="flex justify-center items-center gap-8 opacity-70">
                  <div className="text-3xl font-bold text-slate-600 hover:text-blue-600 transition-colors">50M€+</div>
                  <div className="w-px h-8 bg-slate-300"></div>
                  <div className="text-lg font-medium text-slate-500">Générés</div>
                  <div className="w-px h-8 bg-slate-300"></div>
                  <div className="text-3xl font-bold text-green-600">0€</div>
                  <div className="w-px h-8 bg-slate-300"></div>
                  <div className="text-lg font-medium text-slate-500">D'avance</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                L'histoire qui change tout
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Pendant que d'autres plateformes demandent 299€/mois d'avance avant que vous gagniez un seul euro, 
                nous croyons en une approche différente : <strong>votre succès est notre succès.</strong>
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {[
                {
                  step: "01",
                  title: "Plateformes traditionnelles",
                  description: "Payez 99-299€/mois, espérez le meilleur, priez pour couvrir vos coûts",
                  icon: "❌",
                  color: "red"
                },
                {
                  step: "02", 
                  title: "La méthode RefSpring",
                  description: "Commencez immédiatement, accès complet, nous gagnons seulement quand vous gagnez. Zéro risque.",
                  icon: "✅",
                  color: "green"
                },
                {
                  step: "03",
                  title: "Votre résultat",
                  description: "Concentrez-vous sur votre croissance, pas sur les factures mensuelles. Chaque euro gagné est du profit pur.",
                  icon: "🚀",
                  color: "blue"
                }
              ].map((item, index) => (
                <article key={index} className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <div className="text-sm font-bold text-slate-400 mb-2">{item.step}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Dashboard Preview Section */}
        <section id="dashboard" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Votre command center attend
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Un dashboard aussi intuitif que vous ne l'avez jamais eu.
              </p>
            </div>
            
            {/* Mock Dashboard Preview */}
            <div className="relative max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-700">
                <div className="bg-white rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="ml-auto text-sm text-slate-500">dashboard.refspring.com</div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-8 h-8 text-blue-600" />
                        <div className="text-2xl font-bold text-slate-900">€12,847</div>
                      </div>
                      <div className="text-sm text-slate-600">This month's revenue</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="w-8 h-8 text-green-600" />
                        <div className="text-2xl font-bold text-slate-900">847</div>
                      </div>
                      <div className="text-sm text-slate-600">Active affiliates</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <BarChart3 className="w-8 h-8 text-purple-600" />
                        <div className="text-2xl font-bold text-slate-900">+23%</div>
                      </div>
                      <div className="text-sm text-slate-600">Growth this week</div>
                    </div>
                  </div>
                  
                  <div className="h-32 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <div className="text-slate-600 font-medium">Interactive Analytics Dashboard</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Success stories that inspire
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Real companies, real results, real revenue growth.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Marie Laurent",
                  company: "TechFlow SaaS",
                  revenue: "€45K",
                  quote: "We went from €0 to €45K in affiliate revenue in 6 months. The fact that RefSpring only earns when we earn made the decision so easy.",
                  avatar: "ML"
                },
                {
                  name: "Thomas Dubois", 
                  company: "EcoCommerce",
                  revenue: "€78K",
                  quote: "No monthly fees means we could test and scale without fear. Our affiliate program now generates more revenue than our direct sales.",
                  avatar: "TD"
                },
                {
                  name: "Sophie Chen",
                  company: "FinanceApp",
                  revenue: "€120K",
                  quote: "RefSpring's transparent model aligned perfectly with our startup mindset. We only pay for actual results, not promises.",
                  avatar: "SC"
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl transition-all hover:scale-105">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{testimonial.name}</div>
                      <div className="text-sm text-slate-500">{testimonial.company}</div>
                    </div>
                    <div className="ml-auto text-2xl font-bold text-green-600">{testimonial.revenue}</div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 leading-relaxed italic">"{testimonial.quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section Enhanced */}
        <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Everything you need to dominate
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Powerful tools designed to help you build and manage successful affiliate programs at scale.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <Zap className="h-10 w-10 text-blue-600" />,
                  title: "Lightning Fast",
                  description: "Set up your affiliate program in minutes, not weeks. One-click deployment.",
                  metric: "3 min setup"
                },
                {
                  icon: <Users className="h-10 w-10 text-green-600" />,
                  title: "Smart Recruitment",
                  description: "AI-powered affiliate matching. Find and onboard top performers automatically.",
                  metric: "847 affiliates"
                },
                {
                  icon: <BarChart3 className="h-10 w-10 text-purple-600" />,
                  title: "Real-time Analytics",
                  description: "Track performance with crystal-clear insights. Know what's working instantly.",
                  metric: "Live tracking"
                },
                {
                  icon: <Shield className="h-10 w-10 text-orange-600" />,
                  title: "Fraud Protection",
                  description: "Advanced AI security to protect against fraudulent activities and fake traffic.",
                  metric: "99.9% accuracy"
                }
              ].map((feature, index) => (
                <div key={index} className="group p-8 rounded-2xl bg-white hover:bg-gradient-to-br hover:from-white hover:to-slate-50 transition-all hover:scale-105 shadow-lg hover:shadow-xl border border-slate-100">
                  <div className="mb-6 transform group-hover:scale-110 transition-transform">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 mb-4 leading-relaxed">{feature.description}</p>
                  <div className="text-sm font-bold text-blue-600">{feature.metric}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section Enhanced */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20"></div>
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <h2 className="text-4xl font-bold text-white mb-4">
              Numbers that speak louder than words
            </h2>
            <p className="text-xl text-slate-300 mb-16 max-w-2xl mx-auto">
              Join the revolution of performance-based affiliate marketing.
            </p>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { number: "10K+", label: "Active Campaigns", icon: <Globe className="w-8 h-8" /> },
                { number: "€50M+", label: "Revenue Generated", icon: <TrendingUp className="w-8 h-8" /> },
                { number: "99.9%", label: "Uptime", icon: <Shield className="w-8 h-8" /> },
                { number: "€0", label: "Upfront Costs", icon: <Award className="w-8 h-8" /> }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="flex justify-center mb-4 text-blue-400 group-hover:text-blue-300 transition-colors">
                    {stat.icon}
                  </div>
                  <div className="text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">{stat.number}</div>
                  <div className="text-xl text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section Enhanced */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="mb-8">
              <Clock className="w-16 h-16 text-blue-200 mx-auto mb-4 animate-pulse" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Your competition is already here
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              While others pay monthly fees for uncertain results, smart companies are already earning with RefSpring's 
              performance-based model. Don't let them get ahead.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-lg px-12 py-6 bg-white text-slate-900 hover:bg-slate-100 hover:scale-105 transition-all shadow-xl" 
                onClick={redirectToDashboard}
              >
                Start earning now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-12 py-6 border-2 border-white text-white hover:bg-white hover:text-slate-900 hover:scale-105 transition-all" 
                onClick={redirectToDashboard}
              >
                See live demo
              </Button>
            </div>
          </div>
        </section>

        {/* Footer Enhanced */}
        <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t border-slate-800">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-5 gap-8">
              <div className="md:col-span-2">
                <div className="font-bold text-3xl text-white mb-4">RefSpring</div>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  La plateforme d'affiliation qui paie pour elle-même. 
                  Join the future of affiliate marketing.
                </p>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                    <Globe className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                    <TrendingUp className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-4">Product</h3>
                <ul className="space-y-3 text-slate-400">
                  <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                  <li><a href="#dashboard" className="hover:text-white transition-colors">Dashboard</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-4">Company</h3>
                <ul className="space-y-3 text-slate-400">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-4">Support</h3>
                <ul className="space-y-3 text-slate-400">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-400">&copy; 2024 RefSpring. All rights reserved.</p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy</a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms</a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">Security</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
