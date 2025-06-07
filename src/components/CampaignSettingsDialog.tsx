
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Settings, Trash2, AlertTriangle } from 'lucide-react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useToast } from '@/hooks/use-toast';
import { Campaign } from '@/types';
import { CampaignDeletionDialog } from '@/components/CampaignDeletionDialog';

interface CampaignSettingsDialogProps {
  campaign: Campaign;
}

export const CampaignSettingsDialog = ({ campaign }: CampaignSettingsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletionDialogOpen, setDeletionDialogOpen] = useState(false);
  const [initialTargetUrl, setInitialTargetUrl] = useState(campaign.targetUrl || '');
  const [formData, setFormData] = useState({
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
        title: "Campagne mise à jour",
        description: "Les modifications ont été enregistrées avec succès.",
      });
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour la campagne",
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
    setOpen(false);
    setDeletionDialogOpen(true);
  };

  const hasTargetUrlChanged = formData.targetUrl !== initialTargetUrl;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="hover:scale-105 transition-all shadow-lg backdrop-blur-sm border-slate-300 rounded-2xl">
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Paramètres de la campagne
            </DialogTitle>
            <DialogDescription>
              Modifiez les paramètres de votre campagne d'affiliation.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la campagne</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Programme d'affiliation 2024"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de votre campagne d'affiliation..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetUrl">URL de destination</Label>
                <Input
                  id="targetUrl"
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                  placeholder="https://monsite.com/produit"
                  required
                />
                {hasTargetUrlChanged && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-orange-800 font-medium">Attention - URL modifiée</p>
                      <p className="text-orange-700">
                        N'oubliez pas d'ajouter le script de tracking à la nouvelle page de destination pour continuer à traquer les conversions.
                      </p>
                    </div>
                  </div>
                )}
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
                  onChange={(e) => setFormData({ ...formData, defaultCommissionRate: parseFloat(e.target.value) })}
                  required
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Campagne active</Label>
                  <p className="text-sm text-muted-foreground">
                    Les campagnes inactives n'acceptent plus de nouveaux clics
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </div>
            
            <DialogFooter className="flex justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteClick}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <CampaignDeletionDialog
        campaign={campaign}
        open={deletionDialogOpen}
        onOpenChange={setDeletionDialogOpen}
        onConfirmDeletion={handleDeleteCampaign}
      />
    </>
  );
};
