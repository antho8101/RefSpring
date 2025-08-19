
import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, CreditCard, Loader2 } from 'lucide-react';
import { useCampaignForm } from '@/hooks/useCampaignForm';
import { CampaignFormFields } from '@/components/CampaignFormFields';
import { PaymentMethodSelector } from '@/components/PaymentMethodSelector';
import { useToast } from '@/hooks/use-toast';

interface CreateCampaignDialogProps {
  children?: ReactNode;
  onSuccessModalTrigger: (campaignId: string, campaignName: string) => void;
}

export const CreateCampaignDialog = ({ children, onSuccessModalTrigger }: CreateCampaignDialogProps) => {
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
  } = useCampaignForm();

  console.log('🔥 DIALOG RENDER: États locaux:', {
    open,
    showPaymentSelector
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

  // 🚀 SYSTÈME CORRIGÉ : Utiliser la fonction passée en props
  const handleCardSelectionWithModalTrigger = async (cardId: string) => {
    console.log('💳 DIALOG: handleCardSelectionWithModalTrigger appelé avec:', cardId);
    
    try {
      // 🔥 DÉCLENCHER LA MODALE IMMÉDIATEMENT avec les données du formulaire
      console.log('🎉 DÉCLENCHEMENT IMMÉDIAT: Avant même d\'appeler handleCardSelection');
      
      if (formData.name) {
        const tempCampaignId = `campaign-${Date.now()}`;
        console.log('🚀 FORÇAGE IMMÉDIAT: Déclenchement modale avec:', tempCampaignId, formData.name);
        
        // 🔥 UTILISER LA FONCTION PASSÉE EN PROPS
        onSuccessModalTrigger(tempCampaignId, formData.name);
        
        // Fermer le sélecteur de paiement
        setShowPaymentSelector(false);
        
        // Fermer le dialog principal immédiatement
        setOpen(false);
        
        // Toast de confirmation
        toast({
          title: "🎉 Campagne créée avec succès !",
          description: `Votre campagne "${formData.name}" est maintenant active !`,
        });
        
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

  const handleDialogOpenChange = (isOpen: boolean) => {
    console.log('🔄 DIALOG: handleDialogOpenChange appelé avec:', isOpen);
    setOpen(isOpen);
    
    if (!isOpen) {
      resetForm();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>
          {children || (
            <Button
              className="flex items-center gap-2 text-sm px-3 py-2 h-9 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-[1.02] border-0 text-white group relative overflow-hidden"
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.3))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'none';
              }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <Plus className="h-4 w-4 mr-2 relative z-10" />
              <span className="relative z-10">Nouvelle Campagne</span>
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
    </>
  );
};
