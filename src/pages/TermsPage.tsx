
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
                d'affiliation et aux affiliés de promouvoir des produits et services. RefSpring facilite la 
                communication entre les créateurs de campagne et leurs affiliés, notamment pour la gestion des 
                commissions via notre système d'envoi d'emails automatisé.
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
              <h2 className="text-2xl font-semibold text-slate-900">Modèle économique et gestion des paiements</h2>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-slate-900 mb-2">Notre commission</h3>
                  <p className="text-slate-700">
                    RefSpring prélève une commission de 2,5% sur le chiffre d'affaires généré via les affiliés. 
                    Aucun frais mensuel, aucun abonnement - nous gagnons seulement quand vous gagnez.
                  </p>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h3 className="font-semibold text-slate-900 mb-2">Gestion des paiements aux affiliés</h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-1">
                    <li>RefSpring envoie automatiquement des emails aux affiliés avec les détails des commissions à payer</li>
                    <li>Le paiement effectif des commissions reste la responsabilité du créateur de campagne</li>
                    <li>RefSpring agit comme intermédiaire technique pour faciliter la communication</li>
                    <li>Les paiements sont calculés mensuellement selon les paramètres de chaque campagne</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Limitation de responsabilité - Section renforcée */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                Limitation de responsabilité
              </h2>
              <div className="space-y-4">
                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-red-900 mb-3">Responsabilité des paiements d'affiliation</h3>
                  <ul className="list-disc list-inside text-red-800 space-y-2">
                    <li>
                      <strong>RefSpring ne garantit pas les paiements aux affiliés.</strong> Nous facilitons uniquement 
                      la communication entre créateurs de campagne et affiliés.
                    </li>
                    <li>
                      <strong>En cas d'insolvabilité ou de défaillance</strong> du créateur de campagne, RefSpring 
                      ne peut être tenu responsable des commissions impayées.
                    </li>
                    <li>
                      <strong>RefSpring n'est pas un garant financier</strong> mais un intermédiaire technique 
                      fournissant des outils de gestion d'affiliation.
                    </li>
                    <li>
                      <strong>Les affiliés acceptent ces risques</strong> en participant aux campagnes disponibles 
                      sur notre plateforme.
                    </li>
                  </ul>
                </div>
                
                <p className="text-slate-700 leading-relaxed">
                  RefSpring ne peut être tenu responsable des dommages indirects, incidents ou 
                  consécutifs résultant de l'utilisation de nos services, y compris mais sans s'y limiter : 
                  les pertes de revenus, les commissions impayées, ou les dommages résultant de l'insolvabilité 
                  d'un créateur de campagne, dans la limite autorisée par la loi.
                </p>
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

            {/* Résiliation */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Résiliation</h2>
              <div className="space-y-3">
                <p className="text-slate-700">
                  RefSpring se réserve le droit de suspendre ou de résilier votre accès au service 
                  en cas de violation de ces conditions.
                </p>
                <p className="text-slate-700">
                  En cas de résiliation, les commissions dues aux affiliés restent de la responsabilité 
                  du créateur de campagne, même après la fermeture de son compte RefSpring.
                </p>
              </div>
            </section>

            {/* Modification des conditions */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Modification des conditions</h2>
              <p className="text-slate-700 leading-relaxed">
                Nous nous réservons le droit de modifier ces conditions à tout moment. 
                Les modifications seront effectives dès leur publication sur cette page. 
                Il est de votre responsabilité de consulter régulièrement ces conditions.
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
