
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
    console.log('🔍 API: Chargement des cartes bancaires pour:', userEmail);
    
    try {
      const response = await fetch('/api/stripe-payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }
      
      const data = await response.json();
      console.log('✅ API: Cartes bancaires chargées:', data.paymentMethods?.length || 0);
      return data.paymentMethods || [];
    } catch (error) {
      console.error('❌ API: Erreur chargement cartes:', error);
      return [];
    }
  },

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    console.log(`🗑️ API: Suppression de la carte ${paymentMethodId}`);
    
    try {
      const response = await fetch('/api/stripe-delete-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete payment method');
      }
      
      console.log('✅ API: Carte supprimée de Stripe');
    } catch (error) {
      console.error('❌ API: Erreur suppression carte:', error);
      throw error;
    }
  },

  async setDefaultPaymentMethod(userEmail: string, paymentMethodId: string): Promise<void> {
    console.log(`⭐ API: Définition de la carte par défaut ${paymentMethodId} pour ${userEmail}`);
    
    try {
      const response = await fetch('/api/stripe-set-default-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail, paymentMethodId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to set default payment method');
      }
      
      console.log('✅ API: Carte par défaut mise à jour');
    } catch (error) {
      console.error('❌ API: Erreur définition carte par défaut:', error);
      throw error;
    }
  }
};
