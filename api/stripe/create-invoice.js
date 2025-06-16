
export default async function handler(req, res) {
  // Gestion CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    console.log('💳 API STRIPE INVOICE: Début création facture');
    
    const { userEmail, amount, description, campaignName } = req.body;

    if (!userEmail || !amount || !description) {
      return res.status(400).json({ 
        error: 'Paramètres manquants (userEmail, amount, description requis)' 
      });
    }

    // Validation du montant (doit être en centimes, positif)
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ 
        error: 'Le montant doit être un nombre positif en centimes' 
      });
    }

    console.log('💳 API STRIPE INVOICE: Paramètres validés:', {
      userEmail,
      amount,
      description: description.substring(0, 50) + '...'
    });

    // Pour l'instant, on simule la création de la facture
    // En production, vous devrez intégrer avec l'API Stripe Invoicing
    const simulatedInvoiceId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    console.log('💳 API STRIPE INVOICE: Facture simulée créée:', simulatedInvoiceId);
    
    // Simuler un délai d'API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Log pour traçabilité
    console.log('💳 FACTURATION REFSPRING:', {
      email: userEmail,
      amount: amount / 100, // Convertir en euros pour les logs
      campaign: campaignName,
      invoiceId: simulatedInvoiceId
    });

    return res.status(200).json({
      success: true,
      invoiceId: simulatedInvoiceId,
      message: 'Facture RefSpring créée avec succès (mode simulation)'
    });

  } catch (error) {
    console.error('❌ API STRIPE INVOICE: Erreur:', error);
    return res.status(500).json({
      error: 'Erreur interne lors de la création de la facture',
      details: error.message
    });
  }
}
