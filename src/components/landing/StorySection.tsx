
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
      title: "Les autres plateformes 🤦‍♂️",
      description: "299€/mois même si vous vendez 0€. Sympa comme modèle... pour eux ! Vous payez avant même de savoir si ça marche.",
      icon: <Zap className="w-8 h-8 text-red-500" />,
      color: "red",
      emoji: "😤",
      funFact: "Certains perdent plus qu'ils ne gagnent !"
    },
    {
      step: "02", 
      title: "RefSpring arrive 🎉",
      description: "On a dit STOP à ce délire ! Vous payez SEULEMENT si vous vendez. 2,5% sur vos ventes réelles, point barre.",
      icon: <Heart className="w-8 h-8 text-green-500" />,
      color: "green",
      emoji: "🥳",
      funFact: "Enfin une plateforme qui prend des risques avec vous !"
    },
    {
      step: "03",
      title: "Vous explosez vos objectifs 🚀",
      description: "Vos affiliés bossent mieux car ils ont accès aux meilleurs outils. Vous gagnez plus, on gagne ensemble !",
      icon: <Rocket className="w-8 h-8 text-blue-500" />,
      color: "blue",
      emoji: "💰",
      funFact: "Nos utilisateurs augmentent leurs revenus de 340% en moyenne"
    }
  ];

  return (
    <section ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-100 rounded-full opacity-50 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-16 h-16 bg-purple-100 rounded-full opacity-40 animate-bounce"></div>
      
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            L'histoire de RefSpring 📖
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            On en avait <strong>marre de voir des entrepreneurs se faire arnaquer</strong> par des plateformes qui prennent l'argent avant les résultats.
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
              
              {/* Hidden fun fact that appears on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-100">
                  <div className="text-sm text-blue-700 font-medium">💡 Le saviez-vous ?</div>
                  <div className="text-xs text-blue-600 mt-1">{item.funFact}</div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Interactive Call-to-Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-8 rounded-2xl border border-blue-100 hover:shadow-xl transition-all group cursor-default">
            <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:scale-105 transition-transform">
              Prêt à rejoindre la révolution ? 🎯
            </h3>
            <p className="text-slate-600 mb-6">
              <span className="font-semibold">Plus de 2 400 entrepreneurs malins</span> ont déjà fait le choix intelligent.
              <br />
              <span className="text-green-600 font-bold">Pourquoi pas vous ? 😉</span>
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="flex -space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-slate-600 text-xs font-bold">
                  +2K
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
