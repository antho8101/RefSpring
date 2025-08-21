import * as functions from 'firebase-functions';
import { stripe } from './stripeConfig';

export const stripeCreateInvoice = functions.https.onRequest(async (req, res) => {
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
    const { 
      userEmail, 
      amount, 
      description, 
      metadata,
      dueDate 
    } = req.body;

    if (!userEmail || !amount) {
      return res.status(400).json({ error: 'userEmail and amount are required' });
    }

    console.log('🧾 Creating invoice for:', userEmail, 'Amount:', amount);

    // Chercher ou créer le customer
    let customerId;
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
      });
      customerId = customer.id;
    }

    // Créer l'invoice item
    await stripe.invoiceItems.create({
      customer: customerId,
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'eur',
      description: description || 'RefSpring Service',
    });

    // Créer la facture
    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: 'send_invoice',
      days_until_due: dueDate ? Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 30,
      metadata: metadata || {},
    });

    // Finaliser la facture
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

    console.log('✅ Invoice created and finalized:', finalizedInvoice.id);

    return res.json({
      invoiceId: finalizedInvoice.id,
      invoiceUrl: finalizedInvoice.hosted_invoice_url,
      invoicePdf: finalizedInvoice.invoice_pdf,
      status: finalizedInvoice.status,
      amount: finalizedInvoice.amount_due,
      currency: finalizedInvoice.currency,
    });

  } catch (error) {
    console.error('❌ Error creating invoice:', error);
    return res.status(500).json({ 
      error: 'Failed to create invoice',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});