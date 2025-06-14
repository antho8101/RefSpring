
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Pause } from 'lucide-react';
import { Campaign } from '@/types';
import { CriticalActionConfirmDialog } from '@/components/CriticalActionConfirmDialog';
import { PaymentMethodSelector } from '@/components/PaymentMethodSelector';
import { useCampaigns } from '@/hooks/useCampaigns';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useToast } from '@/hooks/use-toast';

interface CampaignGeneralSettingsProps {
  campaign: Campaign;
  formData: {
    name: string;
    description: string;
    targetUrl: string;
    isActive: boolean;
    defaultCommissionRate: number;
  };
  initialTargetUrl: string;
  loading: boolean;
  onFormDataChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onDeleteClick: () => void;
}

export const CampaignGeneralSettings = ({
  campaign,
  formData,
  initialTargetUrl,
  loading,
  onFormDataChange,
  onSubmit,
  onCancel,
}: CampaignGeneralSettingsProps) => {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
    confirmText?: string;
    variant?: 'warning' | 'danger';
  }>({
    open: false,
    title: '',
    description: '',
    action: () => {},
  });

  const [showPaymentSelector, setShowPaymentSelector] = useState(false);

  const { updateCampaign } = useCampaigns();
  const { paymentMethods, loading: paymentMethodsLoading, refreshPaymentMethods } = usePaymentMethods();
  const { toast } = useToast();

  const hasTargetUrlChanged = formData.targetUrl !== initialTargetUrl;
  const hasCommissionChanged = formData.defaultCommissionRate !== campaign.defaultCommissionRate;
  const hasStatusChanged = formData.isActive !== campaign.isActive;

  const handleCriticalChange = (
    field: string,
    value: any,
    title: string,
    description: string,
    confirmText?: string,
    variant?: 'warning' | 'danger'
  ) => {
    setConfirmDialog({
      open: true,
      title,
      description,
      confirmText,
      variant,
      action: () => onFormDataChange({ ...formData, [field]: value })
    });
  };

  const handleTargetUrlChange = (newUrl: string) => {
    if (newUrl !== initialTargetUrl && initialTargetUrl) {
      handleCriticalChange(
        'targetUrl',
        newUrl,
        'Changer l\'URL de destination',
        'Cette action va modifier l\'URL vers laquelle les affiliés redirigent leurs visiteurs. Assurez-vous d\'ajouter le script de tracking sur la nouvelle page.',
        'Changer l\'URL'
      );
    } else {
      onFormDataChange({ ...formData, targetUrl: newUrl });
    }
  };

  const handleCommissionRateChange = (newRate: number) => {
    if (newRate !== campaign.defaultCommissionRate) {
      handleCriticalChange(
        'defaultCommissionRate',
        newRate,
        'Modifier le taux de commission',
        'Cette modification changera le taux de commission par défaut pour les nouveaux affiliés. Les affiliés existants conserveront leur taux actuel.',
        'Modifier le taux'
      );
    } else {
      onFormDataChange({ ...formData, defaultCommissionRate: newRate });
    }
  };

  const handleStatusChange = async (isActive: boolean) => {
    if (!isActive && campaign.isActive) {
      // Désactivation : procédure normale
      handleCriticalChange(
        'isActive',
        isActive,
        'Désactiver la campagne',
        'Cette action va désactiver tous les liens de tracking de la campagne. Les affiliés ne pourront plus générer de nouveaux clics ou conversions.',
        'Désactiver',
        'warning'
      );
    } else if (isActive && !campaign.isActive) {
      // Réactivation : VÉRIFIER LES CARTES D'ABORD !
      console.log('🔄 Tentative de réactivation - vérification des cartes...');
      
      try {
        // Actualiser les cartes disponibles
        await refreshPaymentMethods();
        
        if (paymentMethods.length === 0) {
          console.log('❌ Aucune carte disponible pour la réactivation');
          toast({
            title: "Impossible de réactiver",
            description: "Vous devez d'abord ajouter une carte bancaire pour réactiver cette campagne.",
            variant: "destructive",
          });
          
          // Afficher le sélecteur de cartes pour ajouter une carte
          setShowPaymentSelector(true);
          return;
        }
        
        console.log('✅ Cartes disponibles, réactivation possible');
        // Procéder à la réactivation normale
        saveStatusChange(isActive);
        
      } catch (error) {
        console.error('❌ Erreur lors de la vérification des cartes:', error);
        toast({
          title: "Erreur",
          description: "Impossible de vérifier les cartes bancaires",
          variant: "destructive",
        });
      }
    } else {
      // Pas de changement de statut
      saveStatusChange(isActive);
    }
  };

  const saveStatusChange = async (isActive: boolean) => {
    try {
      console.log('🔄 Sauvegarde du statut:', { campaignId: campaign.id, isActive });
      
      // Utiliser directement updateCampaign pour une sauvegarde immédiate
      await updateCampaign(campaign.id, { isActive });
      
      // Mettre à jour le formData local
      onFormDataChange({ ...formData, isActive });
      
      toast({
        title: isActive ? "✅ Campagne activée" : "⏸️ Campagne désactivée",
        description: isActive ? 
          "Votre campagne est maintenant active et accepte les nouveaux clics !" :
          "Votre campagne est maintenant en pause.",
      });
      
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde du statut:', error);
      
      toast({
        title: "❌ Erreur",
        description: "Impossible de modifier le statut de la campagne",
        variant: "destructive",
      });
      
      // En cas d'erreur, revenir à l'état précédent
      onFormDataChange({ ...formData, isActive: campaign.isActive });
    }
  };

  const handleCardSelection = async (cardId: string) => {
    try {
      console.log('💳 Association de la carte', cardId, 'à la campagne', campaign.id);
      
      // Mettre à jour la campagne avec la nouvelle carte ET l'activer
      await updateCampaign(campaign.id, {
        stripePaymentMethodId: cardId,
        isActive: true,
      });
      
      // Mettre à jour le formData local
      onFormDataChange({ ...formData, isActive: true });
      
      setShowPaymentSelector(false);
      
      toast({
        title: "✅ Parfait !",
        description: "La carte a été associée et la campagne a été réactivée !",
      });
      
    } catch (error: any) {
      console.error('❌ Erreur association carte:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'associer la carte à la campagne",
        variant: "destructive",
      });
    }
  };

  const handleAddNewCard = () => {
    // Rediriger vers Stripe pour ajouter une carte
    // TODO: Implémenter la redirection vers Stripe
    setShowPaymentSelector(false);
    toast({
      title: "Redirection Stripe",
      description: "Fonctionnalité d'ajout de carte à implémenter",
    });
  };

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-8 h-full flex flex-col">
        <div className="flex-1 space-y-6">
          {/* Bandeau d'alerte pour campagne en pause */}
          {!formData.isActive && (
            <Alert className="border-orange-200 bg-orange-50">
              <Pause className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Campagne en pause</strong> - Les liens de tracking n'acceptent plus de nouveaux clics. 
                Activez la campagne pour reprendre le tracking des conversions.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la campagne</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                placeholder="Ex: Programme d'affiliation 2024"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultCommissionRate">Taux de commission par défaut (%)</Label>
              <Input
                id="defaultCommissionRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.defaultCommissionRate}
                onChange={(e) => handleCommissionRateChange(parseFloat(e.target.value))}
                required
              />
              {hasCommissionChanged && (
                <p className="text-xs text-orange-600">
                  ⚠️ Ce changement affectera uniquement les nouveaux affiliés
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              placeholder="Description de votre campagne d'affiliation..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetUrl">URL de destination</Label>
            <Input
              id="targetUrl"
              value={formData.targetUrl}
              onChange={(e) => handleTargetUrlChange(e.target.value)}
              placeholder="https://monsite.com/produit"
              required
            />
            {hasTargetUrlChanged && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-orange-800 font-medium">Attention - URL modifiée</p>
                  <p className="text-orange-700">
                    N'oubliez pas d'ajouter le script de tracking à la nouvelle page de destination pour continuer à traquer les conversions.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className={`flex items-center justify-between py-4 px-4 rounded-lg transition-colors ${
            formData.isActive 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-orange-50 border border-orange-200'
          }`}>
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Campagne active</Label>
              <p className="text-sm text-muted-foreground">
                Les campagnes inactives n'acceptent plus de nouveaux clics
              </p>
              {hasStatusChanged && !formData.isActive && (
                <p className="text-xs text-orange-600">
                  ⚠️ Cette action va désactiver tous les liens de tracking
                </p>
              )}
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={handleStatusChange}
              disabled={paymentMethodsLoading}
            />
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t">
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl">
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="rounded-xl">
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </form>

      <CriticalActionConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.action}
      />

      <PaymentMethodSelector
        open={showPaymentSelector}
        onOpenChange={setShowPaymentSelector}
        paymentMethods={paymentMethods}
        onSelectCard={handleCardSelection}
        onAddNewCard={handleAddNewCard}
        loading={paymentMethodsLoading}
      />
    </>
  );
};
