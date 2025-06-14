
interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

const deletedPaymentMethods = new Set<string>();

export class DuplicateCardRemover {
  removeDuplicates(paymentMethods: PaymentMethod[]): PaymentMethod[] {
    const seen = new Map<string, PaymentMethod>();
    
    return paymentMethods
      .filter(pm => !deletedPaymentMethods.has(pm.id))
      .filter(pm => {
        const key = `${pm.brand}-${pm.last4}-${pm.expMonth}-${pm.expYear}`;
        if (seen.has(key)) {
          return false;
        }
        seen.set(key, pm);
        return true;
      });
  }

  markAsDeleted(paymentMethodId: string): void {
    deletedPaymentMethods.add(paymentMethodId);
  }

  getDeletedIds(): string[] {
    return Array.from(deletedPaymentMethods);
  }

  // Méthode simplifiée qui ne fait qu'un nettoyage local
  async cleanupDuplicatesForUser(userEmail: string): Promise<number> {
    console.log(`🧹 Nettoyage local des doublons pour: ${userEmail}`);
    // Pour l'instant, on retourne juste 0 car c'est juste un nettoyage local
    return 0;
  }
}

export const duplicateCardRemover = new DuplicateCardRemover();
