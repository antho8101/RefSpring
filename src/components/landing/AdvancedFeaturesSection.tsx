
import { Brain, Shield, Rocket, Smartphone, Globe, Zap } from "lucide-react";

export const AdvancedFeaturesSection = () => {
  const features = [
    {
      icon: <Brain className="w-8 h-8 text-blue-600" />,
      title: "IA intégrée",
      description: "Optimisation automatique de vos campagnes basée sur l'intelligence artificielle",
      details: ["Prédiction des performances", "Recommandations d'optimisation", "Détection d'anomalies"]
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: "Protection anti-fraude",
      description: "Algorithmes avancés pour détecter et bloquer les clics frauduleux",
      details: ["Détection en temps réel", "Blacklist automatique", "Rapports de sécurité"]
    },
    {
      icon: <Rocket className="w-8 h-8 text-purple-600" />,
      title: "API complète",
      description: "Intégrez RefSpring à vos outils existants avec notre API REST",
      details: ["Documentation complète", "SDKs multiples", "Webhooks en temps réel"]
    },
    {
      icon: <Smartphone className="w-8 h-8 text-orange-600" />,
      title: "Mobile-first",
      description: "Dashboard optimisé mobile pour gérer vos campagnes partout",
      details: ["App responsive", "Notifications push", "Offline ready"]
    },
    {
      icon: <Globe className="w-8 h-8 text-cyan-600" />,
      title: "Multi-devises",
      description: "Gérez vos affiliés internationaux avec support de 120+ devises",
      details: ["Conversion automatique", "Paiements locaux", "Rapports consolidés"]
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-600" />,
      title: "Intégrations",
      description: "Connectez-vous à vos outils favoris en un clic",
      details: ["Shopify, WooCommerce", "Google Analytics", "Slack, Discord"]
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Fonctionnalités avancées
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            RefSpring ne se contente pas du minimum. Découvrez toutes les fonctionnalités 
            qui font de notre plateforme l'outil le plus complet du marché.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-slate-200 h-full">
                <div className="mb-6 transform group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-slate-600 mb-4 leading-relaxed">
                  {feature.description}
                </p>
                
                <ul className="space-y-2">
                  {feature.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-center text-sm text-slate-500">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></div>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl border border-blue-100">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Prêt à découvrir toutes ces fonctionnalités ?
            </h3>
            <p className="text-slate-600 mb-6">
              Créez votre compte gratuit et explorez le dashboard le plus avancé du marché.
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all">
              Commencer gratuitement
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
