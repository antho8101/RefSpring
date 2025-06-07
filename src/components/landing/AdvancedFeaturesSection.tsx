
import { Brain, Shield, Rocket, Smartphone, Globe, Zap, Star, Heart } from "lucide-react";
import { useState, useEffect, useRef } from 'react';

export const AdvancedFeaturesSection = () => {
  const [visibleFeatures, setVisibleFeatures] = useState<number[]>([]);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const featureIndex = parseInt(entry.target.getAttribute('data-feature') || '0');
            setTimeout(() => {
              setVisibleFeatures(prev => [...prev, featureIndex]);
            }, featureIndex * 150);
          }
        });
      },
      { threshold: 0.2 }
    );

    const features = sectionRef.current?.querySelectorAll('[data-feature]');
    features?.forEach(feature => observer.observe(feature));

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-blue-600" />,
      title: "Dashboard intelligent 🧠",
      description: "Un tableau de bord qui vous montre tout ce qui compte : performances, tendances, affiliés top. Simple et efficace !",
      details: ["Métriques en temps réel", "Graphiques clairs", "Données exportables"],
      funEmoji: "📊",
      hoverText: "Tout ce dont vous avez besoin, rien de plus !"
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: "Tracking fiable 🛡️",
      description: "Notre système de tracking suit chaque clic, chaque conversion. Pas de commissions perdues, pas de disputes !",
      details: ["Tracking pixel", "Liens personnalisés", "Rapports détaillés"],
      funEmoji: "🎯",
      hoverText: "Chaque euro compte et on les compte bien !"
    },
    {
      icon: <Rocket className="w-8 h-8 text-purple-600" />,
      title: "Configuration rapide 🚀",
      description: "5 minutes pour créer votre programme. Code à copier-coller, liens à partager. C'est tout !",
      details: ["Setup en 5 min", "Code simple", "Support réactif"],
      funEmoji: "⚡",
      hoverText: "Plus simple qu'une playlist Spotify !"
    },
    {
      icon: <Smartphone className="w-8 h-8 text-orange-600" />,
      title: "Interface mobile 📱",
      description: "Suivez vos performances depuis votre canapé. L'app fonctionne partout, même dans le métro !",
      details: ["App responsive", "Données sync", "Accès offline"],
      funEmoji: "🛋️",
      hoverText: "Gérez votre business en pyjama !"
    },
    {
      icon: <Globe className="w-8 h-8 text-cyan-600" />,
      title: "Multi-devises 🌍",
      description: "Dollars, euros, livres... On gère les principales devises pour vos affiliés internationaux !",
      details: ["EUR, USD, GBP", "Conversion auto", "Rapports consolidés"],
      funEmoji: "💱",
      hoverText: "Votre business sans frontières !"
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-600" />,
      title: "Paiements automatiques ⚡",
      description: "Configurez les paiements une fois, on s'occupe du reste. Vos affiliés sont payés automatiquement !",
      details: ["Paiements auto", "Seuils configurables", "Historique complet"],
      funEmoji: "💰",
      hoverText: "Moins de paperasse, plus de business !"
    }
  ];

  return (
    <section ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-r from-green-200 to-blue-200 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full blur-xl animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full border border-yellow-200">
            <Star className="w-5 h-5 text-yellow-600 animate-spin" />
            <span className="text-yellow-700 font-semibold">Ce qu'on fait vraiment</span>
            <Heart className="w-4 h-4 text-red-500 animate-pulse" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Les fonctionnalités qui marchent 🔥
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Pas de promesses en l'air ! RefSpring vous donne 
            <span className="font-bold text-blue-600"> les outils essentiels</span> pour gérer votre affiliation.
            <br />
            <span className="text-green-600 font-semibold">Simple, efficace, et ça marche ! 😎</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              data-feature={index}
              className={`group h-full transition-all duration-500 ${
                visibleFeatures.includes(index) 
                  ? 'animate-fade-in-scale opacity-100' 
                  : 'opacity-0 translate-y-8'
              }`}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:border-blue-200 h-full relative overflow-hidden group-hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-purple-50/0 group-hover:from-blue-50 group-hover:to-purple-50 transition-all duration-300"></div>
                
                <div className="absolute top-4 right-4 text-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100 group-hover:animate-bounce">
                  {feature.funEmoji}
                </div>
                
                <div className="relative z-10">
                  <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-600 mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <ul className="space-y-2 mb-4">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center text-sm text-slate-500 group-hover:text-slate-600 transition-colors">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3 group-hover:animate-pulse"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>

                  <div className={`transition-all duration-300 ${
                    hoveredFeature === index 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-2'
                  }`}>
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-700 font-medium">{feature.hoverText}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-8 rounded-2xl border border-blue-100 hover:shadow-2xl transition-all group cursor-default relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100/0 via-purple-100/0 to-pink-100/0 group-hover:from-blue-100/50 group-hover:via-purple-100/50 group-hover:to-pink-100/50 transition-all duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Star className="w-6 h-6 text-yellow-500 animate-spin" />
                <h3 className="text-2xl font-bold text-slate-900 group-hover:scale-105 transition-transform">
                  Convaincu ? Tant mieux ! 🎉
                </h3>
                <Star className="w-6 h-6 text-yellow-500 animate-spin" style={{ animationDirection: 'reverse' }} />
              </div>
              <p className="text-slate-600 mb-6">
                Créez votre compte gratuit et testez par vous-même.
                <br />
                <span className="font-bold text-green-600">Promis, c'est aussi simple qu'on le dit ! 😍</span>
              </p>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 group-hover:animate-pulse">
                <span className="flex items-center gap-2">
                  Commencer gratuitement
                  <Rocket className="w-5 h-5 group-hover:animate-bounce" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
