
import { useState, ReactNode, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, CreditCard, Loader2 } from 'lucide-react';
import { useCampaignForm } from '@/hooks/useCampaignForm';
import { CampaignFormFields } from '@/components/CampaignFormFields';
import { PaymentMethodSelector } from '@/components/PaymentMethodSelector';
import { ConfettiCelebration } from '@/components/ConfettiCelebration';
import { CampaignSuccessModal } from '@/components/CampaignSuccessModal';
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
    showPaymentSelector,
    paymentMethods,
    paymentMethodsLoading,
    showConfetti,
    showSuccessModal,
    createdCampaign,
    updateFormData,
    resetForm,
    handleSubmit,
    handleCardSelection,
    handleAddNewCard,
    setShowPaymentSelector,
    setShowConfetti,
    setShowSuccessModal,
    triggerSuccessModal,
  } = useCampaignForm();

  // Logger les changements d'état
  useEffect(() => {
    console.log('🔥 FINAL: CreateCampaignDialog - État mis à jour:', {
      showSuccessModal,
      createdCampaign,
      showPaymentSelector,
      showConfetti,
      open
    });
  }, [showSuccessModal, createdCampaign, showPaymentSelector, showConfetti, open]);

  const resetDialog = () => {
    resetForm();
    setOpen(false);
  };

  const onSubmit = async (e: React.FormEvent) => {
    try {
      const result = await handleSubmit(e);
      
      // 🔥 CORRECTION: Gérer le cas où on a créé une campagne directement
      if (result?.success && result?.shouldShowModal) {
        console.log('🔥 CORRECTION: Campagne créée directement, déclenchement modale de succès');
        triggerSuccessModal(result.campaignId, result.campaignName);
        // Ne pas fermer la modale principale pour que la modale de succès s'affiche par-dessus
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création de la campagne",
        variant: "destructive",
      });
    }
  };

  const handleCardSelectionWrapper = async (cardId: string) => {
    console.log('🔥 FINAL: handleCardSelectionWrapper appelé avec:', cardId);
    const result = await handleCardSelection(cardId);
    console.log('🔥 FINAL: Résultat de handleCardSelection:', result);
    
    // Si le résultat indique de garder la modale principale ouverte, ne pas la fermer
    if (result?.keepMainModalOpen) {
      console.log('🔥 FINAL: Modale principale gardée ouverte pour afficher la modale de succès');
      // Ne pas faire setOpen(false) ici !
      return;
    }
    
    if (result?.success) {
      console.log('🔥 FINAL: Succès détecté, la modale de succès devrait s\'afficher automatiquement');
    }
  };

  const handleSuccessModalClose = () => {
    console.log('🔥 FINAL: handleSuccessModalClose appelé');
    
    // Fermer tout et reset
    setShowSuccessModal(false);
    setShowConfetti(false);
    resetForm();
    setOpen(false);
  };

  // 🔥 FINAL: Empêcher la fermeture si la modale de succès est visible
  const handleDialogOpenChange = (isOpen: boolean) => {
    console.log('🔥 FINAL: onOpenChange appelé avec:', isOpen, 'showSuccessModal:', showSuccessModal);
    
    if (!isOpen && showSuccessModal) {
      console.log('🔥 FINAL: Empêcher fermeture car modale de succès active');
      return; // Ne pas fermer si la modale de succès est active
    }
    
    setOpen(isOpen);
    if (!isOpen) {
      resetDialog();
    }
  };

  return (
    <>
      {/* Confettis */}
      <ConfettiCelebration 
        trigger={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
      
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
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
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                {loading || paymentLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Configuration...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Continuer
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <PaymentMethodSelector
        open={showPaymentSelector}
        onOpenChange={setShowPaymentSelector}
        paymentMethods={paymentMethods}
        onSelectCard={handleCardSelectionWrapper}
        onAddNewCard={handleAddNewCard}
        loading={loading || paymentLoading}
      />

      {/* 🔥 FINAL: Modale de succès avec logs détaillés */}
      {(() => {
        console.log('🔥 FINAL: Rendu conditionnel - createdCampaign:', createdCampaign, 'showSuccessModal:', showSuccessModal);
        
        if (createdCampaign && showSuccessModal) {
          console.log('🔥 FINAL: Conditions remplies - rendu de CampaignSuccessModal');
          return (
            <CampaignSuccessModal
              open={showSuccessModal}
              onOpenChange={handleSuccessModalClose}
              campaignId={createdCampaign.id}
              campaignName={createdCampaign.name}
            />
          );
        } else {
          console.log('🔥 FINAL: Conditions NON remplies - PAS de rendu de CampaignSuccessModal');
          return null;
        }
      })()}
    </>
  );
};
