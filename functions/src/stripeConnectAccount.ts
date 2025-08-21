import * as functions from 'firebase-functions';
import { stripe } from './stripeConfig';

export const stripeCreateConnectAccount = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { affiliateEmail, affiliateName, country = 'FR' } = req.body;

    if (!affiliateEmail || !affiliateName) {
      return res.status(400).json({ error: 'affiliateEmail and affiliateName are required' });
    }

    console.log('🔗 Creating Stripe Connect account for:', affiliateEmail);

    const account = await stripe.accounts.create({
      type: 'express',
      country: country,
      email: affiliateEmail,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        affiliateEmail,
        affiliateName,
      },
    });

    console.log('✅ Stripe Connect account created:', account.id);

    return res.json({
      accountId: account.id,
      email: affiliateEmail,
      name: affiliateName,
      country: account.country,
      created: account.created,
    });

  } catch (error) {
    console.error('❌ Error creating Stripe Connect account:', error);
    return res.status(500).json({ 
      error: 'Failed to create Stripe Connect account',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export const stripeCreateAccountLink = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { accountId, affiliateId, refreshUrl, returnUrl } = req.body;

    if (!accountId) {
      return res.status(400).json({ error: 'accountId is required' });
    }

    console.log('🔗 Creating account link for:', accountId);

    const origin = req.headers.origin || 'http://localhost:5173';
    
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl || `${origin}/affiliate-onboarding?refresh=true&account=${accountId}`,
      return_url: returnUrl || `${origin}/affiliate-onboarding?success=true&account=${accountId}`,
      type: 'account_onboarding',
    });

    console.log('✅ Account link created:', accountLink.url);

    return res.json({
      url: accountLink.url,
      expires_at: accountLink.expires_at,
    });

  } catch (error) {
    console.error('❌ Error creating account link:', error);
    return res.status(500).json({ 
      error: 'Failed to create account link',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export const stripeCreateTransfer = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { accountId, amount, description, metadata } = req.body;

    if (!accountId || !amount) {
      return res.status(400).json({ error: 'accountId and amount are required' });
    }

    console.log('💸 Creating transfer:', { accountId, amount });

    const transfer = await stripe.transfers.create({
      amount: Math.round(amount), // Amount in cents
      currency: 'eur',
      destination: accountId,
      description: description || 'Commission payment',
      metadata: metadata || {},
    });

    console.log('✅ Transfer created:', transfer.id);

    return res.json({
      transferId: transfer.id,
      amount: transfer.amount,
      currency: transfer.currency,
      destination: transfer.destination,
      created: transfer.created,
    });

  } catch (error) {
    console.error('❌ Error creating transfer:', error);
    return res.status(500).json({ 
      error: 'Failed to create transfer',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});