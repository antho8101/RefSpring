
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Shield, Eye, Database, Mail, Phone } from 'lucide-react';

const PrivacyPage = () => {
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
                <Shield className="h-12 w-12 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Politique de confidentialité</h1>
              <p className="text-slate-600">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
            </div>

            {/* Introduction */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                <Eye className="h-6 w-6" />
                Introduction
              </h2>
              <p className="text-slate-700 leading-relaxed">
                Chez RefSpring, nous accordons une grande importance à la protection de vos données personnelles. 
                Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons 
                vos informations personnelles conformément au Règlement Général sur la Protection des Données (RGPD).
              </p>
            </section>

            {/* Données collectées */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                <Database className="h-6 w-6" />
                Données que nous collectons
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-slate-900">Données d'identification</h3>
                  <ul className="list-disc list-inside text-slate-700 ml-4 space-y-1">
                    <li>Nom et prénom</li>
                    <li>Adresse email</li>
                    <li>Informations de connexion</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-slate-900">Données d'utilisation</h3>
                  <ul className="list-disc list-inside text-slate-700 ml-4 space-y-1">
                    <li>Données de navigation (pages visitées, durée des sessions)</li>
                    <li>Adresse IP et informations techniques</li>
                    <li>Données de performance des campagnes</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-900">Cookies et technologies similaires</h3>
                  <ul className="list-disc list-inside text-slate-700 ml-4 space-y-1">
                    <li>Cookies nécessaires au fonctionnement</li>
                    <li>Cookies d'analyse (avec votre consentement)</li>
                    <li>Cookies marketing (avec votre consentement)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Utilisation des données */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Utilisation de vos données</h2>
              <p className="text-slate-700">Nous utilisons vos données personnelles pour :</p>
              <ul className="list-disc list-inside text-slate-700 ml-4 space-y-1">
                <li>Fournir et améliorer nos services</li>
                <li>Gérer votre compte et vos campagnes d'affiliation</li>
                <li>Communiquer avec vous sur nos services</li>
                <li>Analyser l'utilisation de notre plateforme</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </section>

            {/* Base légale */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Base légale du traitement</h2>
              <div className="space-y-3">
                <p className="text-slate-700">Nous traitons vos données sur les bases légales suivantes :</p>
                <ul className="list-disc list-inside text-slate-700 ml-4 space-y-1">
                  <li><strong>Contrat :</strong> Pour l'exécution de nos services</li>
                  <li><strong>Consentement :</strong> Pour les cookies non essentiels</li>
                  <li><strong>Intérêt légitime :</strong> Pour l'amélioration de nos services</li>
                  <li><strong>Obligation légale :</strong> Pour respecter la réglementation</li>
                </ul>
              </div>
            </section>

            {/* Partage des données */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Partage de vos données</h2>
              <p className="text-slate-700">
                Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos données uniquement avec :
              </p>
              <ul className="list-disc list-inside text-slate-700 ml-4 space-y-1">
                <li>Nos prestataires de services (hébergement, paiement)</li>
                <li>Les autorités légales si requis par la loi</li>
                <li>Vos affiliés (données de performance uniquement)</li>
              </ul>
            </section>

            {/* Vos droits */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Vos droits RGPD</h2>
              <p className="text-slate-700">Vous disposez des droits suivants :</p>
              <ul className="list-disc list-inside text-slate-700 ml-4 space-y-1">
                <li><strong>Droit d'accès :</strong> Connaître les données que nous possédons</li>
                <li><strong>Droit de rectification :</strong> Corriger vos données inexactes</li>
                <li><strong>Droit à l'effacement :</strong> Supprimer vos données</li>
                <li><strong>Droit à la portabilité :</strong> Récupérer vos données</li>
                <li><strong>Droit d'opposition :</strong> Vous opposer au traitement</li>
                <li><strong>Droit de limitation :</strong> Limiter le traitement</li>
              </ul>
            </section>

            {/* Sécurité */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Sécurité des données</h2>
              <p className="text-slate-700">
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger 
                vos données contre la perte, l'utilisation abusive, l'accès non autorisé, la divulgation, 
                l'altération ou la destruction.
              </p>
            </section>

            {/* Contact */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                <Mail className="h-6 w-6" />
                Nous contacter
              </h2>
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <p className="text-slate-700">
                  Pour exercer vos droits ou pour toute question concernant cette politique :
                </p>
                <div className="space-y-1">
                  <p className="text-slate-700 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email : privacy@refspring.com
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

export default PrivacyPage;
