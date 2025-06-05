
import { Check } from "lucide-react";

export const TransparencySection = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Comment fonctionnent nos 2,5% ?
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Transparence totale : vous ne payez que si vous gagnez plus de 20€
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Vos affiliés génèrent des ventes</h3>
                  <p className="text-slate-600">Ils font des ventes, vous gagnez de l'argent grâce à vos commissions.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Seuil de 20€ atteint ?</h3>
                  <p className="text-slate-600">Si vous gagnez moins de 20€ dans le mois, nous ne facturons rien.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Facturation automatique</h3>
                  <p className="text-slate-600">Le 5 du mois suivant, facture de 2,5% sur vos gains du mois précédent.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Vous gardez 97,5%</h3>
                  <p className="text-slate-600">Le reste est entièrement pour vous. Aucun frais caché, jamais.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-2xl border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">Exemple concret</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600">Commissions générées en janvier</span>
                <span className="font-semibold text-slate-900">1 000€</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                <span className="text-slate-600">Notre fee (2,5%)</span>
                <span className="font-semibold text-red-500">- 25€</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                <span className="text-slate-900 font-semibold">Vous gardez</span>
                <span className="font-bold text-green-600 text-lg">975€</span>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-sm text-slate-500">
                  💳 Facturation le 5 février via Stripe
                  <br />
                  📊 Tableau de bord en temps réel
                  <br />
                  🔒 Sécurisé et transparent
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
