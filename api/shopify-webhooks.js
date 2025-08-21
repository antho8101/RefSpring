// Proxy pour les webhooks Shopify
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const topic = req.headers['x-shopify-topic'];
    let firebaseUrl;

    // Router vers la bonne fonction selon le type de webhook
    switch (topic) {
      case 'orders/create':
      case 'orders/updated':
      case 'orders/paid':
        firebaseUrl = 'https://us-central1-refspring-project.cloudfunctions.net/shopifyOrderWebhook';
        break;
      case 'app/uninstalled':
        firebaseUrl = 'https://us-central1-refspring-project.cloudfunctions.net/shopifyAppWebhook';
        break;
      default:
        return res.status(400).json({ error: 'Unsupported webhook topic' });
    }

    // Forward la requête avec tous les headers Shopify
    const response = await fetch(firebaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Topic': req.headers['x-shopify-topic'] || '',
        'X-Shopify-Hmac-Sha256': req.headers['x-shopify-hmac-sha256'] || '',
        'X-Shopify-Shop-Domain': req.headers['x-shopify-shop-domain'] || '',
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Webhook proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}