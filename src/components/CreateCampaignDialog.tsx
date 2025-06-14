
import { useState, ReactNode } from 'react';
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

  // 🐛 DEBUG: Logger les changements d'état
  console.log('🐛 CreateCampaignDialog - État actuel:', {
    showSuccessModal,
    createdCampaign,
    showPaymentSelector,
    showConfetti,
    open
  });

  const resetDialog = () => {
    resetForm();
    setOpen(false);
  };

  const onSubmit = async (e: React.FormEvent) => {
    try {
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
    console.log('🐛 CreateCampaignDialog - handleCardSelectionWrapper appelé avec:', cardId);
    const result = await handleCardSelection(cardId);
    console.log('🐛 CreateCampaignDialog - Résultat de handleCardSelection:', result);
    
    // 🚨 IMPORTANT : Ne jamais fermer la modale principale si on a keepMainModalOpen
    if (result?.success && result?.keepMainModalOpen) {
      console.log('🐛 CreateCampaignDialog - Modale principale gardée ouverte pour afficher la modale de succès');
      // Ne rien faire, laisser la modale principale ouverte
    } else if (result?.success) {
      console.log('🐛 CreateCampaignDialog - Fermeture de la modale principale...');
      setOpen(false);
    }
  };

  const handleSuccessModalClose = () => {
    console.log('🐛 CreateCampaignDialog - handleSuccessModalClose appelé');
    
    // 🚨 ÉTAPE 1 : Fermer la modale de succès
    setShowSuccessModal(false);
    
    // 🚨 ÉTAPE 2 : Arrêter les confettis
    setShowConfetti(false);
    
    // 🚨 ÉTAPE 3 : Attendre un peu puis reset et fermer
    setTimeout(() => {
      resetForm();
      setOpen(false);
    }, 100);
  };

  // 🔧 LOGIQUE CRITIQUE : Empêcher la fermeture prématurée de la modale
  const handleDialogOpenChange = (isOpen: boolean) => {
    console.log('🐛 CreateCampaignDialog - onOpenChange appelé avec:', isOpen, 'showSuccessModal:', showSuccessModal);
    
    if (!isOpen) {
      // 🚨 PROTECTION RENFORCÉE : Vérifier si une modale de succès DOIT s'afficher
      if (showSuccessModal || createdCampaign) {
        console.log('🐛 CreateCampaignDialog - Fermeture bloquée car modale de succès affichée ou campagne créée');
        // FORCER la modale à rester ouverte
        setTimeout(() => setOpen(true), 0);
        return;
      }
      console.log('🐛 CreateCampaignDialog - Fermeture autorisée');
      resetDialog();
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      {/* Confettis pour la création avec carte existante */}
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

      {/* 📋 Modale de succès avec protection contre la fermeture prématurée */}
      {createdCampaign && showSuccessModal && (
        <>
          {console.log('🐛 CreateCampaignDialog - Rendu de CampaignSuccessModal avec:', {
            open: showSuccessModal,
            campaignId: createdCampaign.id,
            campaignName: createdCampaign.name
          })}
          <CampaignSuccessModal
            open={showSuccessModal}
            onOpenChange={handleSuccessModalClose}
            campaignId={createdCampaign.id}
            campaignName={createdCampaign.name}
          />
        </>
      )}
    </>
  );
};
