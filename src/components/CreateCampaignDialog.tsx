
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useStripePayment } from '@/hooks/useStripePayment';
import { useToast } from '@/hooks/use-toast';
import { Plus, CreditCard } from 'lucide-react';
import { CampaignSuccessModal } from '@/components/CampaignSuccessModal';

export const CreateCampaignDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetUrl: '',
    isActive: true,
  });
  
  const { createCampaign } = useCampaigns();
  const { setupPaymentForCampaign, loading: paymentLoading } = useStripePayment();
  const { toast } = useToast();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🎯 Création de la campagne en mode draft...');
      
      // Créer la campagne en mode draft
      const campaignId = await createCampaign({
        ...formData,
        isDraft: true,
        paymentConfigured: false,
      });
      
      console.log('✅ Campagne draft créée:', campaignId);
      
      // Rediriger directement vers Stripe pour la configuration de paiement
      await setupPaymentForCampaign(campaignId, formData.name);
      
    } catch (error: any) {
      console.error('❌ Erreur création campagne:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la campagne",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetDialog = () => {
    setFormData({ name: '', description: '', targetUrl: '', isActive: true });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetDialog();
      else setOpen(true);
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Campagne
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle campagne</DialogTitle>
          <DialogDescription>
            Configurez une nouvelle campagne d'affiliation
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la campagne</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Vente Produit A"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la campagne..."
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
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Campagne active</Label>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={resetDialog}
              disabled={loading || paymentLoading}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading || paymentLoading}
              className="flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              {loading || paymentLoading ? 'Configuration...' : 'Mode de paiement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
