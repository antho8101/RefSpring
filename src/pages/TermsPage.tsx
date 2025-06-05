
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, FileText, Scale, AlertTriangle, Mail, Phone } from 'lucide-react';

const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-slate-900">RefSpring</h1>
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8">
          <div className="space-y-8">
            {/* Titre */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <FileText className="h-12 w-12 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Conditions Générales d'Utilisation</h1>
              <p className="text-slate-600">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
            </div>

            {/* Introduction */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                <Scale className="h-6 w-6" />
                Acceptation des conditions
              </h2>
              <p className="text-slate-700 leading-relaxed">
                En utilisant RefSpring, vous acceptez d'être lié par ces conditions générales d'utilisation. 
                Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
              </p>
            </section>

            {/* Description du service */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Description du service</h2>
              <p className="text-slate-700 leading-relaxed">
                RefSpring est une plateforme d'affiliation qui permet aux entreprises de gérer leurs programmes 
                d'affiliation et aux affiliés de promouvoir des produits et services.
              </p>
            </section>

            {/* Comptes utilisateur */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Comptes utilisateur</h2>
              <div className="space-y-3">
                <p className="text-slate-700">Pour utiliser RefSpring, vous devez :</p>
                <ul className="list-disc list-inside text-slate-700 ml-4 space-y-1">
                  <li>Créer un compte avec des informations exactes et complètes</li>
                  <li>Maintenir la sécurité de votre mot de passe</li>
                  <li>Être responsable de toute activité sur votre compte</li>
                  <li>Nous notifier immédiatement de tout usage non autorisé</li>
                </ul>
              </div>
            </section>

            {/* Utilisation acceptable */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6" />
                Utilisation acceptable
              </h2>
              <div className="space-y-3">
                <p className="text-slate-700">Il est interdit d'utiliser RefSpring pour :</p>
                <ul className="list-disc list-inside text-slate-700 ml-4 space-y-1">
                  <li>Toute activité illégale ou frauduleuse</li>
                  <li>Spam ou communications non sollicitées</li>
                  <li>Violation des droits de propriété intellectuelle</li>
                  <li>Transmission de malware ou codes malveillants</li>
                  <li>Manipulation artificielle des métriques ou statistiques</li>
                </ul>
              </div>
            </section>

            {/* Commissions et paiements */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Commissions et paiements</h2>
              <div className="space-y-3">
                <p className="text-slate-700">
                  RefSpring prélève une commission de 2,5% sur les gains générés par les affiliés.
                </p>
                <ul className="list-disc list-inside text-slate-700 ml-4 space-y-1">
                  <li>Les paiements sont effectués mensuellement</li>
                  <li>Seuil minimum de paiement : 50€</li>
                  <li>Les gains frauduleux peuvent être annulés</li>
                  <li>Les remboursements peuvent affecter les commissions</li>
                </ul>
              </div>
            </section>

            {/* Propriété intellectuelle */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Propriété intellectuelle</h2>
              <p className="text-slate-700 leading-relaxed">
                RefSpring et ses contenus sont protégés par les droits de propriété intellectuelle. 
                Vous ne pouvez pas reproduire, modifier ou distribuer notre contenu sans autorisation.
              </p>
            </section>

            {/* Limitation de responsabilité */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Limitation de responsabilité</h2>
              <p className="text-slate-700 leading-relaxed">
                RefSpring ne peut être tenu responsable des dommages indirects, incidents ou 
                consécutifs résultant de l'utilisation de nos services, dans la limite autorisée par la loi.
              </p>
            </section>

            {/* Modification des conditions */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Modification des conditions</h2>
              <p className="text-slate-700 leading-relaxed">
                Nous nous réservons le droit de modifier ces conditions à tout moment. 
                Les modifications seront effectives dès leur publication sur cette page.
              </p>
            </section>

            {/* Contact */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                <Mail className="h-6 w-6" />
                Contact
              </h2>
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <p className="text-slate-700">
                  Pour toute question concernant ces conditions :
                </p>
                <div className="space-y-1">
                  <p className="text-slate-700 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email : legal@refspring.com
                  </p>
                  <p className="text-slate-700 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Téléphone : +33 1 23 45 67 89
                  </p>
                </div>
              </div>
            </section>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default TermsPage;
