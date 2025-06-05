
import { Card, CardContent } from "@/components/ui/card";

interface FAQProps {
  variant?: 'landing' | 'pricing';
}

export const FAQ = ({ variant = 'landing' }: FAQProps) => {
  const isLanding = variant === 'landing';
  
  const landingFAQs = [
    {
      q: "Pourquoi ne demandez-vous pas de carte bancaire à l'inscription ?",
      a: "Nous croyons en la confiance mutuelle. Testez RefSpring entièrement, créez des campagnes et voyez les résultats avant de nous donner votre CB. Elle n'est demandée qu'à la création de votre première campagne."
    },
    {
      q: "Que se passe-t-il si je gagne moins de 20€ dans un mois ?",
      a: "Aucune facturation ! Le seuil de 20€ évite les micro-facturations. Vous ne payez rien ce mois-là, c'est aussi simple que ça."
    },
    {
      q: "Y a-t-il des frais cachés ou des limites ?",
      a: "Zéro. Les 2,5% incluent tout : hébergement, support, mises à jour, analytics, API. Aucun frais de setup, d'export, ou premium. Aucune limite de volume."
    },
    {
      q: "Combien de temps pour configurer ma première campagne ?",
      a: "15 minutes maximum. Créez votre compte, configurez votre campagne, générez vos liens de tracking, et c'est parti. Pas de validation manuelle ni d'attente."
    }
  ];

  const pricingFAQs = [
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
  ];

  const faqs = isLanding ? landingFAQs : pricingFAQs;

  return (
    <section className={`py-24 px-4 sm:px-6 lg:px-8 ${isLanding ? 'bg-slate-50' : 'bg-slate-50'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Questions fréquentes
          </h2>
          {isLanding && (
            <p className="text-xl text-slate-600">
              Les réponses aux questions que se posent nos utilisateurs
            </p>
          )}
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-all border border-slate-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-3 text-lg">{faq.q}</h3>
                <p className="text-slate-600 leading-relaxed">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
