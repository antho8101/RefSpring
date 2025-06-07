
import { useState } from 'react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useStripePayment } from '@/hooks/useStripePayment';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import confetti from 'canvas-confetti';

export interface CampaignFormData {
  name: string;
  description: string;
  targetUrl: string;
  isActive: boolean;
}

const triggerSuccessConfetti = () => {
  // Confettis qui partent des deux côtés
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    const particleCount = 50 * (timeLeft / duration);

    // Confettis du côté gauche
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });

    // Confettis du côté droit
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);

  // Explosion centrale pour l'effet "YAY!"
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']
    });
  }, 500);
};

export const useCampaignForm = () => {
  const [loading, setLoading] = useState(false);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [pendingCampaignData, setPendingCampaignData] = useState<CampaignFormData | null>(null);
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    targetUrl: '',
    isActive: true,
  });
  
  const { user } = useAuth();
  const { createCampaign } = useCampaigns();
  const { setupPaymentForCampaign, loading: paymentLoading } = useStripePayment();
  const { paymentMethods, loading: paymentMethodsLoading, refreshPaymentMethods } = usePaymentMethods();
  const { toast } = useToast();

  const updateFormData = (updates: Partial<CampaignFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', targetUrl: '', isActive: true });
    setPendingCampaignData(null);
    setShowPaymentSelector(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🎯 Début du processus de création de campagne...');
      
      if (!formData.name) {
        throw new Error('Le nom de la campagne est requis');
      }
      
      if (!formData.targetUrl) {
        throw new Error('L\'URL de destination est requise');
      }

      // Vérifier s'il y a des cartes existantes
      await refreshPaymentMethods();
      
      if (paymentMethods.length > 0) {
        console.log('💳 Cartes existantes trouvées, affichage du sélecteur');
        setPendingCampaignData(formData);
        setShowPaymentSelector(true);
        setLoading(false);
        return;
      }

      // Pas de cartes existantes, créer la campagne et rediriger vers Stripe
      await createCampaignWithPayment(formData);
      
    } catch (error: any) {
      console.error('❌ Erreur création campagne:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la campagne",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const createCampaignWithPayment = async (campaignData: CampaignFormData) => {
    console.log('🎯 Création de la campagne avec paiement...');
    
    // Créer la campagne
    const campaignId = await createCampaign({
      ...campaignData,
      isDraft: false,
      paymentConfigured: false,
      defaultCommissionRate: 10,
    });
    
    console.log('✅ Campagne créée:', campaignId);
    
    // 🎉 Déclencher les confettis de célébration !
    setTimeout(() => {
      triggerSuccessConfetti();
    }, 300);
    
    // Rediriger vers Stripe pour la configuration de paiement
    const setupData = await setupPaymentForCampaign(campaignId, campaignData.name);
    console.log('✅ Redirection vers la page de paiement:', setupData.checkoutUrl);
    
    // Rediriger l'utilisateur vers la page de paiement
    window.location.href = setupData.checkoutUrl;
    
    return setupData;
  };

  const handleCardSelection = async (cardId: string) => {
    if (!pendingCampaignData) return;
    
    try {
      setLoading(true);
      console.log('💳 Carte sélectionnée:', cardId);
      
      // Créer la campagne avec la carte sélectionnée
      const campaignId = await createCampaign({
        ...pendingCampaignData,
        isDraft: false,
        paymentConfigured: true,
        stripePaymentMethodId: cardId,
        defaultCommissionRate: 10,
      });
      
      console.log('✅ Campagne créée avec la carte existante:', campaignId);
      
      // 🎉 Déclencher les confettis de célébration !
      setTimeout(() => {
        triggerSuccessConfetti();
      }, 300);
      
      toast({
        title: "Campagne créée avec succès !",
        description: "Votre campagne est maintenant active avec la carte sélectionnée.",
      });
      
      // Réinitialiser et fermer
      resetForm();
      
    } catch (error: any) {
      console.error('❌ Erreur création campagne avec carte:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la campagne",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewCard = async () => {
    if (!pendingCampaignData) return;
    
    try {
      setLoading(true);
      await createCampaignWithPayment(pendingCampaignData);
    } catch (error: any) {
      console.error('❌ Erreur ajout nouvelle carte:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter une nouvelle carte",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return {
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
  };
};
