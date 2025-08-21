
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';

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
    console.log('🔍 FIREBASE: Chargement des cartes bancaires pour:', userEmail);
    
    try {
      const getPaymentMethods = httpsCallable(functions, 'stripeGetPaymentMethods');
      const result = await getPaymentMethods({ userEmail });
      const data = result.data as { paymentMethods?: PaymentMethod[] };
      
      console.log('✅ FIREBASE: Cartes bancaires chargées:', data.paymentMethods?.length || 0);
      return data.paymentMethods || [];
    } catch (error) {
      console.error('❌ FIREBASE: Erreur chargement cartes:', error);
      return [];
    }
  },

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    console.log(`🗑️ FIREBASE: Suppression de la carte ${paymentMethodId}`);
    
    try {
      const deletePaymentMethod = httpsCallable(functions, 'stripeDeletePaymentMethod');
      await deletePaymentMethod({ paymentMethodId });
      
      console.log('✅ FIREBASE: Carte supprimée de Stripe');
    } catch (error) {
      console.error('❌ FIREBASE: Erreur suppression carte:', error);
      throw error;
    }
  },

  async setDefaultPaymentMethod(userEmail: string, paymentMethodId: string): Promise<void> {
    console.log(`⭐ FIREBASE: Définition de la carte par défaut ${paymentMethodId} pour ${userEmail}`);
    
    try {
      const setDefaultPaymentMethod = httpsCallable(functions, 'stripeSetDefaultPaymentMethod');
      await setDefaultPaymentMethod({ userEmail, paymentMethodId });
      
      console.log('✅ FIREBASE: Carte par défaut mise à jour');
    } catch (error) {
      console.error('❌ FIREBASE: Erreur définition carte par défaut:', error);
      throw error;
    }
  }
};
