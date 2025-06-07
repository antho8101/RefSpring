
import { useState } from 'react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useStripePayment } from '@/hooks/useStripePayment';
import { useToast } from '@/hooks/use-toast';
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
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    targetUrl: '',
    isActive: true,
  });
  
  const { createCampaign } = useCampaigns();
  const { setupPaymentForCampaign, loading: paymentLoading } = useStripePayment();
  const { toast } = useToast();

  const updateFormData = (updates: Partial<CampaignFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', targetUrl: '', isActive: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🎯 Création de la campagne en mode draft...');
      
      if (!formData.name) {
        throw new Error('Le nom de la campagne est requis');
      }
      
      if (!formData.targetUrl) {
        throw new Error('L\'URL de destination est requise');
      }
      
      // Créer la campagne en mode draft
      const campaignId = await createCampaign({
        ...formData,
        isDraft: true,
        paymentConfigured: false,
        defaultCommissionRate: 10, // Valeur par défaut de 10%
      });
      
      console.log('✅ Campagne draft créée:', campaignId);
      
      // 🎉 Déclencher les confettis de célébration !
      setTimeout(() => {
        triggerSuccessConfetti();
      }, 300);
      
      // Rediriger vers Stripe pour la configuration de paiement
      const setupData = await setupPaymentForCampaign(campaignId, formData.name);
      console.log('✅ Redirection vers la page de paiement:', setupData.checkoutUrl);
      
      // Rediriger l'utilisateur vers la page de paiement
      window.location.href = setupData.checkoutUrl;
      
      return setupData;
    } catch (error: any) {
      console.error('❌ Erreur création campagne:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la campagne",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    paymentLoading,
    updateFormData,
    resetForm,
    handleSubmit,
  };
};
