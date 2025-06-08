
import { Card, CardContent } from "@/components/ui/card";
import { Calculator as CalculatorIcon, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";
import { useCurrencyConverter } from "@/hooks/useCurrencyConverter";

interface CalculatorProps {
  variant?: 'landing' | 'pricing';
}

export const Calculator = ({ variant = 'landing' }: CalculatorProps) => {
  const isLanding = variant === 'landing';
  const [monthlyRevenue, setMonthlyRevenue] = useState(isLanding ? 5000 : 10000);
  const { convertAndFormat, userCurrency } = useCurrencyConverter();
  
  const competitorsCost = (isLanding ? 199 : 299) + (monthlyRevenue * (isLanding ? 0.08 : 0.10));
  const refspringCost = monthlyRevenue >= 20 ? monthlyRevenue * 0.025 : 0;
  const savings = competitorsCost - refspringCost;

  return (
    <section className={`py-24 px-4 sm:px-6 lg:px-8 ${isLanding ? 'bg-gradient-to-b from-slate-50 to-white' : 'bg-gradient-to-br from-slate-50 via-white to-blue-50/30'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-6 py-3 rounded-full text-sm font-bold mb-8 border border-blue-200/50">
            <Zap className="w-4 h-4 animate-pulse" />
            Calculateur d'économies
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
            Tu vas halluciner 🤯
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Voir combien tu économises vs les autres plateformes
          </p>
        </div>

        <Card className="bg-white shadow-2xl border-2 border-slate-100 hover:shadow-3xl transition-all duration-500">
          <CardContent className="p-8">
            <div className="mb-8">
              <label className="block text-lg font-bold text-slate-900 mb-4">
                Tes revenus mensuels d'affiliation 💰
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max={isLanding ? "25000" : "50000"}
                  step={isLanding ? "500" : "1000"}
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                  className="w-full h-4 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer hover:shadow-lg transition-all"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #8b5cf6 ${(monthlyRevenue / (isLanding ? 25000 : 50000)) * 100}%, #e2e8f0 ${(monthlyRevenue / (isLanding ? 25000 : 50000)) * 100}%, #e2e8f0 100%)`
                  }}
                />
                <div className="text-center mt-6">
                  <span className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {convertAndFormat(monthlyRevenue)}
                  </span>
                  <span className="text-slate-500 ml-2 font-bold">par mois</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl transform hover:scale-105 transition-all">
                <h3 className="font-bold text-slate-900 mb-2">
                  💸 Les autres
                </h3>
                <div className="text-3xl font-black text-red-600 mb-1">
                  {convertAndFormat(competitorsCost)}
                </div>
                <p className="text-sm text-red-700 font-medium">
                  {isLanding ? `${convertAndFormat(199)}/mois + 8%` : `${convertAndFormat(299)}/mois + 10%`}
                </p>
                <div className="mt-3 text-xs text-red-600 font-bold">
                  Tu paies même si tu vends rien 😭
                </div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-4 border-green-300 transform hover:scale-110 transition-all shadow-lg">
                <h3 className="font-bold text-slate-900 mb-2">🚀 RefSpring</h3>
                <div className="text-3xl font-black text-green-600 mb-1">
                  {convertAndFormat(refspringCost)}
                </div>
                <p className="text-sm text-green-700 font-medium">
                  {convertAndFormat(0)}/mois + 2,5% seulement
                </p>
                <div className="mt-3 text-xs text-green-600 font-bold">
                  Tu paies que si tu gagnes 🎯
                </div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl transform hover:scale-105 transition-all">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-bold text-slate-900 mb-2">
                  Tes économies
                </h3>
                <div className="text-3xl font-black text-blue-600 mb-1">
                  {convertAndFormat(savings)}
                </div>
                <p className="text-sm text-blue-700 font-medium">Par mois</p>
              </div>
            </div>

            <div className="text-center p-8 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 rounded-2xl text-white shadow-2xl transform hover:scale-105 transition-all">
              <h3 className="text-2xl font-black mb-3">
                💎 Économies annuelles
              </h3>
              <div className="text-5xl font-black mb-3">
                {convertAndFormat(savings * 12)}
              </div>
              <p className="text-green-100 font-bold text-lg">
                Ça fait une belle Tesla, non ? 🚗
              </p>
              <div className="mt-4 text-sm text-blue-100">
                Pendant que les autres payent leurs abonnements, toi tu économises 💸
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
