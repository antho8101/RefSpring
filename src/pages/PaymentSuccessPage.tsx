
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStripePayment } from '@/hooks/useStripePayment';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { verifyPaymentSetup } = useStripePayment();
  const { createCampaign, updateCampaign } = useCampaigns();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReactivation, setIsReactivation] = useState(false);
  const [campaignName, setCampaignName] = useState<string>('');
  
  // Protection absolue contre les doubles exécutions
  const hasProcessedRef = useRef(false);
  const processingRef = useRef(false);

  useEffect(() => {
    const setupIntentId = searchParams.get('setup_intent');
    
    if (!setupIntentId) {
      setError('Aucun setup intent trouvé');
      setLoading(false);
      return;
    }

    const handlePaymentSuccess = async () => {
      console.log('🔥 PAYMENT SUCCESS: Vérification et traitement après Stripe');
      
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
          // Vérifier s'il s'agit d'une réactivation de campagne
          const reactivationData = localStorage.getItem('campaignReactivationData');
          
          if (reactivationData) {
            // CAS DE RÉACTIVATION
            const { campaignId, campaignName: storedCampaignName } = JSON.parse(reactivationData);
            console.log('🔄 RÉACTIVATION: Détectée pour campagne:', campaignId);
            
            setIsReactivation(true);
            setCampaignName(storedCampaignName);
            
            // Réactiver la campagne avec la nouvelle carte
            await updateCampaign(campaignId, {
              isActive: true,
              stripePaymentMethodId: verificationResult.paymentMethodId,
            });
            
            console.log('✅ CAMPAGNE RÉACTIVÉE:', campaignId);
            
            // Nettoyer les données de réactivation
            localStorage.removeItem('campaignReactivationData');
            
            // Marquer comme traité avec succès
            hasProcessedRef.current = true;
            setLoading(false);
            
          } else {
            // CAS DE CRÉATION DE CAMPAGNE
            const pendingDataStr = localStorage.getItem('pendingCampaignData');
            
            if (pendingDataStr) {
              const pendingData = JSON.parse(pendingDataStr);
              console.log('📝 Données campagne récupérées:', pendingData);
              
              // Créer la campagne avec la carte validée
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
              
              // Nettoyer le localStorage des données de campagne
              localStorage.removeItem('pendingCampaignData');
              
              // Stocker les infos pour afficher la modale dans le dashboard
              localStorage.setItem('newCampaignCreated', JSON.stringify({
                id: newCampaignId,
                name: pendingData.name,
                showModal: true
              }));
              
              // Marquer comme traité avec succès
              hasProcessedRef.current = true;
              
              toast({
                title: "Campagne créée avec succès !",
                description: "Redirection vers le dashboard...",
              });

              // Redirection immédiate vers le dashboard
              navigate('/dashboard');
            } else {
              console.log('⚠️ Aucune donnée de campagne en attente trouvée');
              hasProcessedRef.current = true;
              // Redirection vers dashboard même sans campagne
              navigate('/dashboard');
            }
          }
        } else {
          throw new Error(`Échec de la vérification: ${verificationResult.status}`);
        }
      } catch (err: any) {
        console.error('❌ Erreur lors de la vérification:', err);
        setError(err.message);
        setLoading(false);
      } finally {
        processingRef.current = false;
      }
    };

    handlePaymentSuccess();
  }, [searchParams, authLoading, user, verifyPaymentSetup, createCampaign, updateCampaign, toast, navigate]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleContinueToDashboard = () => {
    toast({
      title: "✅ Campagne réactivée !",
      description: `La campagne "${campaignName}" est maintenant active et prête à générer des revenus.`,
    });
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <h2 className="text-xl font-semibold text-slate-900">
                {isReactivation ? 'Réactivation en cours...' : 'Finalisation en cours...'}
              </h2>
              <p className="text-slate-600">
                {authLoading 
                  ? 'Vérification de l\'authentification...'
                  : isReactivation 
                    ? 'Nous réactivons votre campagne avec la nouvelle carte.'
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

  // Affichage de confirmation pour la réactivation
  if (isReactivation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-slate-900">
              🎉 Campagne réactivée !
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-slate-600">
              Parfait ! La campagne <strong>"{campaignName}"</strong> a été réactivée avec succès.
            </p>
            <p className="text-sm text-slate-500">
              Votre nouvelle carte de paiement a été enregistrée et la campagne accepte à nouveau les nouveaux clics.
            </p>
            <Button 
              onClick={handleContinueToDashboard}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              Retour au tableau de bord
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Cette page ne devrait plus jamais s'afficher normalement pour les créations
  return null;
};
