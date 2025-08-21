
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';

// Service pour créer et envoyer des factures Stripe pour les commissions RefSpring
export interface RefSpringInvoiceData {
  userEmail: string;
  amount: number; // Montant en centimes
  description: string;
  campaignName: string;
  stripePaymentMethodId: string; // 🔥 AJOUT du paramètre obligatoire
}

export class StripeInvoiceService {
  static async createAndSendInvoice(invoiceData: RefSpringInvoiceData): Promise<{
    success: boolean;
    invoiceId?: string;
    error?: string;
  }> {
    try {
      console.log('💳 FIREBASE STRIPE INVOICE: Création facture RefSpring:', invoiceData);
      
      const createInvoice = httpsCallable(functions, 'stripeCreateInvoice');
      const result = await createInvoice({
        userEmail: invoiceData.userEmail,
        amount: invoiceData.amount,
        description: invoiceData.description,
        metadata: {
          campaignName: invoiceData.campaignName,
          stripePaymentMethodId: invoiceData.stripePaymentMethodId,
        },
      });

      const data = result.data as any;
      console.log('✅ FIREBASE STRIPE INVOICE: Facture créée avec succès:', data);
      
      return {
        success: true,
        invoiceId: data.invoiceId,
      };
    } catch (error: any) {
      console.error('❌ FIREBASE STRIPE INVOICE: Erreur création facture:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export const stripeInvoiceService = new StripeInvoiceService();
