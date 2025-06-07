
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import { Zap, Heart, Rocket } from 'lucide-react';

export const StorySection = () => {
  const { t } = useTranslation();
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardIndex = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleCards(prev => [...prev, cardIndex]);
          }
        });
      },
      { threshold: 0.3 }
    );

    const cards = sectionRef.current?.querySelectorAll('[data-index]');
    cards?.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  const stories = [
    {
      step: "01",
      title: "Le problème classique 🤦‍♂️",
      description: "Les autres plateformes : 299€/mois même si vous vendez 0€. Vous payez avant même de savoir si ça marche. C'est de l'arnaque légale !",
      icon: <Zap className="w-8 h-8 text-red-500" />,
      color: "red",
      emoji: "😤",
      funFact: "Beaucoup perdent plus qu'ils ne gagnent..."
    },
    {
      step: "02", 
      title: "Notre solution 🎉",
      description: "RefSpring : 0€ de frais fixes. Vous payez SEULEMENT 2,5% sur vos ventes réelles. On prend des risques avec vous !",
      icon: <Heart className="w-8 h-8 text-green-500" />,
      color: "green",
      emoji: "🥳",
      funFact: "On mange des pâtes si vous ne vendez rien !"
    },
    {
      step: "03",
      title: "Vous explosez tout 🚀",
      description: "Dashboard propre, tracking précis, affiliés motivés. Vous vous concentrez sur votre business, nous on gère la technique !",
      icon: <Rocket className="w-8 h-8 text-blue-500" />,
      color: "blue",
      emoji: "💰",
      funFact: "Nos utilisateurs font +150% de revenus en moyenne"
    }
  ];

  return (
    <section ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-100 rounded-full opacity-50 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-16 h-16 bg-purple-100 rounded-full opacity-40 animate-bounce"></div>
      
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            L'histoire de RefSpring 📖
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            On en avait <strong>marre de voir des entrepreneurs se faire avoir</strong> par des plateformes qui prennent l'argent avant les résultats.
            <br />
            <span className="text-blue-600 font-semibold">Alors on a créé le contraire ! 😎</span>
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {stories.map((item, index) => (
            <article 
              key={index} 
              data-index={index}
              className={`text-center p-8 rounded-2xl bg-white shadow-lg border border-slate-100 transition-all duration-700 hover:scale-105 hover:shadow-2xl cursor-default group ${
                visibleCards.includes(index) 
                  ? 'animate-fade-in-scale opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-10'
              }`}
              style={{ 
                animationDelay: `${index * 0.2}s`,
                transform: visibleCards.includes(index) ? 'translateY(0)' : 'translateY(40px)'
              }}
            >
              <div className="text-6xl mb-4 group-hover:animate-bounce">{item.emoji}</div>
              <div className="text-sm font-bold text-slate-400 mb-2">{item.step}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-slate-600 leading-relaxed mb-4">{item.description}</p>
              
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-100">
                  <div className="text-sm text-blue-700 font-medium">💡 Fun fact</div>
                  <div className="text-xs text-blue-600 mt-1">{item.funFact}</div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-8 rounded-2xl border border-blue-100 hover:shadow-xl transition-all group cursor-default">
            <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:scale-105 transition-transform">
              Prêt à tester ? C'est gratuit ! 🎯
            </h3>
            <p className="text-slate-600 mb-6">
              <span className="font-semibold">Créez votre programme en 5 minutes</span> et voyez si ça marche pour vous.
              <br />
              <span className="text-green-600 font-bold">Aucun risque, aucun engagement ! 😉</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
