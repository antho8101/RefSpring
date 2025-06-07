
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Settings, Trash2 } from 'lucide-react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useToast } from '@/hooks/use-toast';
import { Campaign } from '@/types';

interface CampaignSettingsDialogProps {
  campaign: Campaign;
}

export const CampaignSettingsDialog = ({ campaign }: CampaignSettingsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [formData, setFormData] = useState({
    name: campaign.name,
    description: campaign.description || '',
    isActive: campaign.isActive,
    defaultCommissionRate: campaign.defaultCommissionRate,
  });

  const { updateCampaign, deleteCampaign } = useCampaigns();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setFormData({
        name: campaign.name,
        description: campaign.description || '',
        isActive: campaign.isActive,
        defaultCommissionRate: campaign.defaultCommissionRate,
      });
      setDeleteMode(false);
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

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteCampaign(campaign.id);
      toast({
        title: "Campagne supprimée",
        description: "La campagne a été supprimée définitivement.",
      });
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la campagne",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
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
            {deleteMode ? 'Supprimer la campagne' : 'Paramètres de la campagne'}
          </DialogTitle>
          <DialogDescription>
            {deleteMode 
              ? 'Cette action est irréversible. Toutes les données associées seront perdues.'
              : 'Modifiez les paramètres de votre campagne d\'affiliation.'
            }
          </DialogDescription>
        </DialogHeader>

        {deleteMode ? (
          <div className="py-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800">
                Êtes-vous sûr de vouloir supprimer la campagne <strong>"{campaign.name}"</strong> ? 
                Cette action supprimera également tous les affiliés et statistiques associés.
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setDeleteMode(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Suppression...' : 'Supprimer définitivement'}
              </Button>
            </div>
          </div>
        ) : (
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
                onClick={() => setDeleteMode(true)}
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
        )}
      </DialogContent>
    </Dialog>
  );
};
