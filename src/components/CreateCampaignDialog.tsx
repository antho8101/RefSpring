
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, CreditCard } from 'lucide-react';
import { useCampaignForm } from '@/hooks/useCampaignForm';
import { CampaignFormFields } from '@/components/CampaignFormFields';

export const CreateCampaignDialog = () => {
  const [open, setOpen] = useState(false);
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

        <form onSubmit={handleSubmit}>
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
              <CreditCard className="h-4 w-4" />
              {loading || paymentLoading ? 'Configuration...' : 'Mode de paiement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
