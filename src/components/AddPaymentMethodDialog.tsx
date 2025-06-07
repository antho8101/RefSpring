
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useStripePayment } from '@/hooks/useStripePayment';
import { useToast } from '@/hooks/use-toast';

interface AddPaymentMethodDialogProps {
  onPaymentMethodAdded?: () => void;
}

export const AddPaymentMethodDialog = ({ onPaymentMethodAdded }: AddPaymentMethodDialogProps) => {
  const [open, setOpen] = useState(false);
  const { setupPaymentForCampaign, loading } = useStripePayment();
  const { toast } = useToast();

  const handleAddPaymentMethod = async () => {
    try {
      // Utiliser le système existant pour ajouter une carte
      // Ici on simule une campagne temporaire pour la configuration de paiement
      await setupPaymentForCampaign('temp_payment_method', 'Configuration carte bancaire');
      
      toast({
        title: "Redirection vers Stripe",
        description: "Vous allez être redirigé vers Stripe pour ajouter votre carte",
      });
      
      setOpen(false);
      onPaymentMethodAdded?.();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la carte bancaire",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter une carte
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter une carte bancaire</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Vous allez être redirigé vers Stripe pour ajouter une nouvelle carte bancaire de manière sécurisée.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddPaymentMethod} disabled={loading}>
              {loading ? 'Redirection...' : 'Continuer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
