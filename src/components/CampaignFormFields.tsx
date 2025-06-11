
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { CampaignFormData } from '@/hooks/useCampaignForm';

interface CampaignFormFieldsProps {
  formData: CampaignFormData;
  onUpdateFormData: (updates: Partial<CampaignFormData>) => void;
}

export const CampaignFormFields = ({ formData, onUpdateFormData }: CampaignFormFieldsProps) => {
  const handleTargetUrlChange = (value: string) => {
    let normalizedUrl = value.trim();
    
    // Si l'URL n'est pas vide et ne commence pas par http:// ou https://
    if (normalizedUrl && !normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    onUpdateFormData({ targetUrl: normalizedUrl });
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom de la campagne</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onUpdateFormData({ name: e.target.value })}
          placeholder="Ex: Vente Produit A"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onUpdateFormData({ description: e.target.value })}
          placeholder="Description de la campagne..."
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="targetUrl">URL de destination</Label>
        <Input
          id="targetUrl"
          value={formData.targetUrl}
          onChange={(e) => handleTargetUrlChange(e.target.value)}
          placeholder="nomdusite.com/produit"
          required
        />
        <p className="text-xs text-slate-500">
          Vous pouvez taper juste "nomdusite.com" - https:// sera ajouté automatiquement
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => onUpdateFormData({ isActive: checked })}
        />
        <Label htmlFor="isActive">Campagne active</Label>
      </div>
    </div>
  );
};
