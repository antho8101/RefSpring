
import { Helmet } from "react-helmet-async";
import { UnifiedHeader } from "@/components/shared/UnifiedHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Users, Target, Award, Heart, Lightbulb, Shield } from "lucide-react";

const AboutPage = () => {
  const redirectToDashboard = () => {
    window.location.href = '/app';
  };

  return (
    <>
      <Helmet>
        <title>À propos de RefSpring - Notre mission, notre équipe, nos valeurs</title>
        <meta name="description" content="Découvrez l'histoire de RefSpring, notre mission de révolutionner l'affiliation et les valeurs qui nous guident au quotidien." />
        <link rel="canonical" href="https://refspring.com/about" />
      </Helmet>

      <div className="min-h-screen bg-white">
        <UnifiedHeader onRedirectToDashboard={redirectToDashboard} />
        
        <div className="pt-24 pb-16">
          {/* Hero Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
                À propos de RefSpring
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                Nous révolutionnons l'affiliation en créant la première plateforme qui grandit avec vous, 
                sans barrière financière d'entrée.
              </p>
            </div>
          </section>

          {/* Mission Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Notre Mission</h2>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                  Démocratiser l'affiliation en supprimant les barrières financières qui empêchent 
                  les entrepreneurs de lancer leur business.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">Accessibilité</h3>
                  <p className="text-slate-600">
                    Rendre l'affiliation accessible à tous, sans frais d'entrée ni barrières financières.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lightbulb className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">Innovation</h3>
                  <p className="text-slate-600">
                    Innover continuellement pour offrir les meilleurs outils et fonctionnalités du marché.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">Partenariat</h3>
                  <p className="text-slate-600">
                    Construire des relations durables basées sur le succès mutuel et la transparence.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Story Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Notre Histoire</h2>
              
              <div className="prose prose-lg mx-auto text-slate-600">
                <p>
                  RefSpring est né d'un constat simple : trop d'entrepreneurs talentueux abandonnent leurs projets 
                  d'affiliation à cause des coûts prohibitifs des plateformes existantes.
                </p>
                
                <p>
                  En 2024, notre équipe de développeurs et d'experts en marketing a décidé de changer la donne. 
                  Plutôt que de facturer des frais mensuels fixes, nous avons créé un modèle révolutionnaire : 
                  nous ne gagnons que lorsque vous gagnez.
                </p>
                
                <p>
                  Aujourd'hui, RefSpring accompagne plus de 10 000 entreprises dans leur croissance, 
                  avec plus de 50 millions d'euros générés pour nos clients. Et ce n'est que le début.
                </p>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Nos Valeurs</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <Shield className="h-8 w-8 text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Transparence</h3>
                  <p className="text-slate-600">
                    Pas de frais cachés, pas de clauses obscures. Tout est clair et transparent.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <Users className="h-8 w-8 text-green-600 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Communauté</h3>
                  <p className="text-slate-600">
                    Nous croyons en la force de la communauté et de l'entraide entre entrepreneurs.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <Award className="h-8 w-8 text-purple-600 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Excellence</h3>
                  <p className="text-slate-600">
                    Nous nous efforçons d'offrir la meilleure expérience utilisateur possible.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Rejoignez l'aventure RefSpring
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Découvrez pourquoi plus de 10 000 entreprises nous font confiance pour leur croissance.
              </p>
              <button
                onClick={redirectToDashboard}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Commencer gratuitement
              </button>
            </div>
          </section>
        </div>

        <LandingFooter />
      </div>
    </>
  );
};

export default AboutPage;
