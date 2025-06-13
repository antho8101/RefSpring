
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { finalizeCampaignInFirestore } from '@/services/campaignService';
import { useStripePayment } from '@/hooks/useStripePayment';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Loader2, TestTube, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfettiCelebration } from '@/components/ConfettiCelebration';

export const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyPaymentSetup } = useStripePayment();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [showConfetti, setShowConfetti] = useState(false);

  const setupIntentId = searchParams.get('setup_intent');
  const campaignId = searchParams.get('campaign_id');
  const isSimulation = searchParams.get('simulation') === 'true';

  // Détecter si c'est juste un ajout de carte (pas une vraie campagne)
  const isCardAddition = campaignId === 'temp_payment_method';

  useEffect(() => {
    const processPaymentSuccess = async () => {
      if (!setupIntentId) {
        setStatus('error');
        setMessage('Paramètres de paiement manquants');
        return;
      }

      try {
        if (isSimulation) {
          console.log('🧪 SIMULATION: Traitement du succès de paiement simulé');
          setMessage(isCardAddition ? 'Configuration de la carte simulée...' : 'Configuration du paiement simulée...');
        } else {
          console.log('🔄 Vérification du statut de paiement...');
          setMessage(isCardAddition ? 'Vérification de la carte...' : 'Vérification du paiement...');
        }
        
        // Vérifier le statut du SetupIntent (réel ou simulé)
        const setupStatus = await verifyPaymentSetup(setupIntentId);
        
        if (setupStatus.status === 'succeeded') {
          console.log('✅ Paiement configuré avec succès');
          
          // Si c'est juste un ajout de carte, pas besoin de finaliser une campagne
          if (isCardAddition) {
            setStatus('success');
            setMessage(isSimulation 
              ? 'Votre carte a été ajoutée avec succès (mode simulation) !'
              : 'Votre carte a été ajoutée avec succès !'
            );
            
            toast({
              title: "Carte ajoutée !",
              description: isSimulation 
                ? "Mode simulation: Votre carte est maintenant disponible."
                : "Votre carte bancaire a été configurée et est maintenant disponible.",
            });
          } else if (campaignId) {
            // Finaliser une vraie campagne
            await finalizeCampaignInFirestore(campaignId, {
              customerId: isSimulation ? 'cus_simulation' : 'cus_placeholder',
              setupIntentId: setupIntentId,
            });
            
            setStatus('success');
            setMessage(isSimulation 
              ? 'Votre campagne a été créée avec succès (mode simulation) !'
              : 'Votre campagne a été créée avec succès !'
            );
            
            toast({
              title: "Campagne créée !",
              description: isSimulation 
                ? "Mode simulation: Votre campagne est maintenant active."
                : "Votre mode de paiement a été configuré et votre campagne est maintenant active.",
            });
          }
          
          // 🎉 Déclencher les confettis après la validation du paiement !
          setShowConfetti(true);
          
        } else {
          throw new Error('Le paiement n\'a pas été configuré correctement');
        }
        
      } catch (error: any) {
        console.error('❌ Erreur lors de la finalisation:', error);
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
  }, [setupIntentId, campaignId, isSimulation, isCardAddition]);

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
                {isSimulation && (
                  <TestTube className="w-6 h-6 text-orange-500 absolute -top-1 -right-1" />
                )}
              </div>
            )}
            {status === 'error' && (
              <AlertCircle className="w-16 h-16 text-red-600" />
            )}
          </div>
          <CardTitle>
            {status === 'loading' && 'Finalisation en cours...'}
            {status === 'success' && (
              isCardAddition 
                ? (isSimulation ? 'Carte ajoutée (simulation) !' : 'Carte ajoutée !') 
                : (isSimulation ? 'Campagne créée (simulation) !' : 'Campagne créée !')
            )}
            {status === 'error' && 'Erreur'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">{message}</p>
          
          {status === 'success' && (
            <p className="text-sm text-blue-600">
              Redirection automatique dans {countdown} seconde{countdown > 1 ? 's' : ''}...
            </p>
          )}
          
          {isSimulation && status === 'success' && (
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
          
          {status !== 'loading' && (
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
