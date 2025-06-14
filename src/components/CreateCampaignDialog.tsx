
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
    // ✅ SYSTÈME ISOLÉ
    successModalData,
    showConfetti,
    isSuccessModalOpen,
    hideSuccessModal,
  } = useCampaignForm();

  // Logger CHAQUE RENDER avec détails complets
  useEffect(() => {
    console.log('🔥 DIALOG RENDER: États détaillés:', {
      open,
      isSuccessModalOpen,
      successModalData,
      showPaymentSelector,
      showConfetti,
      'successModalData?.campaignId': successModalData?.campaignId,
      'successModalData?.campaignName': successModalData?.campaignName,
    });
  });

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
      
      // Forcer un petit délai pour s'assurer que les états sont mis à jour
      setTimeout(() => {
        console.log('🔍 DIALOG: Vérification post-succès:', {
          isSuccessModalOpen,
          successModalData,
          'typeof successModalData': typeof successModalData
        });
      }, 100);
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

  // ✅ EMPÊCHER FERMETURE SI MODALE DE SUCCÈS ACTIVE
  const handleDialogOpenChange = (isOpen: boolean) => {
    console.log('🔄 DIALOG: handleDialogOpenChange appelé avec:', isOpen, 'isSuccessModalOpen:', isSuccessModalOpen);
    
    if (!isOpen && isSuccessModalOpen) {
      console.log('🚫 DIALOG: Fermeture bloquée car modale de succès active');
      return;
    }
    
    console.log('✅ DIALOG: Changement autorisé vers:', isOpen);
    setOpen(isOpen);
  };

  // Log spécial pour le rendu de la modale
  console.log('🎭 DIALOG: Condition de rendu modale:', {
    'isSuccessModalOpen': isSuccessModalOpen,
    'successModalData': !!successModalData,
    'successModalData?.campaignId': successModalData?.campaignId,
    'shouldRender': isSuccessModalOpen && !!successModalData
  });

  return (
    <>
      {/* ✅ CONFETTIS AVEC SYSTÈME ISOLÉ */}
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

      {/* ✅ MODALE DE SUCCÈS - RENDU SIMPLIFIÉ SANS CONDITIONS COMPLEXES */}
      <CampaignSuccessModal
        open={isSuccessModalOpen}
        onOpenChange={handleSuccessModalClose}
        campaignId={successModalData?.campaignId || ''}
        campaignName={successModalData?.campaignName || ''}
      />
      
      {/* ✅ DEBUG INFO MAXIMUM */}
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
          maxWidth: '400px'
        }}>
          <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#00ff00' }}>
            🚀 DEBUG COMPLET V3 🚀
          </div>
          <div style={{ color: isSuccessModalOpen ? '#00ff00' : '#ff6b6b', marginBottom: '4px' }}>
            ✅ isSuccessModalOpen: {String(isSuccessModalOpen)}
          </div>
          <div style={{ color: successModalData ? '#00ff00' : '#ff6b6b', marginBottom: '4px' }}>
            🎯 successModalData: {successModalData ? `${successModalData.campaignName} (${successModalData.campaignId})` : 'null'}
          </div>
          <div style={{ color: showConfetti ? '#00ff00' : '#ff6b6b', marginBottom: '4px' }}>
            🎊 showConfetti: {String(showConfetti)}
          </div>
          <div style={{ color: open ? '#00ff00' : '#ff6b6b', marginBottom: '4px' }}>
            🔄 open: {String(open)}
          </div>
          <div style={{ color: showPaymentSelector ? '#00ff00' : '#ff6b6b', marginBottom: '4px' }}>
            💳 paymentSelector: {String(showPaymentSelector)}
          </div>
          <div style={{ color: '#ffff00', marginBottom: '4px' }}>
            📊 shouldRender: {String(isSuccessModalOpen && !!successModalData)}
          </div>
          <div style={{ color: '#ffff00' }}>
            🔍 typeof successModalData: {typeof successModalData}
          </div>
        </div>
      )}
    </>
  );
};
