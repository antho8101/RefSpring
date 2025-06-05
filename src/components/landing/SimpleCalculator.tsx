
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, TrendingUp } from "lucide-react";
import { useState } from "react";

export const SimpleCalculator = () => {
  const [monthlyRevenue, setMonthlyRevenue] = useState(5000);
  
  const competitorsCost = 199 + (monthlyRevenue * 0.08); // 199€/mois + 8% commission moyenne
  const refspringCost = monthlyRevenue >= 20 ? monthlyRevenue * 0.025 : 0;
  const savings = competitorsCost - refspringCost;

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <Calculator className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Calculez vos économies
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Voyez immédiatement combien vous économisez avec notre modèle
          </p>
        </div>

        <Card className="bg-white shadow-2xl border-2 border-slate-100">
          <CardContent className="p-8">
            <div className="mb-8">
              <label className="block text-lg font-semibold text-slate-900 mb-4">
                Vos revenus mensuels d'affiliation estimés
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="25000"
                  step="500"
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
              <div className="text-center p-6 bg-red-50 rounded-xl border border-red-100">
                <h3 className="font-semibold text-slate-900 mb-2">Autres plateformes</h3>
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {competitorsCost.toLocaleString('fr-FR')}€
                </div>
                <p className="text-sm text-slate-500">199€/mois + 8% commission</p>
              </div>

              <div className="text-center p-6 bg-green-50 rounded-xl border-2 border-green-200">
                <h3 className="font-semibold text-slate-900 mb-2">RefSpring</h3>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {refspringCost.toLocaleString('fr-FR')}€
                </div>
                <p className="text-sm text-slate-500">0€/mois + 2,5% uniquement</p>
              </div>

              <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-slate-900 mb-2">Vous économisez</h3>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {savings.toLocaleString('fr-FR')}€
                </div>
                <p className="text-sm text-slate-500">Par mois</p>
              </div>
            </div>

            <div className="text-center p-6 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl text-white">
              <h3 className="text-xl font-semibold mb-2">Sur 12 mois, vous économisez</h3>
              <div className="text-4xl font-bold mb-2">
                {(savings * 12).toLocaleString('fr-FR')}€
              </div>
              <p className="text-green-100">
                C'est ça la différence RefSpring
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
