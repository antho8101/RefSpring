import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useStripeConnect } from '@/hooks/useStripeConnect';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  ExternalLink, 
  CreditCard, 
  ArrowRight,
  Info,
  Gift,
  Loader2
} from 'lucide-react';

export default function CommissionInfoPage() {
  const [searchParams] = useSearchParams();
  const [isConfiguring, setIsConfiguring] = useState(false);
  const { createConnectAccount, createAccountLink, loading } = useStripeConnect();
  const { toast } = useToast();
  
  const amount = searchParams.get('amount') || '0';
  const campaign = searchParams.get('campaign') || 'Campagne inconnue';
  const affiliateId = searchParams.get('affiliate') || '';
  const affiliateEmail = searchParams.get('email') || '';
  const affiliateName = searchParams.get('name') || 'Affilié';

  const handleConfigureStripeConnect = async () => {
    if (!affiliateEmail) {
      toast({
        title: "Erreur",
        description: "Email manquant. Veuillez contacter le support.",
        variant: "destructive",
      });
      return;
    }

    setIsConfiguring(true);
    
    try {
      // Étape 1: Créer le compte Stripe Connect
      console.log('🔄 Creating Stripe Connect account...');
      const accountData = await createConnectAccount(
        affiliateEmail,
        affiliateName,
        'FR'
      );

      // Étape 2: Créer le lien d'onboarding
      console.log('🔄 Creating onboarding link...');
      const linkData = await createAccountLink(
        accountData.accountId,
        affiliateId,
        `${window.location.origin}/commission-info?refresh=true&${searchParams.toString()}`,
        `${window.location.origin}/commission-info?success=true&${searchParams.toString()}`
      );

      // Étape 3: Rediriger vers Stripe
      console.log('✅ Redirecting to Stripe onboarding...');
      window.open(linkData.onboardingUrl, '_blank');

      toast({
        title: "Configuration Stripe lancée",
        description: "Une nouvelle fenêtre s'est ouverte pour configurer votre compte Stripe",
      });

    } catch (err: any) {
      console.error('❌ Error with Stripe Connect:', err);
      toast({
        title: "Erreur",
        description: err.message || "Erreur lors de la configuration Stripe",
        variant: "destructive",
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header avec félicitations */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Gift className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-green-800">
              Félicitations ! 🎉
            </CardTitle>
            <CardDescription className="text-green-700">
              Vous avez gagné une commission sur la campagne RefSpring
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Détails de la commission */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Détails de votre commission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Campagne :</span>
              <Badge variant="outline" className="font-semibold">
                {campaign}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Montant de votre commission :</span>
              <Badge className="bg-green-100 text-green-800 text-lg font-bold px-3 py-1">
                {amount}€
              </Badge>
            </div>
            
            <Separator />
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Comment recevoir votre paiement ?
                  </h4>
                  <p className="text-blue-700 text-sm">
                    Pour recevoir vos commissions automatiquement, vous devez configurer 
                    votre compte Stripe Connect. C'est gratuit et sécurisé !
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Étapes pour configurer Stripe Connect */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Configurer Stripe Connect
            </CardTitle>
            <CardDescription>
              Suivez ces étapes simples pour recevoir vos futures commissions automatiquement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold">Créez votre compte Stripe directement</h4>
                  <p className="text-sm text-slate-600">
                    Configurez votre compte Stripe Connect en quelques clics (gratuit et sécurisé)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold">Complétez votre profil Stripe</h4>
                  <p className="text-sm text-slate-600">
                    Renseignez vos informations bancaires et de facturation
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold">Recevez vos commissions automatiquement</h4>
                  <p className="text-sm text-slate-600">
                    Toutes vos futures commissions seront versées directement sur votre compte !
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 text-sm">
                <strong>💡 Bon à savoir :</strong> Cette commission de {amount}€ sera versée 
                dès que votre compte Stripe Connect sera configuré. Rien n'est perdu !
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bouton d'action */}
        <div className="flex flex-col gap-3">
          <Button 
            onClick={handleConfigureStripeConnect}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
            disabled={loading || isConfiguring || !affiliateEmail}
          >
            {(loading || isConfiguring) ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4 mr-2" />
            )}
            Configurer mon compte Stripe Connect
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          <p className="text-center text-sm text-slate-500">
            ID Affilié : {affiliateId} {!affiliateEmail && " • Email manquant"}
          </p>
        </div>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-sm text-slate-500">
            Une question ? Contactez-nous sur{' '}
            <a 
              href="https://refspring.com/contact" 
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              refspring.com/contact
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}