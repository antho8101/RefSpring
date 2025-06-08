
import { useState, useEffect } from 'react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useToast } from '@/hooks/use-toast';
import { Campaign } from '@/types';

interface FormData {
  name: string;
  description: string;
  targetUrl: string;
  isActive: boolean;
  defaultCommissionRate: number;
}

export const useCampaignSettingsDialog = (campaign: Campaign) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletionDialogOpen, setDeletionDialogOpen] = useState(false);
  const [initialTargetUrl, setInitialTargetUrl] = useState(campaign.targetUrl || '');
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<FormData>({
    name: campaign.name,
    description: campaign.description || '',
    targetUrl: campaign.targetUrl || '',
    isActive: campaign.isActive,
    defaultCommissionRate: campaign.defaultCommissionRate,
  });

  const { updateCampaign, deleteCampaign } = useCampaigns();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      const targetUrl = campaign.targetUrl || '';
      setInitialTargetUrl(targetUrl);
      setFormData({
        name: campaign.name,
        description: campaign.description || '',
        targetUrl,
        isActive: campaign.isActive,
        defaultCommissionRate: campaign.defaultCommissionRate,
      });
    }
  }, [open, campaign]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateCampaign(campaign.id, formData);
      toast({
        title: "✅ Parfait !",
        description: "Votre campagne a été mise à jour avec succès ! 🚀",
      });
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "❌ Oups !",
        description: error.message || "Impossible de mettre à jour la campagne. Réessayez dans un moment ! 🔄",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async () => {
    try {
      await deleteCampaign(campaign.id);
      console.log('✅ Campagne supprimée avec succès:', campaign.id);
    } catch (error) {
      console.error('❌ Erreur suppression campagne:', error);
      throw error;
    }
  };

  const handleDeleteClick = () => {
    console.log('🗑️ SECURITY - Delete button clicked for campaign:', campaign.id);
    setOpen(false);
    setDeletionDialogOpen(true);
  };

  const handlePaymentMethodChange = () => {
    toast({
      title: "🚧 Bientôt disponible !",
      description: "Cette super fonctionnalité arrive très prochainement ! Restez connecté 😉",
    });
  };

  return {
    open,
    setOpen,
    loading,
    deletionDialogOpen,
    setDeletionDialogOpen,
    initialTargetUrl,
    activeTab,
    setActiveTab,
    formData,
    setFormData,
    handleSubmit,
    handleDeleteCampaign,
    handleDeleteClick,
    handlePaymentMethodChange,
  };
};
