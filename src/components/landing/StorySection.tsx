
export const StorySection = () => {
  return (
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
  );
};
