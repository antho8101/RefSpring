
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, DollarSign, Users, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Campaign } from '@/types';
import { 
  calculateCommissionsSinceDate, 
  createPaymentDistributionRecord,
  sendStripePaymentLinks,
  PaymentDistribution 
} from '@/services/stripeConnectService';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  const [lastPaymentDate] = useState(new Date(2024, 11, 5)); // Simuler dernier paiement 5 décembre
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

      // 1. Créer l'enregistrement de distribution
      await createPaymentDistributionRecord(
        campaign.id,
        user.uid,
        distribution,
        'campaign_deletion'
      );

      // 2. Envoyer les liens de paiement Stripe
      await sendStripePaymentLinks(distribution, campaign.name);

      // 3. Supprimer la campagne
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Suppression de campagne avec paiement
          </DialogTitle>
          <DialogDescription>
            Cette campagne contient des commissions non payées. Elles seront automatiquement 
            distribuées avant la suppression.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Info campagne */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 mb-2">Campagne à supprimer</h4>
            <p className="text-slate-700">{campaign.name}</p>
            <p className="text-sm text-slate-500 mt-1">
              Dernier paiement : {format(lastPaymentDate, 'dd MMMM yyyy', { locale: fr })}
            </p>
          </div>

          {/* Calcul des commissions */}
          {calculatingCommissions && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">🔄 Calcul des commissions en cours...</p>
            </div>
          )}

          {distribution && (
            <div className="space-y-3">
              {/* Résumé financier */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Résumé des paiements
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-green-700">CA depuis dernier paiement</p>
                    <p className="font-medium text-green-900">{distribution.totalRevenue.toFixed(2)}€</p>
                  </div>
                  <div>
                    <p className="text-green-700">Total commissions affiliés</p>
                    <p className="font-medium text-green-900">{distribution.totalCommissions.toFixed(2)}€</p>
                  </div>
                  <div>
                    <p className="text-green-700">Commission RefSpring (2.5%)</p>
                    <p className="font-medium text-green-900">{distribution.platformFee.toFixed(2)}€</p>
                  </div>
                  <div>
                    <p className="text-green-700 font-medium">Total à distribuer</p>
                    <p className="font-bold text-green-900">{totalToDistribute.toFixed(2)}€</p>
                  </div>
                </div>
              </div>

              {/* Détail par affilié */}
              {distribution.affiliatePayments.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Paiements aux affiliés ({distribution.affiliatePayments.length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {distribution.affiliatePayments.map((payment) => (
                      <div key={payment.affiliateId} className="flex items-center justify-between py-1">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{payment.affiliateName}</p>
                          <p className="text-xs text-slate-500">{payment.conversionsCount} conversions</p>
                        </div>
                        <Badge variant="secondary">
                          {payment.totalCommission.toFixed(2)}€
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Processus */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Processus de suppression</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Envoi des liens de paiement Stripe aux affiliés par email</li>
                  <li>2. Transfert de notre commission (2.5% + frais)</li>
                  <li>3. Suppression définitive de la campagne et données associées</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
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
          >
            {loading ? 'Suppression en cours...' : `Distribuer ${totalToDistribute.toFixed(2)}€ et supprimer`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
