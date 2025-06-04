
import { Card, CardContent } from "@/components/ui/card";
import { Calculator } from "lucide-react";
import { useState } from "react";

export const InteractiveCalculator = () => {
  const [monthlyRevenue, setMonthlyRevenue] = useState(10000);
  
  const competitorsCost = 299 + (monthlyRevenue * 0.10); // 299€/mois + 10% commission
  const refspringCost = monthlyRevenue >= 20 ? monthlyRevenue * 0.025 : 0; // 2.5% seulement si > 20€
  const savings = competitorsCost - refspringCost;

  return (
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
  );
};
