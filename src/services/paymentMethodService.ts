
// PRODUCTION STRIPE SERVICE - Utilise maintenant les vraies API Vercel Edge Functions
export interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  isDefault?: boolean;
}

export const paymentMethodService = {
  async getPaymentMethods(userEmail: string): Promise<PaymentMethod[]> {
    console.log('🔍 PRODUCTION: Chargement des cartes bancaires pour:', userEmail);
    
    try {
      // Appel à l'API Vercel Edge Function pour récupérer les cartes
      const response = await fetch('/api/stripe/get-payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail }),
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      console.log('✅ PRODUCTION: Cartes bancaires chargées:', result.paymentMethods?.length || 0);
      
      return result.paymentMethods || [];
    } catch (error) {
      console.error('❌ PRODUCTION: Erreur chargement cartes:', error);
      return [];
    }
  },

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    console.log(`🗑️ PRODUCTION: Suppression de la carte ${paymentMethodId}`);
    
    try {
      const response = await fetch('/api/stripe/delete-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId }),
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${await response.text()}`);
      }

      console.log('✅ PRODUCTION: Carte supprimée de Stripe');
    } catch (error) {
      console.error('❌ PRODUCTION: Erreur suppression carte:', error);
      throw error;
    }
  },

  async setDefaultPaymentMethod(userEmail: string, paymentMethodId: string): Promise<void> {
    console.log(`⭐ PRODUCTION: Définition de la carte par défaut ${paymentMethodId} pour ${userEmail}`);
    
    try {
      const response = await fetch('/api/stripe/set-default-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail, paymentMethodId }),
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${await response.text()}`);
      }

      console.log('✅ PRODUCTION: Carte par défaut mise à jour');
    } catch (error) {
      console.error('❌ PRODUCTION: Erreur définition carte par défaut:', error);
      throw error;
    }
  }
};
