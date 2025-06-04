import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Check, X, Calculator, DollarSign, Shield, Users, Zap, Clock, Globe, Star, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { RefSpringLogo } from "@/components/RefSpringLogo";
import { Link } from "react-router-dom";

const PricingPage = () => {
  const [monthlyRevenue, setMonthlyRevenue] = useState(10000);
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const competitorsCost = 299 + (monthlyRevenue * 0.10); // 299€/mois + 10% commission
  const refspringCost = monthlyRevenue >= 20 ? monthlyRevenue * 0.025 : 0; // 2.5% seulement si > 20€
  const savings = competitorsCost - refspringCost;

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
        {/* Floating Background Elements - même que la landing */}
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

        {/* Header - exactement comme la landing */}
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
          {/* Pricing intro section */}
          <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] animate-pulse"></div>
            
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 px-6 py-3 rounded-full text-sm font-medium mb-8 border border-green-200/50 backdrop-blur-sm animate-scale-in">
                <Shield className="w-4 h-4" />
                Tarifs transparents
                <Star className="w-4 h-4 text-yellow-500" />
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight mb-8 animate-fade-in">
                Un modèle de <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">pricing équitable</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Pas de frais mensuels, vous ne payez que sur vos gains réels. 
                Simple, transparent et aligné sur votre succès.
              </p>
            </div>
          </section>

          {/* Comparison Table */}
          <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                  Comparez les modèles tarifaires
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  Découvrez les différences entre les approches du marché
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Competitors */}
                <Card className="border-2 border-slate-200 relative shadow-lg hover:shadow-xl transition-all">
                  <div className="absolute -top-3 left-4 bg-slate-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Modèle traditionnel
                  </div>
                  <CardHeader className="text-center pt-8">
                    <CardTitle className="text-2xl text-slate-900">Plateformes SaaS</CardTitle>
                    <div className="text-4xl font-bold text-slate-600 mt-4">
                      199-599€<span className="text-lg text-slate-500">/mois</span>
                    </div>
                    <p className="text-slate-500">+ commission variable</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <X className="w-5 h-5 text-slate-500" />
                        <span>Frais mensuels fixes</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <X className="w-5 h-5 text-slate-500" />
                        <span>Commission additionnelle</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <X className="w-5 h-5 text-slate-500" />
                        <span>Engagement contractuel</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <X className="w-5 h-5 text-slate-500" />
                        <span>Coûts même sans revenus</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* RefSpring */}
                <Card className="border-4 border-green-500 relative transform scale-105 shadow-2xl bg-white">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full text-sm font-medium">
                    RefSpring
                  </div>
                  <CardHeader className="text-center pt-8">
                    <CardTitle className="text-2xl text-slate-900">Modèle au succès</CardTitle>
                    <div className="text-4xl font-bold text-green-600 mt-4">
                      0€<span className="text-lg text-slate-500">/mois</span>
                    </div>
                    <p className="text-slate-500">2,5% sur vos gains uniquement</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="font-semibold">Aucun frais fixe</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="font-semibold">Commission minimale</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="font-semibold">Aucun engagement</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="font-semibold">Payez seulement si vous gagnez</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6 bg-green-600 hover:bg-green-700 hover:scale-105 transition-all" onClick={redirectToDashboard}>
                      Commencer maintenant
                    </Button>
                  </CardContent>
                </Card>

                {/* Freemium */}
                <Card className="border-2 border-blue-200 relative shadow-lg hover:shadow-xl transition-all">
                  <div className="absolute -top-3 left-4 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Modèle freemium
                  </div>
                  <CardHeader className="text-center pt-8">
                    <CardTitle className="text-2xl text-slate-900">Solutions gratuites</CardTitle>
                    <div className="text-4xl font-bold text-blue-600 mt-4">
                      0€<span className="text-lg text-slate-500">/mois</span>
                    </div>
                    <p className="text-slate-500">Limites importantes</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <X className="w-5 h-5 text-blue-500" />
                        <span>Fonctionnalités limitées</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <X className="w-5 h-5 text-blue-500" />
                        <span>Support restreint</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <X className="w-5 h-5 text-blue-500" />
                        <span>Branding de la plateforme</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <X className="w-5 h-5 text-blue-500" />
                        <span>Limites de volume</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Interactive Calculator */}
          <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <Calculator className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                  Calculez vos coûts
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  Comparez les différents modèles selon vos revenus
                </p>
              </div>

              <Card className="bg-white shadow-xl">
                <CardContent className="p-8">
                  <div className="mb-8">
                    <label className="block text-lg font-semibold text-slate-900 mb-4">
                      Revenus mensuels de vos affiliés
                    </label>
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="50000"
                        step="1000"
                        value={monthlyRevenue}
                        onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                        className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="text-center mt-4">
                        <span className="text-3xl font-bold text-blue-600">
                          {monthlyRevenue.toLocaleString('fr-FR')}€
                        </span>
                        <span className="text-slate-500 ml-2">par mois</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center p-6 bg-slate-50 rounded-xl">
                      <h3 className="font-semibold text-slate-900 mb-2">Plateformes SaaS</h3>
                      <div className="text-2xl font-bold text-slate-600 mb-1">
                        {competitorsCost.toLocaleString('fr-FR')}€
                      </div>
                      <p className="text-sm text-slate-500">299€/mois + 10% commission</p>
                    </div>

                    <div className="text-center p-6 bg-green-50 rounded-xl border-2 border-green-200">
                      <h3 className="font-semibold text-slate-900 mb-2">RefSpring</h3>
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {refspringCost.toLocaleString('fr-FR')}€
                      </div>
                      <p className="text-sm text-slate-500">0€/mois + 2,5% commission</p>
                    </div>

                    <div className="text-center p-6 bg-blue-50 rounded-xl">
                      <h3 className="font-semibold text-slate-900 mb-2">Économies</h3>
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {savings.toLocaleString('fr-FR')}€
                      </div>
                      <p className="text-sm text-slate-500">Par mois</p>
                    </div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
                    <h3 className="text-xl font-semibold mb-2">Économies annuelles</h3>
                    <div className="text-4xl font-bold mb-2">
                      {(savings * 12).toLocaleString('fr-FR')}€
                    </div>
                    <p className="text-blue-100">
                      Différence avec RefSpring
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Transparency Section */}
          <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                  Comment fonctionnent nos 2,5% ?
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  Transparence totale sur notre modèle de facturation
                </p>
              </div>

              {/* ... keep existing code (transparency section content) */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-blue-600 font-bold text-sm">1</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-2">Vous générez des commissions</h3>
                        <p className="text-slate-600">Vos affiliés font des ventes, vous gagnez de l'argent.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-blue-600 font-bold text-sm">2</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-2">Seuil de 20€ atteint</h3>
                        <p className="text-slate-600">Nous facturons seulement si vous avez gagné plus de 20€ dans le mois.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-blue-600 font-bold text-sm">3</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-2">Facturation le 5 du mois</h3>
                        <p className="text-slate-600">Facture automatique de 2,5% sur vos gains du mois précédent.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-2">Vous gardez 97,5%</h3>
                        <p className="text-slate-600">Le reste est entièrement pour vous. Aucun frais caché.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-2xl">
                  <h3 className="text-xl font-semibold text-slate-900 mb-6">Exemple concret</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-600">Commissions générées en janvier</span>
                      <span className="font-semibold text-slate-900">1 000€</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                      <span className="text-slate-600">Notre fee (2,5%)</span>
                      <span className="font-semibold text-red-500">- 25€</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                      <span className="text-slate-900 font-semibold">Vous gardez</span>
                      <span className="font-bold text-green-600 text-lg">975€</span>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-slate-500">
                        Facturation le 5 février via Stripe.
                        <br />
                        Simple et transparent.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                  Questions fréquentes
                </h2>
              </div>

              <div className="space-y-6">
                {[
                  {
                    q: "Pourquoi ne pas demander de carte bancaire à l'inscription ?",
                    a: "Nous croyons en la confiance mutuelle. Vous pouvez tester RefSpring entièrement, créer des campagnes et voir les résultats avant de nous donner votre CB. La carte n'est demandée qu'à la création de votre première campagne."
                  },
                  {
                    q: "Que se passe-t-il si je gagne moins de 20€ dans un mois ?",
                    a: "Aucune facturation ! Le seuil de 20€ évite les micro-facturations et les frais Stripe disproportionnés. Vous ne payez rien ce mois-là."
                  },
                  {
                    q: "Puis-je utiliser une carte différente pour chaque campagne ?",
                    a: "Absolument ! Parfait si vous gérez plusieurs clients ou avez des comptes séparés. Chaque campagne peut avoir sa propre méthode de paiement."
                  },
                  {
                    q: "Comment êtes-vous sûrs que 2,5% est rentable pour vous ?",
                    a: "Nous avons optimisé nos coûts d'infrastructure et automatisé nos processus. Notre modèle fonctionne sur le volume : plus vous réussissez, plus nous réussissons ensemble."
                  },
                  {
                    q: "Y a-t-il des frais cachés ?",
                    a: "Zéro. Les 2,5% incluent tout : hébergement, support, mises à jour, analytics, API. Aucun frais de setup, d'export, ou premium."
                  }
                ].map((faq, index) => (
                  <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-all">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-slate-900 mb-3">{faq.q}</h3>
                      <p className="text-slate-600 leading-relaxed">{faq.a}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA - même style que la landing */}
          <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <div className="mb-8">
                <Clock className="w-16 h-16 text-blue-200 mx-auto mb-4 animate-pulse" />
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Prêt à commencer ?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                Rejoignez les entreprises qui ont choisi un modèle équitable.
                Aucun risque, aucun engagement.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="text-lg px-12 py-6 bg-white text-slate-900 hover:bg-slate-100 hover:scale-105 transition-all shadow-xl" 
                  onClick={redirectToDashboard}
                >
                  Créer mon compte gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-12 py-6 border-2 border-white text-white hover:bg-white hover:text-slate-900 hover:scale-105 transition-all"
                >
                  Voir une démo live
                </Button>
              </div>
              <p className="text-blue-200 text-sm mt-6">
                ✓ Aucune carte bancaire requise ✓ Accès complet immédiat ✓ Support inclus
              </p>
            </div>
          </section>

          {/* Footer - exactement comme la landing */}
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
                    <li><Link to="/#features" className="hover:text-white transition-colors">Fonctionnalités</Link></li>
                    <li><Link to="/#dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
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
      </div>
    </>
  );
};

export default PricingPage;
