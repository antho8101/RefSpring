
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, DollarSign, Users, Calendar, CreditCard } from 'lucide-react';
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
      <DialogContent className="sm:max-w-[650px]">
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

        <div className="py-4 space-y-4">
          {/* Info campagne */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 mb-2">Campagne à supprimer</h4>
            <p className="text-slate-700 font-medium">{campaign.name}</p>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Dernier paiement : {format(lastPaymentDate, 'dd MMMM yyyy', { locale: fr })}
            </p>
          </div>

          {/* Calcul des commissions */}
          {calculatingCommissions && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Calcul des montants en cours...
              </p>
            </div>
          )}

          {distribution && (
            <div className="space-y-4">
              {/* Récapitulatif financier avec séparation claire */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Montants qui vous seront facturés
                </h4>
                <div className="space-y-3">
                  {/* Commissions affiliés */}
                  <div className="bg-white rounded-lg p-3 border border-red-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-red-900">Commissions aux affiliés</p>
                        <p className="text-sm text-red-700">
                          Montant à reverser aux {distribution.affiliatePayments.length} affilié(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-red-900">
                          {distribution.totalCommissions.toFixed(2)}€
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Commission RefSpring */}
                  <div className="bg-white rounded-lg p-3 border border-red-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-red-900">Commission RefSpring</p>
                        <p className="text-sm text-red-700">
                          2.5% sur le CA de {distribution.totalRevenue.toFixed(2)}€ + frais Stripe
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-red-900">
                          {distribution.platformFee.toFixed(2)}€
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-red-100 rounded-lg p-3 border-2 border-red-300">
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-bold text-red-900">TOTAL À FACTURER</p>
                      <p className="text-2xl font-black text-red-900">
                        {totalToDistribute.toFixed(2)}€
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chiffre d'affaires pour contexte */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Chiffre d'affaires depuis le dernier paiement
                </h4>
                <p className="text-2xl font-bold text-slate-900">{distribution.totalRevenue.toFixed(2)}€</p>
                <p className="text-sm text-slate-600 mt-1">
                  Généré entre le {format(lastPaymentDate, 'dd MMMM', { locale: fr })} et aujourd'hui
                </p>
              </div>

              {/* Détail par affilié */}
              {distribution.affiliatePayments.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Détail des paiements aux affiliés
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {distribution.affiliatePayments.map((payment) => (
                      <div key={payment.affiliateId} className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{payment.affiliateName}</p>
                          <p className="text-xs text-slate-500">{payment.conversionsCount} conversions</p>
                        </div>
                        <Badge variant="secondary" className="font-semibold">
                          {payment.totalCommission.toFixed(2)}€
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Processus */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Processus de facturation et suppression</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. 💳 Prélèvement automatique sur votre carte enregistrée</li>
                  <li>2. 📧 Envoi des liens de paiement Stripe aux affiliés</li>
                  <li>3. 💰 Transfert des commissions vers les comptes affiliés</li>
                  <li>4. 🗑️ Suppression définitive de la campagne et données associées</li>
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
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Facturation en cours...' : `Facturer ${totalToDistribute.toFixed(2)}€ et supprimer`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
