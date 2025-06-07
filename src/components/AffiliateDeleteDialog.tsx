
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAffiliates } from '@/hooks/useAffiliates';
import { calculateCommissionsSinceDate, createPaymentDistributionRecord, sendStripePaymentLinks } from '@/services/stripeConnectService';
import { Affiliate } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AffiliateDeleteDialogProps {
  affiliate: Affiliate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
}

export const AffiliateDeleteDialog = ({ affiliate, open, onOpenChange, campaignId }: AffiliateDeleteDialogProps) => {
  const [isProcessingDeletion, setIsProcessingDeletion] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { deleteAffiliate } = useAffiliates();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const handleConfirmDelete = async () => {
    if (!affiliate || !user) return;

    setIsProcessingDeletion(true);
    try {
      console.log('🗑️ Début suppression affilié avec vérification CA:', affiliate.name);

      // Calculer les commissions de cet affilié spécifique
      const affiliateCommissions = await calculateCommissionsSinceDate(campaignId, null);
      const affiliatePayment = affiliateCommissions.affiliatePayments.find(
        payment => payment.affiliateId === affiliate.id
      );

      console.log('💰 Commissions affilié trouvées:', affiliatePayment);

      if (affiliatePayment && affiliatePayment.totalCommission > 0) {
        console.log('💳 Affilié avec CA > 0€, envoi du paiement avant suppression');
        
        // Créer un enregistrement de distribution pour cet affilié
        const distributionRecord = {
          totalRevenue: affiliatePayment.totalCommission / (affiliate.commissionRate / 100),
          totalCommissions: affiliatePayment.totalCommission,
          platformFee: 0, // Pas de commission RefSpring pour une suppression d'affilié individuel
          affiliatePayments: [affiliatePayment]
        };

        await createPaymentDistributionRecord(
          campaignId,
          user.uid,
          distributionRecord,
          'campaign_deletion' // Réutiliser le même type pour la cohérence
        );

        // Envoyer le paiement par email
        await sendStripePaymentLinks(distributionRecord, `Suppression affilié - ${affiliate.name}`);

        toast({
          title: "Paiement envoyé",
          description: `Un email de paiement de ${formatCurrency(affiliatePayment.totalCommission)} a été envoyé à ${affiliate.email}`,
        });
      } else {
        console.log('🆓 Affilié sans CA, suppression directe');
      }

      // Procéder à la suppression de l'affilié
      await deleteAffiliate(affiliate.id);
      
      toast({
        title: "Affilié supprimé",
        description: `${affiliate.name} a été supprimé avec succès`,
      });

      onOpenChange(false);

    } catch (error: any) {
      console.error('❌ Erreur suppression affilié:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'affilié",
        variant: "destructive",
      });
    } finally {
      setIsProcessingDeletion(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white border border-slate-200 shadow-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer l'affilié</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer l'affilié <strong>{affiliate?.name}</strong> ? 
            {affiliate && (
              <div className="mt-2 text-sm">
                <div className="text-blue-600 font-medium">
                  ℹ️ Si cet affilié a généré du chiffre d'affaires, ses commissions lui seront automatiquement envoyées par email avant la suppression.
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessingDeletion}>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirmDelete}
            disabled={isProcessingDeletion}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isProcessingDeletion ? 'Traitement...' : 'Supprimer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
