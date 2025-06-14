
import { useCampaigns } from '@/hooks/useCampaigns';
import { useToast } from '@/hooks/use-toast';
import { Campaign } from '@/types';

export const useCampaignFormHandlers = (
  campaign: Campaign,
  formData: any,
  initialTargetUrl: string,
  onFormDataChange: (data: any) => void,
  showConfirmDialog: (title: string, description: string, action: () => void, confirmText?: string, variant?: 'warning' | 'danger') => void
) => {
  const { updateCampaign } = useCampaigns();
  const { toast } = useToast();

  const handleCriticalChange = (
    field: string,
    value: any,
    title: string,
    description: string,
    confirmText?: string,
    variant?: 'warning' | 'danger'
  ) => {
    showConfirmDialog(
      title,
      description,
      () => onFormDataChange({ ...formData, [field]: value }),
      confirmText,
      variant
    );
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

  const saveStatusChange = async (isActive: boolean) => {
    try {
      console.log('🔄 Sauvegarde du statut:', { campaignId: campaign.id, isActive });
      
      await updateCampaign(campaign.id, { isActive });
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
      
      onFormDataChange({ ...formData, isActive: campaign.isActive });
    }
  };

  return {
    handleTargetUrlChange,
    handleCommissionRateChange,
    saveStatusChange,
  };
};
