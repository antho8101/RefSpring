
import { stripeBackendService } from '@/services/stripeBackendService';

interface CardData {
  id: string;
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  created: number;
}

export const duplicateCardRemover = {
  async removeDuplicates(cards: CardData[]): Promise<number> {
    console.log('🔍 Recherche de doublons parmi', cards.length, 'cartes');
    
    // Grouper les cartes par signature unique (last4 + brand + exp_month + exp_year)
    const cardGroups = new Map();
    
    cards.forEach(card => {
      const signature = `${card.last4}-${card.brand}-${card.exp_month}-${card.exp_year}`;
      if (!cardGroups.has(signature)) {
        cardGroups.set(signature, []);
      }
      cardGroups.get(signature).push(card);
    });

    // Identifier et supprimer les doublons
    let duplicatesRemoved = 0;
    for (const [signature, duplicateCards] of cardGroups.entries()) {
      if (duplicateCards.length > 1) {
        console.log(`🔄 Trouvé ${duplicateCards.length} doublons pour la carte ${signature}`);
        
        // Trier par date de création (garder la plus récente)
        duplicateCards.sort((a, b) => b.created - a.created);
        const cardToKeep = duplicateCards[0];
        const cardsToDelete = duplicateCards.slice(1);
        
        console.log(`✅ Garde la carte ${cardToKeep.id} (plus récente)`);
        
        // Supprimer les anciennes cartes
        for (const cardToDelete of cardsToDelete) {
          try {
            console.log(`🗑️ Suppression du doublon ${cardToDelete.id}`);
            await stripeBackendService.detachPaymentMethod(cardToDelete.id);
            duplicatesRemoved++;
          } catch (error) {
            console.error(`❌ Erreur suppression carte ${cardToDelete.id}:`, error);
          }
        }
      }
    }
    
    if (duplicatesRemoved > 0) {
      console.log(`✅ ${duplicatesRemoved} doublons supprimés avec succès`);
    } else {
      console.log('✅ Aucun doublon détecté');
    }
    
    return duplicatesRemoved;
  },

  async cleanupDuplicatesForUser(userEmail: string): Promise<number> {
    console.log('🧹 Nettoyage manuel des doublons...');
    
    // 1. Récupérer le client Stripe
    const customer = await stripeBackendService.createOrGetCustomer(userEmail);
    
    // 2. Récupérer toutes les cartes
    const paymentMethodsData = await stripeBackendService.getCustomerPaymentMethods(customer.id);
    
    // 3. Formater avec date de création
    const formattedPaymentMethods = paymentMethodsData.map((pm: any) => ({
      id: pm.id,
      last4: pm.card?.last4 || '****',
      brand: pm.card?.brand || 'unknown',
      exp_month: pm.card?.exp_month || 0,
      exp_year: pm.card?.exp_year || 0,
      created: pm.created,
    }));

    // 4. Supprimer les doublons et retourner le nombre
    return await this.removeDuplicates(formattedPaymentMethods);
  }
};
