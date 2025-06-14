
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Campaign } from '@/types';

interface CampaignStatusSectionProps {
  campaign: Campaign;
  formData: {
    isActive: boolean;
  };
  hasStatusChanged: boolean;
  onStatusChange: (isActive: boolean) => void;
  paymentMethodsLoading: boolean;
}

export const CampaignStatusSection = ({
  campaign,
  formData,
  hasStatusChanged,
  onStatusChange,
  paymentMethodsLoading,
}: CampaignStatusSectionProps) => {
  return (
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
        onCheckedChange={onStatusChange}
        disabled={paymentMethodsLoading}
      />
    </div>
  );
};
