// Fonction API unifiée pour toutes les opérations Stripe
export default async function handler(req, res) {
  const { method } = req;
  const { action, setupIntentId } = req.query;

  if (!['POST', 'GET'].includes(method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const firebaseBaseUrl = 'https://us-central1-refspring-project.cloudfunctions.net';
    
    // Router vers la bonne fonction Firebase selon l'action
    const endpointMap = {
      'check-setup': `${firebaseBaseUrl}/stripeCheckSetup`,
      'connect-webhook': `${firebaseBaseUrl}/stripeConnectWebhook`,
      'create-account-link': `${firebaseBaseUrl}/stripeCreateAccountLink`,
      'create-connect-account': `${firebaseBaseUrl}/stripeCreateConnectAccount`,
      'create-invoice': `${firebaseBaseUrl}/stripeCreateInvoice`,
      'create-payment-link': `${firebaseBaseUrl}/stripeCreatePaymentLink`,
      'create-setup': `${firebaseBaseUrl}/stripeCreateSetup`,
      'create-transfer': `${firebaseBaseUrl}/stripeCreateTransfer`,
      'delete-payment-method': `${firebaseBaseUrl}/stripeDeletePaymentMethod`,
      'get-payment-methods': `${firebaseBaseUrl}/stripeGetPaymentMethods`,
      'set-default-payment-method': `${firebaseBaseUrl}/stripeSetDefaultPaymentMethod`
    };

    const endpoint = endpointMap[action];
    if (!endpoint) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    let url = endpoint;
    let fetchOptions = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    // Pour GET avec paramètres (comme check-setup)
    if (method === 'GET' && setupIntentId) {
      url += `?setupIntentId=${encodeURIComponent(setupIntentId)}`;
    } else if (method === 'POST') {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Stripe API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}