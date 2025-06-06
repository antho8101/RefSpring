
import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, CreditCard, Loader2 } from 'lucide-react';
import { useCampaignForm } from '@/hooks/useCampaignForm';
import { CampaignFormFields } from '@/components/CampaignFormFields';
import { useToast } from '@/hooks/use-toast';

interface CreateCampaignDialogProps {
  children?: ReactNode;
}

export const CreateCampaignDialog = ({ children }: CreateCampaignDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const {
    formData,
    loading,
    paymentLoading,
    updateFormData,
    resetForm,
    handleSubmit,
  } = useCampaignForm();

  const resetDialog = () => {
    resetForm();
    setOpen(false);
  };

  const onSubmit = async (e: React.FormEvent) => {
    try {
      await handleSubmit(e);
      toast({
        title: "Redirection vers la page de paiement",
        description: "Vous allez être redirigé vers la page de configuration du paiement.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création de la campagne",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetDialog();
      else setOpen(true);
    }}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Campagne
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle campagne</DialogTitle>
          <DialogDescription>
            Configurez une nouvelle campagne d'affiliation
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <CampaignFormFields 
            formData={formData}
            onUpdateFormData={updateFormData}
          />
          
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
              {loading || paymentLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Configuration...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Mode de paiement
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
