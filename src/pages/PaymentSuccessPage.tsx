
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStripePayment } from '@/hooks/useStripePayment';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { ConfettiCelebration } from '@/components/ConfettiCelebration';
import { CampaignSuccessModal } from '@/components/CampaignSuccessModal';
import { useToast } from '@/hooks/use-toast';

export const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { verifyPaymentSetup } = useStripePayment();
  const { createCampaign } = useCampaigns();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCampaign, setCreatedCampaign] = useState<{ id: string; name: string } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(3);
  
  // Protection absolue contre les doubles exécutions
  const hasProcessedRef = useRef(false);
  const processingRef = useRef(false);

  // Redirection automatique vers le DASHBOARD après succès
  useEffect(() => {
    if (success && !showSuccessModal && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (success && !showSuccessModal && countdown === 0) {
      navigate('/dashboard'); // CORRECTION: Redirection vers le dashboard !
    }
  }, [success, showSuccessModal, countdown, navigate]);

  useEffect(() => {
    const setupIntentId = searchParams.get('setup_intent');
    
    if (!setupIntentId) {
      setError('Aucun setup intent trouvé');
      setLoading(false);
      return;
    }

    const handlePaymentSuccess = async () => {
      console.log('🔥 PAYMENT SUCCESS: Vérification et création campagne après Stripe');
      
      // PROTECTION ABSOLUE : Vérifier si déjà traité ou en cours de traitement
      if (hasProcessedRef.current || processingRef.current) {
        console.log('🔒 PAYMENT SUCCESS: Déjà traité ou en cours, ignoré');
        return;
      }

      // PROTECTION : Attendre que l'authentification soit complète
      if (authLoading) {
        console.log('🔒 PAYMENT SUCCESS: Authentification en cours, attente...');
        return;
      }

      if (!user) {
        console.log('❌ PAYMENT SUCCESS: Utilisateur non authentifié');
        setError('Utilisateur non authentifié');
        setLoading(false);
        return;
      }

      // Marquer comme en cours de traitement
      processingRef.current = true;
      
      try {
        console.log('🔥 PAYMENT SUCCESS: TRAITEMENT UNIQUE - Début vérification');
        
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
            
            // Marquer comme traité avec succès
            hasProcessedRef.current = true;
            
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
            hasProcessedRef.current = true;
            setSuccess(true); // Juste confirmer le paiement
          }
        } else {
          throw new Error(`Échec de la vérification: ${verificationResult.status}`);
        }
      } catch (err: any) {
        console.error('❌ Erreur lors de la vérification:', err);
        setError(err.message);
      } finally {
        processingRef.current = false;
        setLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [searchParams, authLoading, user, verifyPaymentSetup, createCampaign, toast]);

  const handleBackToDashboard = () => {
    navigate('/dashboard'); // CORRECTION: Redirection vers le dashboard !
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
                {authLoading 
                  ? 'Vérification de l\'authentification...'
                  : 'Nous vérifions votre paiement et créons votre campagne.'
                }
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
            
            {!showSuccessModal && (
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-3">
                  Redirection automatique dans {countdown} seconde{countdown > 1 ? 's' : ''}...
                </p>
              </div>
            )}
            
            <Button 
              onClick={handleBackToDashboard} 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Aller au tableau de bord {!showSuccessModal && `(${countdown}s)`}
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
