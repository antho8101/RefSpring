import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      accountId,
      amount,
      currency = 'eur',
      description,
      metadata = {}
    } = req.body;

    if (!accountId || !amount) {
      return res.status(400).json({ 
        error: 'ID du compte et montant requis' 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ 
        error: 'Le montant doit être supérieur à 0' 
      });
    }

    console.log('🔄 STRIPE CONNECT: Creating transfer:', {
      accountId,
      amount: amount / 100,
      currency
    });

    // Vérifier d'abord que le compte peut recevoir des transfers
    const account = await stripe.accounts.retrieve(accountId);
    
    if (!account.capabilities?.transfers || account.capabilities.transfers !== 'active') {
      return res.status(400).json({ 
        error: 'Le compte affilié n\'est pas encore configuré pour recevoir des paiements' 
      });
    }

    // Créer le transfer
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount), // Montant en centimes
      currency: currency,
      destination: accountId,
      description: description || 'Commission RefSpring',
      metadata: {
        ...metadata,
        created_by: 'refspring_commission_system',
        created_at: new Date().toISOString(),
      },
    });

    console.log('✅ STRIPE CONNECT: Transfer created:', transfer.id);

    // Retourner les informations du transfer
    res.status(200).json({
      success: true,
      transferId: transfer.id,
      amount: transfer.amount,
      currency: transfer.currency,
      destination: transfer.destination,
      status: transfer.object, // 'transfer'
      created: transfer.created,
      description: transfer.description,
    });

  } catch (error) {
    console.error('❌ STRIPE CONNECT: Error creating transfer:', error);
    
    if (error.type === 'StripeCardError') {
      res.status(400).json({ error: error.message });
    } else if (error.type === 'StripeRateLimitError') {
      res.status(429).json({ error: 'Trop de requêtes, réessayez plus tard' });
    } else if (error.type === 'StripeInvalidRequestError') {
      res.status(400).json({ error: 'Paramètres invalides: ' + error.message });
    } else if (error.type === 'StripeAPIError') {
      res.status(500).json({ error: 'Erreur API Stripe, réessayez plus tard' });
    } else if (error.type === 'StripeConnectionError') {
      res.status(500).json({ error: 'Erreur de connexion à Stripe' });
    } else if (error.type === 'StripeAuthenticationError') {
      res.status(500).json({ error: 'Erreur d\'authentification Stripe' });
    } else {
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }
}