
import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, CreditCard, Loader2 } from 'lucide-react';
import { useCampaignFormSimple } from '@/hooks/useCampaignFormSimple';
import { CampaignFormFields } from '@/components/CampaignFormFields';
import { CampaignSuccessModal } from '@/components/CampaignSuccessModal';
import { ConfettiCelebration } from '@/components/ConfettiCelebration';

interface CreateCampaignDialogSimpleProps {
  children?: ReactNode;
}

export const CreateCampaignDialogSimple = ({ children }: CreateCampaignDialogSimpleProps) => {
  const [open, setOpen] = useState(false);
  
  const {
    formData,
    loading,
    showSuccessModal,
    createdCampaign,
    updateFormData,
    resetForm,
    handleSubmit,
    handleSuccessModalClose,
  } = useCampaignFormSimple();

  console.log('🎯 SIMPLE: État dialog:', { open, showSuccessModal, createdCampaign: !!createdCampaign });

  const resetDialog = () => {
    resetForm();
    setOpen(false);
  };

  const handleSuccessClose = () => {
    handleSuccessModalClose();
    setOpen(false);
  };

  return (
    <>
      {/* Confettis */}
      <ConfettiCelebration trigger={showSuccessModal} />

      <Dialog open={open} onOpenChange={setOpen}>
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
                disabled={loading}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Créer la campagne
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modale de succès simple */}
      {showSuccessModal && createdCampaign && (
        <CampaignSuccessModal
          open={showSuccessModal}
          onOpenChange={handleSuccessClose}
          campaignId={createdCampaign.id}
          campaignName={createdCampaign.name}
        />
      )}
    </>
  );
};
