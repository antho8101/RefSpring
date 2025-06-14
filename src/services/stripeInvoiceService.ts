
// Service pour créer et envoyer des factures Stripe pour les commissions RefSpring
export interface RefSpringInvoiceData {
  userEmail: string;
  amount: number; // Montant en centimes
  description: string;
  campaignName: string;
}

export class StripeInvoiceService {
  static async createAndSendInvoice(invoiceData: RefSpringInvoiceData): Promise<{
    success: boolean;
    invoiceId?: string;
    error?: string;
  }> {
    try {
      console.log('💳 STRIPE INVOICE: Création facture RefSpring:', invoiceData);
      
      // Appel à l'API Vercel pour créer la facture
      const response = await fetch('/api/stripe/create-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: invoiceData.userEmail,
          amount: invoiceData.amount,
          description: invoiceData.description,
          campaignName: invoiceData.campaignName,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ STRIPE INVOICE: Facture créée avec succès:', result);
      
      return {
        success: true,
        invoiceId: result.invoiceId,
      };
    } catch (error: any) {
      console.error('❌ STRIPE INVOICE: Erreur création facture:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export const stripeInvoiceService = new StripeInvoiceService();
