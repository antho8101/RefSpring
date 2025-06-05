
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Shield, Lock, Key, AlertTriangle, CheckCircle, Mail, Phone } from 'lucide-react';

const SecurityPage = () => {
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
                <Shield className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Politique de Sécurité</h1>
              <p className="text-slate-600">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
            </div>

            {/* Introduction */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                <Lock className="h-6 w-6" />
                Notre engagement sécurité
              </h2>
              <p className="text-slate-700 leading-relaxed">
                La sécurité de vos données est notre priorité absolue. Nous mettons en œuvre des mesures 
                de sécurité robustes pour protéger vos informations personnelles et professionnelles.
              </p>
            </section>

            {/* Chiffrement */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                <Key className="h-6 w-6" />
                Chiffrement et protection des données
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-medium text-slate-900">Chiffrement en transit</h3>
                    <p className="text-slate-700">Toutes les communications utilisent le protocole HTTPS/TLS 1.3</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-medium text-slate-900">Chiffrement au repos</h3>
                    <p className="text-slate-700">Données chiffrées avec AES-256 dans nos bases de données</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-medium text-slate-900">Gestion des clés</h3>
                    <p className="text-slate-700">Rotation automatique des clés de chiffrement</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Infrastructure */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Infrastructure sécurisée</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-medium text-slate-900">Hébergement</h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-1">
                    <li>Serveurs hébergés chez des fournisseurs certifiés ISO 27001</li>
                    <li>Centres de données redondants</li>
                    <li>Surveillance 24/7</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-medium text-slate-900">Accès</h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-1">
                    <li>Authentification multi-facteurs obligatoire</li>
                    <li>Contrôle d'accès basé sur les rôles</li>
                    <li>Logs d'audit complets</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Authentification */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Authentification et accès</h2>
              <div className="space-y-3">
                <h3 className="font-medium text-slate-900">Protection des comptes utilisateur :</h3>
                <ul className="list-disc list-inside text-slate-700 ml-4 space-y-1">
                  <li>Mots de passe hashés avec bcrypt</li>
                  <li>Politique de mot de passe fort</li>
                  <li>Détection des tentatives de connexion suspectes</li>
                  <li>Verrouillage automatique après échecs répétés</li>
                  <li>Sessions sécurisées avec expiration automatique</li>
                </ul>
              </div>
            </section>

            {/* Surveillance */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Surveillance et détection</h2>
              <div className="space-y-3">
                <p className="text-slate-700">Nos systèmes de surveillance incluent :</p>
                <ul className="list-disc list-inside text-slate-700 ml-4 space-y-1">
                  <li>Monitoring en temps réel des intrusions</li>
                  <li>Analyse comportementale des utilisateurs</li>
                  <li>Alertes automatiques en cas d'activité suspecte</li>
                  <li>Sauvegarde automatique et tests de récupération</li>
                </ul>
              </div>
            </section>

            {/* Conformité */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Conformité et certifications</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">RGPD</h3>
                  <p className="text-green-800 text-sm">Conformité totale au Règlement Général sur la Protection des Données</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">ISO 27001</h3>
                  <p className="text-blue-800 text-sm">Processus de certification en cours pour la gestion de la sécurité</p>
                </div>
              </div>
            </section>

            {/* Signalement */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6" />
                Signalement de vulnérabilités
              </h2>
              <div className="bg-amber-50 p-4 rounded-lg space-y-3">
                <p className="text-amber-800">
                  Si vous découvrez une vulnérabilité de sécurité, veuillez nous en informer de manière responsable :
                </p>
                <div className="space-y-1">
                  <p className="text-amber-800 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email : security@refspring.com
                  </p>
                  <p className="text-amber-700 text-sm">
                    Nous nous engageons à répondre dans les 24 heures et à traiter le problème rapidement.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                <Mail className="h-6 w-6" />
                Questions de sécurité
              </h2>
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <p className="text-slate-700">
                  Pour toute question concernant notre politique de sécurité :
                </p>
                <div className="space-y-1">
                  <p className="text-slate-700 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email : security@refspring.com
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

export default SecurityPage;
