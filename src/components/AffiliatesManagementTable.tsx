
import { useAffiliates } from '@/hooks/useAffiliates';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Edit2, X, Hash, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import { AffiliateManagementDialog } from '@/components/AffiliateManagementDialog';
import { Affiliate } from '@/types';
import { useAffiliateStats } from '@/hooks/useAffiliateStats';
import { useAuth } from '@/hooks/useAuth';
import { calculateCommissionsSinceDate, createPaymentDistributionRecord, sendStripePaymentLinks } from '@/services/stripeConnectService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

interface AffiliatesManagementTableProps {
  campaignId: string;
  onCopyTrackingLink?: (affiliateId: string) => void;
}

export const AffiliatesManagementTable = ({ campaignId, onCopyTrackingLink }: AffiliatesManagementTableProps) => {
  const { affiliates, loading, deleteAffiliate } = useAffiliates(campaignId);
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [dialogMode, setDialogMode] = useState<'edit' | 'delete'>('edit');
  const [affiliateToDelete, setAffiliateToDelete] = useState<Affiliate | null>(null);
  const [isProcessingDeletion, setIsProcessingDeletion] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const AffiliateStatsCell = ({ affiliateId, commissionRate }: { affiliateId: string; commissionRate: number }) => {
    const { stats, loading } = useAffiliateStats(affiliateId);
    
    if (loading) {
      return <div className="text-xs text-slate-500">Chargement...</div>;
    }

    const conversionRate = stats.clicks > 0 ? ((stats.conversions / stats.clicks) * 100) : 0;
    const totalRevenue = stats.commissions / (commissionRate / 100);

    return (
      <div className="space-y-1">
        <div className="text-xs text-slate-600">
          Taux: <span className="font-medium">{conversionRate.toFixed(1)}%</span>
        </div>
        <div className="text-xs text-slate-600">
          CA: <span className="font-medium">{formatCurrency(totalRevenue)}</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-100 h-16 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (affiliates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 mb-4">
          <Hash className="h-12 w-12 mx-auto" />
        </div>
        <p className="text-slate-600 font-medium">Aucun affilié pour cette campagne</p>
        <p className="text-slate-500 text-sm mt-1">Les affiliés apparaîtront ici une fois ajoutés</p>
      </div>
    );
  }

  const handleCopyTrackingLink = (affiliateId: string) => {
    if (onCopyTrackingLink) {
      onCopyTrackingLink(affiliateId);
    }
  };

  const handleEditAffiliate = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setDialogMode('edit');
  };

  const handleDeleteClick = (affiliate: Affiliate) => {
    setAffiliateToDelete(affiliate);
  };

  const handleConfirmDelete = async () => {
    if (!affiliateToDelete || !user) return;

    setIsProcessingDeletion(true);
    try {
      console.log('🗑️ Début suppression affilié avec vérification CA:', affiliateToDelete.name);

      // Calculer les commissions de cet affilié spécifique
      const affiliateCommissions = await calculateCommissionsSinceDate(campaignId, null);
      const affiliatePayment = affiliateCommissions.affiliatePayments.find(
        payment => payment.affiliateId === affiliateToDelete.id
      );

      console.log('💰 Commissions affilié trouvées:', affiliatePayment);

      if (affiliatePayment && affiliatePayment.totalCommission > 0) {
        console.log('💳 Affilié avec CA > 0€, envoi du paiement avant suppression');
        
        // Créer un enregistrement de distribution pour cet affilié
        const distributionRecord = {
          totalRevenue: affiliatePayment.totalCommission / (affiliateToDelete.commissionRate / 100),
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
        await sendStripePaymentLinks(distributionRecord, `Suppression affilié - ${affiliateToDelete.name}`);

        toast({
          title: "Paiement envoyé",
          description: `Un email de paiement de ${formatCurrency(affiliatePayment.totalCommission)} a été envoyé à ${affiliateToDelete.email}`,
        });
      } else {
        console.log('🆓 Affilié sans CA, suppression directe');
      }

      // Procéder à la suppression de l'affilié
      await deleteAffiliate(affiliateToDelete.id);
      
      toast({
        title: "Affilié supprimé",
        description: `${affiliateToDelete.name} a été supprimé avec succès`,
      });

    } catch (error: any) {
      console.error('❌ Erreur suppression affilié:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'affilié",
        variant: "destructive",
      });
    } finally {
      setAffiliateToDelete(null);
      setIsProcessingDeletion(false);
    }
  };

  return (
    <>
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Affilié</TableHead>
              <TableHead>Code de suivi</TableHead>
              <TableHead>Date d'ajout</TableHead>
              <TableHead>Performances</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {affiliates.map((affiliate) => (
              <TableRow key={affiliate.id} className="hover:bg-slate-50">
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-slate-900">{affiliate.name}</div>
                    <Badge variant="outline" className="text-xs">
                      {affiliate.email}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Hash className="h-3 w-3" />
                    <span className="font-mono">{affiliate.trackingCode}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {affiliate.createdAt && (
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Calendar className="h-3 w-3" />
                      <span>{format(affiliate.createdAt, 'dd MMM yyyy', { locale: fr })}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <AffiliateStatsCell affiliateId={affiliate.id} commissionRate={affiliate.commissionRate} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditAffiliate(affiliate)}
                      className="rounded-xl"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCopyTrackingLink(affiliate.id)}
                      className="rounded-xl"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <div className="ml-3 border-l border-slate-200 pl-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteClick(affiliate)}
                        className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedAffiliate && (
        <AffiliateManagementDialog
          affiliate={selectedAffiliate}
          open={!!selectedAffiliate}
          onOpenChange={(open) => !open && setSelectedAffiliate(null)}
          mode={dialogMode}
        />
      )}

      <AlertDialog open={!!affiliateToDelete} onOpenChange={() => setAffiliateToDelete(null)}>
        <AlertDialogContent className="bg-white border border-slate-200 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'affilié</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'affilié <strong>{affiliateToDelete?.name}</strong> ? 
              {affiliateToDelete && (
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
    </>
  );
};
