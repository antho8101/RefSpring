
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Campaign } from '@/types';
import { 
  calculateCommissionsSinceDate, 
  createPaymentDistributionRecord,
  sendStripePaymentLinks,
  getLastPaymentInfo,
  PaymentDistribution,
  LastPaymentInfo 
} from '@/services/stripeConnectService';
import { StripeInvoiceService } from '@/services/stripeInvoiceService';
import { useAuth } from '@/hooks/useAuth';
import { CampaignInfoSection } from '@/components/campaign-deletion/CampaignInfoSection';
import { LoadingSection } from '@/components/campaign-deletion/LoadingSection';
import { BillingBreakdownSection } from '@/components/campaign-deletion/BillingBreakdownSection';
import { RevenueDisplaySection } from '@/components/campaign-deletion/RevenueDisplaySection';
import { AffiliatePaymentsSection } from '@/components/campaign-deletion/AffiliatePaymentsSection';
import { ProcessInfoSection } from '@/components/campaign-deletion/ProcessInfoSection';

interface CampaignDeletionDialogProps {
  campaign: Campaign;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDeletion: () => Promise<void>;
}

export const CampaignDeletionDialog = ({ 
  campaign, 
  open, 
  onOpenChange, 
  onConfirmDeletion 
}: CampaignDeletionDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [calculatingCommissions, setCalculatingCommissions] = useState(false);
  const [distribution, setDistribution] = useState<PaymentDistribution | null>(null);
  const [lastPaymentInfo, setLastPaymentInfo] = useState<LastPaymentInfo>({
    hasPayments: false,
    lastPaymentDate: null
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (open && campaign.id) {
      initializePaymentCalculation();
    }
  }, [open, campaign.id]);

  const initializePaymentCalculation = async () => {
    setCalculatingCommissions(true);
    try {
      console.log('🔄 Récupération des informations de paiement pour:', campaign.name);
      
      // Récupérer les vraies informations de dernier paiement
      const paymentInfo = await getLastPaymentInfo(campaign.id);
      setLastPaymentInfo(paymentInfo);
      
      console.log('📅 Informations de paiement:', paymentInfo);
      
      // Calculer les commissions depuis le dernier paiement (ou depuis le début si aucun)
      const commissions = await calculateCommissionsSinceDate(
        campaign.id, 
        paymentInfo.lastPaymentDate
      );
      setDistribution(commissions);
      
      console.log('✅ Commissions calculées:', commissions);
    } catch (error) {
      console.error('❌ Erreur initialisation calculs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de calculer les commissions en attente",
        variant: "destructive",
      });
    } finally {
      setCalculatingCommissions(false);
    }
  };

  const handleDeleteWithPayments = async () => {
    if (!distribution || !user) return;

    setLoading(true);
    try {
      console.log('🚀 Début suppression avec paiements pour:', campaign.name);

      // 1. Créer l'enregistrement de distribution
      await createPaymentDistributionRecord(
        campaign.id,
        user.uid,
        distribution,
        'campaign_deletion'
      );

      // 2. Envoyer les paiements aux affiliés
      await sendStripePaymentLinks(distribution, campaign.name);

      // 3. NOUVEAU: Créer et envoyer la facture Stripe pour la commission RefSpring
      if (distribution.platformFee > 0) {
        console.log('💳 Création facture Stripe pour commission RefSpring:', distribution.platformFee);
        
        // 🔥 CORRECTION: Passer le stripePaymentMethodId de la campagne
        if (!campaign.stripePaymentMethodId) {
          throw new Error('Aucune méthode de paiement associée à cette campagne. Veuillez configurer une carte bancaire.');
        }
        
        const invoiceResult = await StripeInvoiceService.createAndSendInvoice({
          userEmail: user.email!,
          amount: Math.round(distribution.platformFee * 100), // Convertir en centimes
          description: `Commission RefSpring - Suppression campagne "${campaign.name}"`,
          campaignName: campaign.name,
          stripePaymentMethodId: campaign.stripePaymentMethodId, // 🔥 AJOUT du paramètre manquant
        });

        if (!invoiceResult.success) {
          throw new Error(`Erreur facturation Stripe: ${invoiceResult.error}`);
        }

        console.log('✅ Facture Stripe créée avec succès:', invoiceResult.invoiceId);
      }

      // 4. Supprimer la campagne
      await onConfirmDeletion();

      toast({
        title: "Suppression terminée",
        description: `Les commissions ont été distribuées, la facture RefSpring payée, et la campagne "${campaign.name}" a été supprimée.`,
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('❌ Erreur suppression avec paiements:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression avec paiements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalToDistribute = distribution ? 
    distribution.totalCommissions + distribution.platformFee : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Paiement de suppression de campagne
          </DialogTitle>
          <DialogDescription>
            Cette suppression génère des frais qui vous seront débités automatiquement.
            Consultez le détail ci-dessous avant de confirmer.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4 flex-1 overflow-y-auto">
          <CampaignInfoSection 
            campaign={campaign} 
            lastPaymentInfo={lastPaymentInfo}
          />
          
          <LoadingSection 
            isLoading={calculatingCommissions} 
            message="Calcul des montants en cours..." 
          />

          {distribution && (
            <div className="space-y-4">
              <BillingBreakdownSection 
                distribution={distribution} 
                totalToDistribute={totalToDistribute} 
              />
              
              <RevenueDisplaySection 
                distribution={distribution} 
                lastPaymentInfo={lastPaymentInfo}
              />
              
              <AffiliatePaymentsSection distribution={distribution} />
              
              <ProcessInfoSection />
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sticky bottom-0 bg-white pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDeleteWithPayments}
            disabled={loading || calculatingCommissions || !distribution}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? 'Paiement en cours...' : `Payer ${totalToDistribute.toFixed(2)}€ et supprimer`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
