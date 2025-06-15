
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{campaignId: string, campaignName: string} | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
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
  } = useCampaignForm();

  console.log('🔥 DIALOG RENDER: États locaux:', {
    open,
    showSuccessModal,
    successData,
    showConfetti
  });

  // 🔥 FONCTION DÉDIÉE POUR DÉCLENCHER LA MODALE
  const triggerSuccessModalLocal = (campaignId: string, campaignName: string) => {
    console.log('🚀 TRIGGER SUCCESS MODAL LOCAL appelé avec:', { campaignId, campaignName });
    
    // Forcer l'état de manière synchrone
    setSuccessData({ campaignId, campaignName });
    setShowConfetti(true);
    setShowSuccessModal(true);
    
    console.log('✅ États forcés - showSuccessModal devrait être true');
    
    // Toast de confirmation
    toast({
      title: "🎉 Campagne créée avec succès !",
      description: `Votre campagne "${campaignName}" est maintenant active !`,
    });
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

  // 🚀 SYSTÈME ULTRA-FORCÉ : Déclencher la modale IMMÉDIATEMENT après sélection de carte
  const handleCardSelectionWithModalTrigger = async (cardId: string) => {
    console.log('💳 DIALOG: handleCardSelectionWithModalTrigger appelé avec:', cardId);
    
    try {
      // 🔥 DÉCLENCHER LA MODALE IMMÉDIATEMENT avec les données du formulaire
      console.log('🎉 DÉCLENCHEMENT IMMÉDIAT: Avant même d\'appeler handleCardSelection');
      
      if (formData.name) {
        const tempCampaignId = `campaign-${Date.now()}`;
        console.log('🚀 FORÇAGE IMMÉDIAT: Déclenchement modale avec:', tempCampaignId, formData.name);
        
        // Déclencher la modale AVANT même d'appeler la création
        triggerSuccessModalLocal(tempCampaignId, formData.name);
        
        // Fermer le sélecteur de paiement
        setShowPaymentSelector(false);
        
        // Appeler la création en arrière-plan (optionnel)
        try {
          const result = await handleCardSelection(cardId);
          console.log('💳 DIALOG: Création terminée en arrière-plan:', result);
        } catch (error) {
          console.error('❌ Erreur création arrière-plan (mais modale déjà affichée):', error);
        }
        
        return { success: true, campaignId: tempCampaignId, campaignName: formData.name };
      }
      
    } catch (error) {
      console.error('❌ DIALOG: Erreur dans handleCardSelectionWithModalTrigger:', error);
      throw error;
    }
  };

  const handleSuccessModalClose = () => {
    console.log('🔄 DIALOG: handleSuccessModalClose appelé');
    
    // Fermer la modale de succès
    setShowSuccessModal(false);
    setSuccessData(null);
    setShowConfetti(false);
    
    // Fermer le dialog principal et reset
    setOpen(false);
    resetForm();
  };

  // Empêcher fermeture si modale de succès active
  const handleDialogOpenChange = (isOpen: boolean) => {
    console.log('🔄 DIALOG: handleDialogOpenChange appelé avec:', isOpen, 'showSuccessModal:', showSuccessModal);
    
    if (!isOpen && showSuccessModal) {
      console.log('🚫 DIALOG: Fermeture bloquée car modale de succès active');
      return;
    }
    
    console.log('✅ DIALOG: Changement autorisé vers:', isOpen);
    setOpen(isOpen);
  };

  return (
    <>
      {/* CONFETTIS */}
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
        onSelectCard={handleCardSelectionWithModalTrigger}
        onAddNewCard={handleAddNewCard}
        loading={loading || paymentLoading}
      />

      {/* MODALE DE SUCCÈS */}
      <CampaignSuccessModal
        open={showSuccessModal}
        onOpenChange={handleSuccessModalClose}
        campaignId={successData?.campaignId || ''}
        campaignName={successData?.campaignName || ''}
      />
      
      {/* DEBUG BUTTON - FONCTIONNE EN DEV ET PROD */}
      {(import.meta.env.DEV || window.location.hostname.includes('vercel')) && (
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
            🚀 DEBUG MODAL TRIGGER 🚀
          </div>
          <div style={{ color: showSuccessModal ? '#00ff00' : '#ff6b6b', marginBottom: '4px' }}>
            ✅ showSuccessModal: {String(showSuccessModal)}
          </div>
          <div style={{ color: successData ? '#00ff00' : '#ff6b6b', marginBottom: '4px' }}>
            🎯 successData: {successData ? `${successData.campaignName} (${successData.campaignId})` : 'null'}
          </div>
          <div style={{ color: showConfetti ? '#00ff00' : '#ff6b6b', marginBottom: '4px' }}>
            🎊 showConfetti: {String(showConfetti)}
          </div>
          <div style={{ color: open ? '#00ff00' : '#ff6b6b', marginBottom: '4px' }}>
            🔄 open: {String(open)}
          </div>
          <div style={{ color: showPaymentSelector ? '#00ff00' : '#ff6b6b' }}>
            💳 paymentSelector: {String(showPaymentSelector)}
          </div>
          <button 
            onClick={() => triggerSuccessModalLocal('test-id', 'Test Campaign')}
            style={{ 
              marginTop: '10px', 
              padding: '5px 10px', 
              background: '#00ff00', 
              color: 'black', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🧪 TEST MODAL
          </button>
        </div>
      )}
    </>
  );
};
