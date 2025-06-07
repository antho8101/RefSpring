
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Campaign } from '@/types';

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
  formData,
  initialTargetUrl,
  loading,
  onFormDataChange,
  onSubmit,
  onCancel,
  onDeleteClick,
}: CampaignGeneralSettingsProps) => {
  const hasTargetUrlChanged = formData.targetUrl !== initialTargetUrl;

  return (
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
              onChange={(e) => onFormDataChange({ ...formData, defaultCommissionRate: parseFloat(e.target.value) })}
              required
            />
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
            onChange={(e) => onFormDataChange({ ...formData, targetUrl: e.target.value })}
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
          </div>
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => onFormDataChange({ ...formData, isActive: checked })}
          />
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t">
        <Button
          type="button"
          variant="destructive"
          onClick={onDeleteClick}
          className="rounded-xl"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Supprimer la campagne
        </Button>
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
  );
};
