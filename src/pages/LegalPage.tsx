
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Scale, Building, Globe, Mail } from 'lucide-react';

const LegalPage = () => {
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
                <Scale className="h-12 w-12 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Mentions légales</h1>
              <p className="text-slate-600">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
            </div>

            {/* Éditeur du site */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                <Building className="h-6 w-6" />
                Éditeur du site
              </h2>
              <div className="bg-slate-50 p-6 rounded-lg space-y-3">
                <div>
                  <h3 className="font-medium text-slate-900">RefSpring SAS</h3>
                  <p className="text-slate-700">Société par Actions Simplifiée</p>
                </div>
                <div className="space-y-1 text-slate-700">
                  <p><strong>Siège social :</strong> 123 Avenue des Champs-Élysées, 75008 Paris, France</p>
                  <p><strong>SIRET :</strong> 123 456 789 00012</p>
                  <p><strong>RCS :</strong> Paris B 123 456 789</p>
                  <p><strong>TVA intracommunautaire :</strong> FR12 123456789</p>
                  <p><strong>Capital social :</strong> 10 000 €</p>
                </div>
                <div className="space-y-1 text-slate-700">
                  <p><strong>Directeur de la publication :</strong> Jean Dupont</p>
                  <p><strong>Email :</strong> contact@refspring.com</p>
                  <p><strong>Téléphone :</strong> +33 1 23 45 67 89</p>
                </div>
              </div>
            </section>

            {/* Hébergement */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                <Globe className="h-6 w-6" />
                Hébergement
              </h2>
              <div className="bg-slate-50 p-6 rounded-lg space-y-2">
                <h3 className="font-medium text-slate-900">Vercel Inc.</h3>
                <div className="text-slate-700 space-y-1">
                  <p>340 S Lemon Ave #4133</p>
                  <p>Walnut, CA 91789, États-Unis</p>
                  <p>Site web : <a href="https://vercel.com" className="text-blue-600 hover:underline">vercel.com</a></p>
                </div>
              </div>
            </section>

            {/* Propriété intellectuelle */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Propriété intellectuelle</h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur 
                  et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour 
                  les documents téléchargeables et les représentations iconographiques et photographiques.
                </p>
                <p>
                  La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est 
                  formellement interdite sauf autorisation expresse du directeur de la publication.
                </p>
              </div>
            </section>

            {/* Responsabilité */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Limitation de responsabilité</h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  Les informations contenues sur ce site sont aussi précises que possible et le site remis à jour 
                  à différentes périodes de l'année, mais peut toutefois contenir des inexactitudes ou des omissions.
                </p>
                <p>
                  Si vous constatez une lacune, erreur ou ce qui parait être un dysfonctionnement, merci de bien 
                  vouloir le signaler par email à l'adresse contact@refspring.com en décrivant le problème de la 
                  façon la plus précise possible.
                </p>
                <p>
                  RefSpring ne pourra être tenue responsable des dommages directs et indirects causés au matériel 
                  de l'utilisateur, lors de l'accès au site refspring.com, et résultant soit de l'utilisation d'un 
                  matériel ne répondant pas aux spécifications indiquées, soit de l'apparition d'un bug ou d'une incompatibilité.
                </p>
              </div>
            </section>

            {/* Cookies */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Politique des cookies</h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  Ce site utilise des cookies pour améliorer votre expérience de navigation. En continuant à 
                  utiliser ce site, vous acceptez notre utilisation des cookies conformément à notre politique 
                  de confidentialité.
                </p>
                <p>
                  Vous pouvez modifier vos préférences de cookies à tout moment via notre centre de préférences 
                  ou les paramètres de votre navigateur.
                </p>
              </div>
            </section>

            {/* Droit applicable */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Droit applicable et juridiction</h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  Tout litige en relation avec l'utilisation du site refspring.com est soumis au droit français. 
                  Il est fait attribution exclusive de juridiction aux tribunaux compétents de Paris.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                <Mail className="h-6 w-6" />
                Contact
              </h2>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-700">
                  Pour toute question concernant ces mentions légales, vous pouvez nous contacter :
                </p>
                <div className="mt-2 space-y-1 text-slate-700">
                  <p><strong>Email :</strong> legal@refspring.com</p>
                  <p><strong>Téléphone :</strong> +33 1 23 45 67 89</p>
                  <p><strong>Adresse :</strong> 123 Avenue des Champs-Élysées, 75008 Paris, France</p>
                </div>
              </div>
            </section>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default LegalPage;
