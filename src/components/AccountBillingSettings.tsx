import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, RefreshCw, Star } from 'lucide-react';
import { PaymentMethodCard } from '@/components/PaymentMethodCard';
import { AddPaymentMethodDialog } from '@/components/AddPaymentMethodDialog';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { paymentMethodService } from '@/services/paymentMethodService';
import { useAuth } from '@/hooks/useAuth';

interface AccountBillingSettingsProps {
  onCancel: () => void;
}

export const AccountBillingSettings = ({ onCancel }: AccountBillingSettingsProps) => {
  const { 
    paymentMethods, 
    loading, 
    getLinkedCampaigns, 
    canDeletePaymentMethod,
    deletePaymentMethod,
    refreshPaymentMethods
  } = usePaymentMethods();
  const { user } = useAuth();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    setDeletingId(paymentMethodId);
    try {
      await deletePaymentMethod(paymentMethodId);
      toast({
        title: "Carte supprimée",
        description: "La carte bancaire a été supprimée et les campagnes associées ont été mises en pause",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la carte bancaire",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefaultCard = async (paymentMethodId: string) => {
    if (!user?.email) return;
    
    setSettingDefaultId(paymentMethodId);
    try {
      await paymentMethodService.setDefaultPaymentMethod(user.email, paymentMethodId);
      await refreshPaymentMethods();
      toast({
        title: "Carte par défaut mise à jour",
        description: "Cette carte est maintenant votre carte par défaut",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de définir cette carte comme par défaut",
        variant: "destructive",
      });
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleRefresh = () => {
    refreshPaymentMethods();
    toast({
      title: "Actualisation",
      description: "Les informations de facturation ont été actualisées",
    });
  };

  if (loading && paymentMethods.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mb-4">
            <CreditCard className="h-16 w-16 mx-auto text-slate-400 animate-pulse" />
          </div>
          <p className="text-slate-600">Chargement des cartes bancaires...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-medium text-slate-900">Cartes bancaires</h4>
          <p className="text-sm text-slate-600">
            Gérez vos cartes bancaires et définissez votre carte par défaut
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <AddPaymentMethodDialog onPaymentMethodAdded={refreshPaymentMethods} />
        </div>
      </div>

      <ScrollArea className="flex-1 h-96">
        {paymentMethods.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
            <div className="mb-4">
              <CreditCard className="h-16 w-16 mx-auto text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Aucune carte bancaire
            </h3>
            <p className="text-slate-600 mb-6">
              Ajoutez une carte bancaire pour commencer à utiliser nos services
            </p>
            <AddPaymentMethodDialog onPaymentMethodAdded={refreshPaymentMethods} />
          </div>
        ) : (
          <div className="grid gap-4 pr-4">
            {paymentMethods.map((paymentMethod) => (
              <div key={paymentMethod.id} className="relative">
                <PaymentMethodCard
                  paymentMethod={paymentMethod}
                  linkedCampaigns={getLinkedCampaigns(paymentMethod.id)}
                  canDelete={canDeletePaymentMethod(paymentMethod.id)}
                  onDelete={handleDeletePaymentMethod}
                  isDeleting={deletingId === paymentMethod.id}
                />
                {!paymentMethod.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetDefaultCard(paymentMethod.id)}
                    disabled={settingDefaultId === paymentMethod.id}
                    className="absolute top-3 right-12 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="pt-6 border-t flex-shrink-0">
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
};
