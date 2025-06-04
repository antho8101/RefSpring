
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
  const [step, setStep] = useState<'form' | 'payment'>('form');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [createdCampaign, setCreatedCampaign] = useState<{ id: string; name: string } | null>(null);
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
      
      setCreatedCampaign({ id: campaignId, name: formData.name });
      setStep('payment');
      
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

  const handlePaymentSetup = async () => {
    if (!createdCampaign) return;

    try {
      console.log('🔄 Configuration du paiement pour:', createdCampaign.id);
      
      // Rediriger vers Stripe pour la configuration de paiement
      await setupPaymentForCampaign(createdCampaign.id, createdCampaign.name);
      
    } catch (error: any) {
      console.error('❌ Erreur configuration paiement:', error);
      toast({
        title: "Erreur de paiement",
        description: error.message || "Impossible de configurer le paiement",
        variant: "destructive",
      });
    }
  };

  const resetDialog = () => {
    setStep('form');
    setCreatedCampaign(null);
    setFormData({ name: '', description: '', targetUrl: '', isActive: true });
    setOpen(false);
  };

  return (
    <>
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
            <DialogTitle>
              {step === 'form' ? 'Créer une nouvelle campagne' : 'Configuration du paiement'}
            </DialogTitle>
            <DialogDescription>
              {step === 'form' 
                ? 'Configurez une nouvelle campagne d\'affiliation'
                : 'Configurez votre mode de paiement pour cette campagne'
              }
            </DialogDescription>
          </DialogHeader>

          {step === 'form' ? (
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
              
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Création...' : 'Continuer'}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="py-4">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="w-8 h-8 text-blue-600" />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Configuration du paiement</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Pour finaliser la création de votre campagne "{createdCampaign?.name}", 
                    vous devez configurer un mode de paiement.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Nous facturerons 2,5% de votre CA mensuel (minimum 20€) le 5 de chaque mois.
                  </p>
                </div>
                
                <Button 
                  onClick={handlePaymentSetup}
                  disabled={paymentLoading}
                  className="w-full"
                >
                  {paymentLoading ? 'Redirection...' : 'Configurer le paiement'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={resetDialog}
                  className="w-full"
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {createdCampaign && step === 'form' && (
        <CampaignSuccessModal
          open={successModalOpen}
          onOpenChange={setSuccessModalOpen}
          campaignId={createdCampaign.id}
          campaignName={createdCampaign.name}
        />
      )}
    </>
  );
};
