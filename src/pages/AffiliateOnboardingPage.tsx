import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AffiliateOnboardingPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'refresh' | 'error'>('loading');
  const [message, setMessage] = useState('');
  
  const accountId = searchParams.get('account');
  const isSuccess = searchParams.get('success') === 'true';
  const isRefresh = searchParams.get('refresh') === 'true';

  useEffect(() => {
    if (isSuccess) {
      setStatus('success');
      setMessage('Votre compte Stripe Connect a été configuré avec succès ! Vous pouvez maintenant recevoir vos commissions automatiquement.');
    } else if (isRefresh) {
      setStatus('refresh');
      setMessage('Votre session d\'onboarding a expiré. Veuillez recommencer le processus depuis le lien fourni par le propriétaire de la campagne.');
    } else if (accountId) {
      setStatus('loading');
      setMessage('Vérification du statut de votre compte...');
      // TODO: Vérifier le statut du compte avec l'API
    } else {
      setStatus('error');
      setMessage('Paramètres d\'onboarding manquants.');
    }
  }, [accountId, isSuccess, isRefresh]);

  const handleReturnToOrigin = () => {
    // Essayer de fermer la fenêtre, sinon rediriger
    try {
      window.close();
    } catch {
      window.location.href = '/';
    }
  };

  const handleContactSupport = () => {
    // Ouvrir l'email de support
    window.location.href = 'mailto:support@refspring.app?subject=Problème configuration Stripe Connect';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          
          {/* En-tête */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Configuration Stripe Connect
            </h1>
            <p className="text-slate-600">
              Configuration des paiements pour les affiliés RefSpring
            </p>
          </div>

          {/* Contenu principal */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-3">
                {status === 'loading' && (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <span>Vérification en cours...</span>
                  </>
                )}
                {status === 'success' && (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <span className="text-green-700">Configuration réussie !</span>
                  </>
                )}
                {status === 'refresh' && (
                  <>
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                    <span className="text-orange-700">Session expirée</span>
                  </>
                )}
                {status === 'error' && (
                  <>
                    <AlertCircle className="h-6 w-6 text-red-600" />
                    <span className="text-red-700">Erreur de configuration</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              
              {/* Message principal */}
              <Alert className={`
                ${status === 'success' ? 'border-green-200 bg-green-50' : ''}
                ${status === 'refresh' ? 'border-orange-200 bg-orange-50' : ''}
                ${status === 'error' ? 'border-red-200 bg-red-50' : ''}
                ${status === 'loading' ? 'border-blue-200 bg-blue-50' : ''}
              `}>
                <AlertDescription className="text-sm">
                  {message}
                </AlertDescription>
              </Alert>

              {/* Informations sur le compte */}
              {accountId && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm text-slate-600 mb-1">Compte Stripe Connect</div>
                  <div className="font-mono text-sm text-slate-900">{accountId}</div>
                </div>
              )}

              {/* Prochaines étapes */}
              {status === 'success' && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-2">Prochaines étapes :</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Vos commissions seront automatiquement transférées sur votre compte</li>
                    <li>• Les paiements arrivent généralement sous 2-7 jours ouvrés</li>
                    <li>• Vous recevrez une notification par email pour chaque paiement</li>
                    <li>• Consultez votre dashboard Stripe pour suivre vos paiements</li>
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-center">
                {status === 'success' && (
                  <Button onClick={handleReturnToOrigin} className="min-w-[200px]">
                    Fermer cette fenêtre
                  </Button>
                )}
                
                {status === 'refresh' && (
                  <>
                    <Button variant="outline" onClick={handleReturnToOrigin}>
                      Fermer cette fenêtre
                    </Button>
                    <Button onClick={handleContactSupport}>
                      Contacter le support
                    </Button>
                  </>
                )}
                
                {status === 'error' && (
                  <Button variant="outline" onClick={handleContactSupport}>
                    Contacter le support
                  </Button>
                )}
                
                {status === 'loading' && (
                  <Button disabled className="min-w-[200px]">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Vérification...
                  </Button>
                )}
              </div>

            </CardContent>
          </Card>

          {/* Informations de contact */}
          <div className="text-center mt-8 text-sm text-slate-500">
            <p>
              Des questions ? Contactez-nous à{' '}
              <a href="mailto:support@refspring.app" className="text-blue-600 hover:underline">
                support@refspring.app
              </a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AffiliateOnboardingPage;