import * as functions from "firebase-functions";
import { stripe } from "./stripeConfig";

export const stripeCreateInvoice = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { customerId, amount, currency = "eur", description } = req.body;

    if (!customerId || !amount) {
      res.status(400).json({ error: "Customer ID and amount required" });
      return;
    }

    // Créer un item de facture
    await stripe.invoiceItems.create({
      customer: customerId,
      amount: Math.round(amount * 100), // Convertir en centimes
      currency,
      description: description || "Commission RefSpring",
    });

    // Créer la facture
    const invoice = await stripe.invoices.create({
      customer: customerId,
      auto_advance: true, // Finaliser automatiquement
      collection_method: "charge_automatically", // Prélever automatiquement
    });

    // Finaliser et payer la facture
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
    
    console.log("Invoice created and finalized:", finalizedInvoice.id);

    res.status(200).json({
      success: true,
      invoice: {
        id: finalizedInvoice.id,
        status: finalizedInvoice.status,
        amount: finalizedInvoice.amount_due / 100,
        currency: finalizedInvoice.currency,
        pdf: finalizedInvoice.invoice_pdf,
        hostedUrl: finalizedInvoice.hosted_invoice_url,
      },
    });

  } catch (error) {
    console.error("Stripe invoice error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});