
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
  } = useCampaignForm();

  // Logger TOUS les changements d'état pour débugger
  useEffect(() => {
    console.log('🔥 DIALOG: État complet mis à jour:', {
      open,
      showSuccessModal,
      createdCampaign,
      showPaymentSelector,
      showConfetti,
      loading,
      paymentLoading
    });
  }, [open, showSuccessModal, createdCampaign, showPaymentSelector, showConfetti, loading, paymentLoading]);

  const resetDialog = () => {
    console.log('🔄 DIALOG: resetDialog appelé');
    resetForm();
    setOpen(false);
  };

  const onSubmit = async (e: React.FormEvent) => {
    try {
      console.log('📝 DIALOG: onSubmit appelé');
      await handleSubmit(e);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création de la campagne",
        variant: "destructive",
      });
    }
  };

  const handleCardSelectionWrapper = async (cardId: string) => {
    console.log('💳 DIALOG: handleCardSelectionWrapper appelé avec:', cardId);
    console.log('💳 DIALOG: État AVANT sélection carte:', { showSuccessModal, createdCampaign });
    
    const result = await handleCardSelection(cardId);
    console.log('💳 DIALOG: Résultat handleCardSelection:', result);
    
    // Attendre un peu pour que les états se propagent
    setTimeout(() => {
      console.log('💳 DIALOG: État APRÈS sélection carte (500ms):', { showSuccessModal, createdCampaign });
    }, 500);
    
    if (result?.success) {
      console.log('🎉 DIALOG: Succès confirmé, modale de succès devrait être visible');
    }
  };

  const handleSuccessModalClose = () => {
    console.log('🔄 DIALOG: handleSuccessModalClose appelé');
    
    // Fermer tout et reset
    setShowSuccessModal(false);
    setShowConfetti(false);
    resetForm();
    setOpen(false);
  };

  // 🔥 EMPÊCHER LA FERMETURE si la modale de succès est visible
  const handleDialogOpenChange = (isOpen: boolean) => {
    console.log('🔄 DIALOG: handleDialogOpenChange appelé avec:', isOpen, 'showSuccessModal:', showSuccessModal);
    
    if (!isOpen && showSuccessModal) {
      console.log('🚫 DIALOG: Fermeture bloquée car modale de succès active');
      return; // BLOQUER la fermeture
    }
    
    console.log('✅ DIALOG: Changement autorisé vers:', isOpen);
    setOpen(isOpen);
    if (!isOpen) {
      resetDialog();
    }
  };

  // Vérification des conditions de rendu de la modale de succès
  const shouldShowSuccessModal = Boolean(createdCampaign && showSuccessModal);
  console.log('🎭 DIALOG: shouldShowSuccessModal:', shouldShowSuccessModal, { createdCampaign, showSuccessModal });

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

      {/* 🎭 MODALE DE SUCCÈS avec conditions renforcées */}
      {shouldShowSuccessModal && (
        <CampaignSuccessModal
          open={true}
          onOpenChange={handleSuccessModalClose}
          campaignId={createdCampaign!.id}
          campaignName={createdCampaign!.name}
        />
      )}
      
      {/* Debug info en mode dev */}
      {import.meta.env.DEV && (
        <div style={{ 
          position: 'fixed', 
          bottom: '10px', 
          right: '10px', 
          background: 'black', 
          color: 'white', 
          padding: '10px', 
          fontSize: '12px',
          zIndex: 9999
        }}>
          <div>showSuccessModal: {String(showSuccessModal)}</div>
          <div>createdCampaign: {createdCampaign ? createdCampaign.name : 'null'}</div>
          <div>shouldShow: {String(shouldShowSuccessModal)}</div>
        </div>
      )}
    </>
  );
};
