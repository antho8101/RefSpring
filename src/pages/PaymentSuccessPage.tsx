import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useStripePayment } from '@/hooks/useStripePayment';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Loader2, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { finalizeCampaign } = useCampaigns();
  const { verifyPaymentSetup } = useStripePayment();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const setupIntentId = searchParams.get('setup_intent');
  const campaignId = searchParams.get('campaign_id');
  const isSimulation = searchParams.get('simulation') === 'true';

  useEffect(() => {
    const processPaymentSuccess = async () => {
      if (!setupIntentId || !campaignId) {
        setStatus('error');
        setMessage('Paramètres de paiement manquants');
        return;
      }

      try {
        if (isSimulation) {
          console.log('🧪 SIMULATION: Traitement du succès de paiement simulé');
          setMessage('Configuration du paiement simulée...');
        } else {
          console.log('🔄 Vérification du statut de paiement...');
          setMessage('Vérification du paiement...');
        }
        
        // Vérifier le statut du SetupIntent (réel ou simulé)
        const setupStatus = await verifyPaymentSetup(setupIntentId);
        
        if (setupStatus.status === 'succeeded') {
          console.log('✅ Paiement configuré avec succès');
          
          // Finaliser la campagne
          await finalizeCampaign(campaignId, {
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
          
        } else {
          throw new Error('Le paiement n\'a pas été configuré correctement');
        }
        
      } catch (error: any) {
        console.error('❌ Erreur lors de la finalisation:', error);
        setStatus('error');
        setMessage(error.message || 'Une erreur est survenue');
        
        toast({
          title: "Erreur",
          description: "Impossible de finaliser la création de votre campagne",
          variant: "destructive",
        });
      }
    };

    processPaymentSuccess();
  }, [setupIntentId, campaignId, isSimulation]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            {status === 'loading' && (
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            )}
            {status === 'success' && (
              <div className="relative">
                <CheckCircle className="w-16 h-16 text-green-600" />
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
            {status === 'success' && (isSimulation ? 'Campagne créée (simulation) !' : 'Campagne créée !')}
            {status === 'error' && 'Erreur'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">{message}</p>
          
          {isSimulation && status === 'success' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center justify-center space-x-2 text-orange-700">
                <TestTube className="w-4 h-4" />
                <span className="text-sm font-medium">Mode simulation</span>
              </div>
              <p className="text-xs text-orange-600 mt-1">
                Les Firebase Functions seront nécessaires pour le vrai processus Stripe
              </p>
            </div>
          )}
          
          {status !== 'loading' && (
            <Button 
              onClick={handleBackToDashboard}
              className="w-full"
            >
              Retour au dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
