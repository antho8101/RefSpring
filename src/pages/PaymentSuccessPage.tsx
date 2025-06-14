
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStripePayment } from '@/hooks/useStripePayment';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { ConfettiCelebration } from '@/components/ConfettiCelebration';
import { CampaignSuccessModal } from '@/components/CampaignSuccessModal';
import { useToast } from '@/hooks/use-toast';

export const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyPaymentSetup } = useStripePayment();
  const { createCampaign } = useCampaigns();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCampaign, setCreatedCampaign] = useState<{ id: string; name: string } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const setupIntentId = searchParams.get('setup_intent');
    const campaignId = searchParams.get('campaign_id');
    
    if (!setupIntentId) {
      setError('Aucun setup intent trouvé');
      setLoading(false);
      return;
    }

    const handlePaymentSuccess = async () => {
      try {
        console.log('🔥 PAYMENT SUCCESS: Vérification et création campagne après Stripe');
        
        // Vérifier le paiement Stripe
        const verificationResult = await verifyPaymentSetup(setupIntentId);
        console.log('✅ Paiement vérifié:', verificationResult);
        
        if (verificationResult.status === 'succeeded') {
          // Récupérer les données de campagne stockées
          const pendingDataStr = localStorage.getItem('pendingCampaignData');
          
          if (pendingDataStr) {
            const pendingData = JSON.parse(pendingDataStr);
            console.log('📝 Données campagne récupérées:', pendingData);
            
            // MAINTENANT créer la campagne avec la carte validée
            const newCampaignId = await createCampaign({
              name: pendingData.name,
              description: pendingData.description,
              targetUrl: pendingData.targetUrl,
              isActive: pendingData.isActive,
              isDraft: false,
              paymentConfigured: true,
              defaultCommissionRate: 10,
              stripePaymentMethodId: verificationResult.paymentMethodId,
            });
            
            console.log('✅ CAMPAGNE CRÉÉE APRÈS VALIDATION STRIPE:', newCampaignId);
            
            // Nettoyer le localStorage
            localStorage.removeItem('pendingCampaignData');
            
            // Afficher le succès
            setCreatedCampaign({ id: newCampaignId, name: pendingData.name });
            setShowSuccessModal(true);
            setSuccess(true);
            
            toast({
              title: "Campagne créée avec succès !",
              description: "Votre carte a été validée et votre campagne est maintenant active.",
            });
          } else {
            console.log('⚠️ Aucune donnée de campagne en attente trouvée');
            setSuccess(true); // Juste confirmer le paiement
          }
        } else {
          throw new Error(`Échec de la vérification: ${verificationResult.status}`);
        }
      } catch (err: any) {
        console.error('❌ Erreur lors de la vérification:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [searchParams, verifyPaymentSetup, createCampaign, toast]);

  const handleBackToDashboard = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <h2 className="text-xl font-semibold text-slate-900">
                Finalisation en cours...
              </h2>
              <p className="text-slate-600">
                Nous vérifions votre paiement et créons votre campagne.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <h2 className="text-xl font-semibold text-slate-900">
                Erreur de traitement
              </h2>
              <p className="text-slate-600">{error}</p>
              <Button onClick={handleBackToDashboard} variant="outline">
                Retour au tableau de bord
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <ConfettiCelebration trigger={success} />
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-6 w-6" />
              Paiement réussi !
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600">
              {createdCampaign 
                ? `Votre campagne "${createdCampaign.name}" a été créée avec succès après validation de votre carte.`
                : 'Votre méthode de paiement a été configurée avec succès.'
              }
            </p>
            
            <Button 
              onClick={handleBackToDashboard} 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Aller au tableau de bord
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modale de succès avec codes d'intégration */}
      {createdCampaign && showSuccessModal && (
        <CampaignSuccessModal
          open={showSuccessModal}
          onOpenChange={setShowSuccessModal}
          campaignId={createdCampaign.id}
          campaignName={createdCampaign.name}
        />
      )}
    </>
  );
};
