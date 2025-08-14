import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useStripeConnect } from '@/hooks/useStripeConnect';
import { Affiliate } from '@/types';
import { CreditCard, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StripeConnectButtonProps {
  affiliate: Affiliate;
  onAccountCreated?: (accountId: string) => void;
}

export const StripeConnectButton = ({ affiliate, onAccountCreated }: StripeConnectButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { createConnectAccount, createAccountLink, loading, error } = useStripeConnect();
  const { toast } = useToast();

  // Vérifier si l'affilié a déjà un compte Stripe Connect
  const hasStripeAccount = affiliate.stripeAccountId;
  const isAccountVerified = affiliate.stripeAccountStatus === 'verified';

  const handleConnectStripe = async () => {
    setIsProcessing(true);
    
    try {
      let accountId = affiliate.stripeAccountId;

      // Étape 1: Créer le compte Stripe Connect si nécessaire
      if (!accountId) {
        console.log('🔄 Creating new Stripe Connect account...');
        const accountData = await createConnectAccount(
          affiliate.email,
          affiliate.name,
          'FR'
        );
        accountId = accountData.accountId;
        
        // TODO: Mettre à jour l'affilié avec l'accountId dans Firestore
        if (onAccountCreated) {
          onAccountCreated(accountId);
        }

        toast({
          title: "Compte Stripe créé",
          description: "Redirection vers la configuration...",
        });
      }

      // Étape 2: Créer le lien d'onboarding
      console.log('🔄 Creating onboarding link...');
      const linkData = await createAccountLink(
        accountId,
        affiliate.id,
        `${window.location.origin}/affiliate-onboarding?account=${accountId}&refresh=true`,
        `${window.location.origin}/affiliate-onboarding?account=${accountId}&success=true`
      );

      // Étape 3: Rediriger vers Stripe
      console.log('✅ Redirecting to Stripe onboarding...');
      window.open(linkData.onboardingUrl, '_blank');

      toast({
        title: "Configuration Stripe",
        description: "Nouvelle fenêtre ouverte pour configurer les paiements",
      });

    } catch (err: any) {
      console.error('❌ Error with Stripe Connect:', err);
      toast({
        title: "Erreur",
        description: err.message || "Erreur lors de la configuration Stripe",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Bouton si le compte est déjà vérifié
  if (isAccountVerified) {
    return (
      <Button variant="outline" size="sm" disabled className="text-green-600 border-green-200">
        <CheckCircle className="h-4 w-4 mr-2" />
        Paiements configurés
      </Button>
    );
  }

  // Bouton si le compte existe mais n'est pas vérifié
  if (hasStripeAccount && !isAccountVerified) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleConnectStripe}
        disabled={loading || isProcessing}
        className="text-orange-600 border-orange-200"
      >
        {(loading || isProcessing) ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <AlertCircle className="h-4 w-4 mr-2" />
        )}
        Finaliser la configuration
      </Button>
    );
  }

  // Bouton pour créer le premier compte
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleConnectStripe}
      disabled={loading || isProcessing}
      className="text-blue-600 border-blue-200 hover:bg-blue-50"
    >
      {(loading || isProcessing) ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <CreditCard className="h-4 w-4 mr-2" />
      )}
      Configurer les paiements
    </Button>
  );
};