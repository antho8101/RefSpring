
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";

interface ComparisonTableProps {
  onGetStarted: () => void;
}

export const ComparisonTable = ({ onGetStarted }: ComparisonTableProps) => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Comparez les approches
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Découvrez les différences entre les modèles du marché
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Traditional Model */}
          <Card className="border-2 border-slate-200 relative shadow-lg hover:shadow-xl transition-all">
            <div className="absolute -top-3 left-4 bg-slate-500 text-white px-4 py-1 rounded-full text-sm font-medium">
              Modèle traditionnel
            </div>
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-2xl text-slate-900">Plateformes SaaS</CardTitle>
              <div className="text-4xl font-bold text-slate-600 mt-4">
                199-599€<span className="text-lg text-slate-500">/mois</span>
              </div>
              <p className="text-slate-500">+ commission variable</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <X className="w-5 h-5 text-slate-500" />
                  <span>Frais mensuels fixes</span>
                </li>
                <li className="flex items-center gap-3">
                  <X className="w-5 h-5 text-slate-500" />
                  <span>Commission additionnelle</span>
                </li>
                <li className="flex items-center gap-3">
                  <X className="w-5 h-5 text-slate-500" />
                  <span>Engagement contractuel</span>
                </li>
                <li className="flex items-center gap-3">
                  <X className="w-5 h-5 text-slate-500" />
                  <span>Coûts même sans revenus</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* RefSpring */}
          <Card className="border-4 border-green-500 relative transform scale-105 shadow-2xl bg-white">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full text-sm font-medium">
              RefSpring
            </div>
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-2xl text-slate-900">Modèle au succès</CardTitle>
              <div className="text-4xl font-bold text-green-600 mt-4">
                0€<span className="text-lg text-slate-500">/mois</span>
              </div>
              <p className="text-slate-500">2,5% sur vos gains uniquement</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">Aucun frais fixe</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">Commission minimale</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">Aucun engagement</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">Payez seulement si vous gagnez</span>
                </li>
              </ul>
              <Button className="w-full mt-6 bg-green-600 hover:bg-green-700 hover:scale-105 transition-all" onClick={onGetStarted}>
                Commencer maintenant
              </Button>
            </CardContent>
          </Card>

          {/* Freemium */}
          <Card className="border-2 border-blue-200 relative shadow-lg hover:shadow-xl transition-all">
            <div className="absolute -top-3 left-4 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
              Modèle freemium
            </div>
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-2xl text-slate-900">Solutions gratuites</CardTitle>
              <div className="text-4xl font-bold text-blue-600 mt-4">
                0€<span className="text-lg text-slate-500">/mois</span>
              </div>
              <p className="text-slate-500">Limites importantes</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <X className="w-5 h-5 text-blue-500" />
                  <span>Fonctionnalités limitées</span>
                </li>
                <li className="flex items-center gap-3">
                  <X className="w-5 h-5 text-blue-500" />
                  <span>Support restreint</span>
                </li>
                <li className="flex items-center gap-3">
                  <X className="w-5 h-5 text-blue-500" />
                  <span>Branding de la plateforme</span>
                </li>
                <li className="flex items-center gap-3">
                  <X className="w-5 h-5 text-blue-500" />
                  <span>Limites de volume</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
