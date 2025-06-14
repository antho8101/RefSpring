
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
    updateFormData,
    resetForm,
    handleSubmit,
    handleCardSelection,
    handleAddNewCard,
    setShowPaymentSelector,
    // Nouveaux états pour la modale de succès isolée
    successModalData,
    showConfetti,
    isSuccessModalOpen,
    hideSuccessModal,
  } = useCampaignForm();

  // Logger les changements d'état pour debug
  useEffect(() => {
    console.log('🎭 DIALOG: État mis à jour:', {
      open,
      isSuccessModalOpen,
      successModalData,
      showPaymentSelector,
      showConfetti,
      loading,
      paymentLoading
    });
  }, [open, isSuccessModalOpen, successModalData, showPaymentSelector, showConfetti, loading, paymentLoading]);

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
    
    const result = await handleCardSelection(cardId);
    console.log('💳 DIALOG: Résultat handleCardSelection:', result);
    
    if (result?.success) {
      console.log('🎉 DIALOG: Succès confirmé, modale de succès devrait être visible');
    }
  };

  const handleSuccessModalClose = () => {
    console.log('🔄 DIALOG: handleSuccessModalClose appelé');
    
    // Fermer la modale de succès
    hideSuccessModal();
    
    // Fermer le dialog principal et reset
    setOpen(false);
    resetForm();
  };

  // Empêcher la fermeture si la modale de succès est active
  const handleDialogOpenChange = (isOpen: boolean) => {
    console.log('🔄 DIALOG: handleDialogOpenChange appelé avec:', isOpen, 'isSuccessModalOpen:', isSuccessModalOpen);
    
    if (!isOpen && isSuccessModalOpen) {
      console.log('🚫 DIALOG: Fermeture bloquée car modale de succès active');
      return;
    }
    
    console.log('✅ DIALOG: Changement autorisé vers:', isOpen);
    setOpen(isOpen);
  };

  return (
    <>
      {/* Confettis */}
      <ConfettiCelebration 
        trigger={showConfetti} 
        onComplete={() => {}} 
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
                onClick={() => setOpen(false)}
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

      {/* Modale de succès avec système isolé */}
      {isSuccessModalOpen && successModalData && (
        <CampaignSuccessModal
          open={true}
          onOpenChange={handleSuccessModalClose}
          campaignId={successModalData.campaignId}
          campaignName={successModalData.campaignName}
        />
      )}
      
      {/* Debug info amélioré */}
      {import.meta.env.DEV && (
        <div style={{ 
          position: 'fixed', 
          bottom: '10px', 
          right: '10px', 
          background: 'black', 
          color: 'white', 
          padding: '15px', 
          fontSize: '12px',
          zIndex: 10000,
          border: '3px solid lime',
          borderRadius: '8px',
          maxWidth: '350px'
        }}>
          <div style={{ marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#00ff00' }}>
            🚀 DEBUG SUCCESS MODAL ISOLÉ 🚀
          </div>
          <div style={{ color: isSuccessModalOpen ? '#00ff00' : '#ff6b6b' }}>
            ✅ isSuccessModalOpen: {String(isSuccessModalOpen)}
          </div>
          <div style={{ color: successModalData ? '#00ff00' : '#ff6b6b' }}>
            🎯 successModalData: {successModalData ? `${successModalData.campaignName} (${successModalData.campaignId})` : 'null'}
          </div>
          <div style={{ color: showConfetti ? '#00ff00' : '#ff6b6b' }}>
            🎊 showConfetti: {String(showConfetti)}
          </div>
          <div style={{ color: open ? '#00ff00' : '#ff6b6b' }}>
            🔄 open: {String(open)}
          </div>
          <div style={{ color: showPaymentSelector ? '#00ff00' : '#ff6b6b' }}>
            💳 paymentSelector: {String(showPaymentSelector)}
          </div>
        </div>
      )}
    </>
  );
};
