// Proxy pour le callback OAuth Shopify
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Forward la requête vers Firebase Functions
    const firebaseUrl = 'https://us-central1-refspring-project.cloudfunctions.net/shopifyTokenExchange';
    
    const response = await fetch(firebaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('OAuth callback proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}