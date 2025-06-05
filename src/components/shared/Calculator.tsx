
import { Card, CardContent } from "@/components/ui/card";
import { Calculator as CalculatorIcon, TrendingUp } from "lucide-react";
import { useState } from "react";

interface CalculatorProps {
  variant?: 'landing' | 'pricing';
}

export const Calculator = ({ variant = 'landing' }: CalculatorProps) => {
  const isLanding = variant === 'landing';
  const [monthlyRevenue, setMonthlyRevenue] = useState(isLanding ? 5000 : 10000);
  
  const competitorsCost = (isLanding ? 199 : 299) + (monthlyRevenue * (isLanding ? 0.08 : 0.10));
  const refspringCost = monthlyRevenue >= 20 ? monthlyRevenue * 0.025 : 0;
  const savings = competitorsCost - refspringCost;

  return (
    <section className={`py-24 px-4 sm:px-6 lg:px-8 ${isLanding ? 'bg-gradient-to-b from-slate-50 to-white' : 'bg-slate-50'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <CalculatorIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            {isLanding ? 'Calculez vos économies' : 'Calculez vos coûts'}
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {isLanding 
              ? 'Voyez immédiatement combien vous économisez avec notre modèle'
              : 'Comparez les différents modèles selon vos revenus'
            }
          </p>
        </div>

        <Card className={`bg-white ${isLanding ? 'shadow-2xl border-2 border-slate-100' : 'shadow-xl'}`}>
          <CardContent className="p-8">
            <div className="mb-8">
              <label className="block text-lg font-semibold text-slate-900 mb-4">
                {isLanding 
                  ? 'Vos revenus mensuels d\'affiliation estimés'
                  : 'Revenus mensuels de vos affiliés'
                }
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max={isLanding ? "25000" : "50000"}
                  step={isLanding ? "500" : "1000"}
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                  className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer"
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
              <div className={`text-center p-6 ${isLanding ? 'bg-red-50 border border-red-100' : 'bg-slate-50'} rounded-xl`}>
                <h3 className="font-semibold text-slate-900 mb-2">
                  {isLanding ? 'Autres plateformes' : 'Plateformes SaaS'}
                </h3>
                <div className={`text-2xl font-bold ${isLanding ? 'text-red-600' : 'text-slate-600'} mb-1`}>
                  {competitorsCost.toLocaleString('fr-FR')}€
                </div>
                <p className="text-sm text-slate-500">
                  {isLanding ? '199€/mois + 8% commission' : '299€/mois + 10% commission'}
                </p>
              </div>

              <div className="text-center p-6 bg-green-50 rounded-xl border-2 border-green-200">
                <h3 className="font-semibold text-slate-900 mb-2">RefSpring</h3>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {refspringCost.toLocaleString('fr-FR')}€
                </div>
                <p className="text-sm text-slate-500">
                  {isLanding ? '0€/mois + 2,5% uniquement' : '0€/mois + 2,5% commission'}
                </p>
              </div>

              <div className={`text-center p-6 ${isLanding ? 'bg-blue-50 border border-blue-200' : 'bg-blue-50'} rounded-xl`}>
                {isLanding && <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />}
                <h3 className="font-semibold text-slate-900 mb-2">
                  {isLanding ? 'Vous économisez' : 'Économies'}
                </h3>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {savings.toLocaleString('fr-FR')}€
                </div>
                <p className="text-sm text-slate-500">Par mois</p>
              </div>
            </div>

            <div className={`text-center p-6 ${isLanding ? 'bg-gradient-to-r from-green-600 to-blue-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'} rounded-xl text-white`}>
              <h3 className="text-xl font-semibold mb-2">
                {isLanding ? 'Sur 12 mois, vous économisez' : 'Économies annuelles'}
              </h3>
              <div className="text-4xl font-bold mb-2">
                {(savings * 12).toLocaleString('fr-FR')}€
              </div>
              <p className={isLanding ? 'text-green-100' : 'text-blue-100'}>
                {isLanding ? 'C\'est ça la différence RefSpring' : 'Différence avec RefSpring'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
