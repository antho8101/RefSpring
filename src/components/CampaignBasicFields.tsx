
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';

interface CampaignBasicFieldsProps {
  formData: {
    name: string;
    description: string;
    targetUrl: string;
    defaultCommissionRate: number;
  };
  hasCommissionChanged: boolean;
  hasTargetUrlChanged: boolean;
  onFormDataChange: (data: any) => void;
  onTargetUrlChange: (url: string) => void;
  onCommissionRateChange: (rate: number) => void;
}

export const CampaignBasicFields = ({
  formData,
  hasCommissionChanged,
  hasTargetUrlChanged,
  onFormDataChange,
  onTargetUrlChange,
  onCommissionRateChange,
}: CampaignBasicFieldsProps) => {
  return (
    <>
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
            onChange={(e) => onCommissionRateChange(parseFloat(e.target.value))}
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
          onChange={(e) => onTargetUrlChange(e.target.value)}
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
    </>
  );
};
