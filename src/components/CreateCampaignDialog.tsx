
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
    releaseSuccessModalLock,
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
    
    // 🔥 LIBÉRER les verrous AVANT de fermer
    releaseSuccessModalLock();
    
    // Fermer tout et reset
    setShowSuccessModal(false);
    setShowConfetti(false);
    resetForm();
    setOpen(false);
  };

  // 🔥 CORRECTION ABSOLUE: NE JAMAIS FERMER AUTOMATIQUEMENT si success modal est visible
  const handleDialogOpenChange = (isOpen: boolean) => {
    console.log('🔄 DIALOG: handleDialogOpenChange appelé avec:', isOpen, 'showSuccessModal:', showSuccessModal);
    
    // 🔥 BLOCAGE ABSOLU si la modale de succès est visible OU si createdCampaign existe
    if (!isOpen && (showSuccessModal || createdCampaign)) {
      console.log('🚫 DIALOG: Fermeture ABSOLUMENT BLOQUÉE car success modal actif ou campagne créée');
      return; // EMPÊCHER TOTALEMENT la fermeture
    }
    
    console.log('✅ DIALOG: Changement autorisé vers:', isOpen);
    setOpen(isOpen);
  };

  // 🔥 CONDITIONS RENFORCÉES pour la modale de succès
  const shouldShowSuccessModal = Boolean(
    createdCampaign && 
    createdCampaign.id && 
    createdCampaign.name && 
    showSuccessModal
  );
  
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

      {/* 🎭 MODALE DE SUCCÈS avec conditions ABSOLUES */}
      {shouldShowSuccessModal && (
        <CampaignSuccessModal
          open={true}
          onOpenChange={handleSuccessModalClose}
          campaignId={createdCampaign!.id}
          campaignName={createdCampaign!.name}
        />
      )}
      
      {/* Debug info en mode dev - VERSION AMÉLIORÉE */}
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
          border: '3px solid red',
          borderRadius: '8px',
          maxWidth: '350px'
        }}>
          <div style={{ marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#ff6b6b' }}>
            🚨 DEBUG SUCCESS MODAL 🚨
          </div>
          <div style={{ color: showSuccessModal ? '#4ecdc4' : '#ff6b6b' }}>
            🎭 showSuccessModal: {String(showSuccessModal)}
          </div>
          <div style={{ color: createdCampaign ? '#4ecdc4' : '#ff6b6b' }}>
            🎯 createdCampaign: {createdCampaign ? `${createdCampaign.name} (${createdCampaign.id})` : 'null'}
          </div>
          <div style={{ color: shouldShowSuccessModal ? '#4ecdc4' : '#ff6b6b' }}>
            ✅ shouldShow: {String(shouldShowSuccessModal)}
          </div>
          <div style={{ color: open ? '#4ecdc4' : '#ff6b6b' }}>
            🔄 open: {String(open)}
          </div>
          <div style={{ color: showPaymentSelector ? '#4ecdc4' : '#ff6b6b' }}>
            💳 paymentSelector: {String(showPaymentSelector)}
          </div>
        </div>
      )}
    </>
  );
};
