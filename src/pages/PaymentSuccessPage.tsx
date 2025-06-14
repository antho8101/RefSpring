import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { finalizeCampaignInFirestore } from '@/services/campaignService';
import { useStripePayment } from '@/hooks/useStripePayment';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Loader2, TestTube, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfettiCelebration } from '@/components/ConfettiCelebration';

export const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyPaymentSetup } = useStripePayment();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'auth-required'>('loading');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [showConfetti, setShowConfetti] = useState(false);

  const setupIntentId = searchParams.get('setup_intent');
  const campaignId = searchParams.get('campaign_id');
  const isSimulation = searchParams.get('simulation') === 'true';

  // Détecter si c'est juste un ajout de carte (pas une vraie campagne)
  const isCardAddition = campaignId === 'temp_payment_method';

  // Détecter si c'est un ID de simulation basé sur le pattern
  const isSimulationId = setupIntentId?.startsWith('seti_sim_') || setupIntentId?.startsWith('cs_sim_');

  useEffect(() => {
    const processPaymentSuccess = async () => {
      if (!setupIntentId) {
        setStatus('error');
        setMessage('Paramètres de paiement manquants');
        return;
      }

      // Attendre que l'authentification soit vérifiée
      if (authLoading) {
        console.log('🔐 PAYMENT-SUCCESS: Attente de la vérification d\'authentification');
        setMessage('Vérification de l\'authentification...');
        return;
      }

      // Si pas d'utilisateur après le chargement, demander une reconnexion
      if (!user) {
        console.log('🔐 PAYMENT-SUCCESS: Utilisateur non authentifié après retour de Stripe');
        setStatus('auth-required');
        setMessage('Authentification requise pour finaliser le paiement');
        return;
      }

      console.log('🔐 PAYMENT-SUCCESS: Utilisateur authentifié, traitement du paiement');

      try {
        // Si c'est un ID de simulation ou que le paramètre simulation est présent
        if (isSimulation || isSimulationId) {
          console.log('🧪 SIMULATION: Traitement du succès de paiement simulé');
          setMessage(isCardAddition ? 'Configuration de la carte simulée...' : 'Configuration du paiement simulée...');
          
          // Simuler un délai pour la cohérence UX
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Marquer comme succès sans appeler les API réelles
          if (isCardAddition) {
            setStatus('success');
            setMessage('Votre carte a été ajoutée avec succès (mode simulation) !');
            
            toast({
              title: "Carte ajoutée !",
              description: "Mode simulation: Votre carte est maintenant disponible.",
            });
          } else if (campaignId) {
            // Finaliser une campagne simulée
            await finalizeCampaignInFirestore(campaignId, {
              customerId: 'cus_simulation',
              setupIntentId: setupIntentId,
              paymentMethodId: 'pm_simulation'
            });
            
            setStatus('success');
            setMessage('Votre campagne a été créée avec succès (mode simulation) !');
            
            toast({
              title: "Campagne créée !",
              description: "Mode simulation: Votre campagne est maintenant active.",
            });
          }
        } else {
          // Traitement réel pour les vrais setupIntentId
          console.log('🔄 PAYMENT-SUCCESS: Vérification du statut de paiement réel...');
          setMessage(isCardAddition ? 'Vérification de la carte...' : 'Vérification du paiement...');
          
          // Vérifier le statut du SetupIntent réel
          const setupStatus = await verifyPaymentSetup(setupIntentId);
          
          if (setupStatus.status === 'succeeded') {
            console.log('✅ PAYMENT-SUCCESS: Paiement configuré avec succès');
            console.log('💳 PAYMENT-SUCCESS: PaymentMethodId reçu:', setupStatus.paymentMethodId);
            
            if (isCardAddition) {
              setStatus('success');
              setMessage('Votre carte a été ajoutée avec succès !');
              
              toast({
                title: "Carte ajoutée !",
                description: "Votre carte bancaire a été configurée et est maintenant disponible.",
              });
            } else if (campaignId) {
              // Finaliser une vraie campagne avec le paymentMethodId
              await finalizeCampaignInFirestore(campaignId, {
                customerId: setupStatus.customerId || 'cus_from_stripe',
                setupIntentId: setupIntentId,
                paymentMethodId: setupStatus.paymentMethodId
              });
              
              setStatus('success');
              setMessage('Votre campagne a été créée avec succès !');
              
              toast({
                title: "Campagne créée !",
                description: "Votre mode de paiement a été configuré et votre campagne est maintenant active.",
              });
            }
          } else {
            throw new Error('Le paiement n\'a pas été configuré correctement');
          }
        }
        
        // 🎉 Déclencher les confettis après la validation du paiement !
        setShowConfetti(true);
        
      } catch (error: any) {
        console.error('❌ PAYMENT-SUCCESS: Erreur lors de la finalisation:', error);
        setStatus('error');
        setMessage(error.message || 'Une erreur est survenue');
        
        toast({
          title: "Erreur",
          description: isCardAddition 
            ? "Impossible de configurer votre carte bancaire"
            : "Impossible de finaliser la création de votre campagne",
          variant: "destructive",
        });
      }
    };

    processPaymentSuccess();
  }, [setupIntentId, campaignId, isSimulation, isSimulationId, isCardAddition, user, authLoading]);

  // Effet pour le countdown et redirection automatique
  useEffect(() => {
    if (status === 'success') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            navigate('/dashboard');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, navigate]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleReconnect = () => {
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 flex items-center justify-center p-4">
      {/* Confettis déclenchés après validation du paiement */}
      <ConfettiCelebration trigger={showConfetti} />
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            {status === 'loading' && (
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            )}
            {status === 'success' && (
              <div className="relative">
                {isCardAddition ? (
                  <CreditCard className="w-16 h-16 text-green-600" />
                ) : (
                  <CheckCircle className="w-16 h-16 text-green-600" />
                )}
                {(isSimulation || isSimulationId) && (
                  <TestTube className="w-6 h-6 text-orange-500 absolute -top-1 -right-1" />
                )}
              </div>
            )}
            {(status === 'error' || status === 'auth-required') && (
              <AlertCircle className="w-16 h-16 text-red-600" />
            )}
          </div>
          <CardTitle>
            {status === 'loading' && 'Finalisation en cours...'}
            {status === 'success' && (
              isCardAddition 
                ? ((isSimulation || isSimulationId) ? 'Carte ajoutée (simulation) !' : 'Carte ajoutée !') 
                : ((isSimulation || isSimulationId) ? 'Campagne créée (simulation) !' : 'Campagne créée !')
            )}
            {status === 'error' && 'Erreur'}
            {status === 'auth-required' && 'Reconnexion requise'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">{message}</p>
          
          {status === 'success' && (
            <p className="text-sm text-blue-600">
              Redirection automatique dans {countdown} seconde{countdown > 1 ? 's' : ''}...
            </p>
          )}

          {status === 'auth-required' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-700">
                Votre session a expiré pendant le processus de paiement. Veuillez vous reconnecter pour finaliser votre campagne.
              </p>
            </div>
          )}
          
          {(isSimulation || isSimulationId) && status === 'success' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center justify-center space-x-2 text-orange-700">
                <TestTube className="w-4 h-4" />
                <span className="text-sm font-medium">Mode simulation</span>
              </div>
              <p className="text-xs text-orange-600 mt-1">
                {isCardAddition 
                  ? "Les vraies cartes nécessiteront une API backend sécurisée"
                  : "Les Firebase Functions seront nécessaires pour le vrai processus Stripe"
                }
              </p>
            </div>
          )}
          
          {status === 'auth-required' && (
            <Button 
              onClick={handleReconnect}
              className="w-full"
            >
              Se reconnecter
            </Button>
          )}
          
          {status !== 'loading' && status !== 'auth-required' && (
            <Button 
              onClick={handleBackToDashboard}
              className="w-full"
              variant="outline"
            >
              Retour immédiat au dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
