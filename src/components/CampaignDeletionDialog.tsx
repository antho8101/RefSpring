
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
  PaymentDistribution 
} from '@/services/stripeConnectService';
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
  // CORRECTION : Mettre une date plus récente pour capturer les conversions de test
  const [lastPaymentDate] = useState(new Date(2024, 11, 1)); // 1er décembre au lieu du 5
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (open && campaign.id) {
      calculatePendingCommissions();
    }
  }, [open, campaign.id]);

  const calculatePendingCommissions = async () => {
    setCalculatingCommissions(true);
    try {
      console.log('🔄 Calcul des commissions en attente pour:', campaign.name);
      const commissions = await calculateCommissionsSinceDate(campaign.id, lastPaymentDate);
      setDistribution(commissions);
      console.log('✅ Commissions calculées:', commissions);
    } catch (error) {
      console.error('❌ Erreur calcul commissions:', error);
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

      await createPaymentDistributionRecord(
        campaign.id,
        user.uid,
        distribution,
        'campaign_deletion'
      );

      await sendStripePaymentLinks(distribution, campaign.name);
      await onConfirmDeletion();

      toast({
        title: "Suppression terminée",
        description: `Les commissions ont été distribuées et la campagne "${campaign.name}" a été supprimée.`,
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
            Facturation de suppression de campagne
          </DialogTitle>
          <DialogDescription>
            Cette suppression génère des frais qui seront facturés automatiquement.
            Consultez le détail ci-dessous avant de confirmer.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4 flex-1 overflow-y-auto">
          <CampaignInfoSection campaign={campaign} lastPaymentDate={lastPaymentDate} />
          
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
                lastPaymentDate={lastPaymentDate} 
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
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Facturation en cours...' : `Facturer ${totalToDistribute.toFixed(2)}€ et supprimer`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
