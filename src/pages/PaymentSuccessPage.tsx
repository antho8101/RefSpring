
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useStripePayment } from '@/hooks/useStripePayment';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
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

  useEffect(() => {
    const processPaymentSuccess = async () => {
      if (!setupIntentId || !campaignId) {
        setStatus('error');
        setMessage('Paramètres de paiement manquants');
        return;
      }

      try {
        console.log('🔄 Vérification du statut de paiement...');
        
        // Vérifier le statut du SetupIntent
        const setupStatus = await verifyPaymentSetup(setupIntentId);
        
        if (setupStatus.status === 'succeeded') {
          console.log('✅ Paiement configuré avec succès');
          
          // Finaliser la campagne
          await finalizeCampaign(campaignId, {
            customerId: 'cus_placeholder', // Sera récupéré via l'API
            setupIntentId: setupIntentId,
          });
          
          setStatus('success');
          setMessage('Votre campagne a été créée avec succès !');
          
          toast({
            title: "Campagne créée !",
            description: "Votre mode de paiement a été configuré et votre campagne est maintenant active.",
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
  }, [setupIntentId, campaignId]);

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
              <CheckCircle className="w-16 h-16 text-green-600" />
            )}
            {status === 'error' && (
              <AlertCircle className="w-16 h-16 text-red-600" />
            )}
          </div>
          <CardTitle>
            {status === 'loading' && 'Finalisation en cours...'}
            {status === 'success' && 'Campagne créée !'}
            {status === 'error' && 'Erreur'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">{message}</p>
          
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
