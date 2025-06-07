
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle } from 'lucide-react';
import { Campaign } from '@/types';
import { CriticalActionConfirmDialog } from '@/components/CriticalActionConfirmDialog';

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

  const handleStatusChange = (isActive: boolean) => {
    if (!isActive && campaign.isActive) {
      handleCriticalChange(
        'isActive',
        isActive,
        'Désactiver la campagne',
        'Cette action va désactiver tous les liens de tracking de la campagne. Les affiliés ne pourront plus générer de nouveaux clics ou conversions.',
        'Désactiver',
        'warning'
      );
    } else {
      onFormDataChange({ ...formData, isActive });
    }
  };

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-8 h-full flex flex-col">
        <div className="flex-1 space-y-6">
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
          
          <div className="flex items-center justify-between py-4 px-4 bg-slate-50 rounded-lg">
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
    </>
  );
};
