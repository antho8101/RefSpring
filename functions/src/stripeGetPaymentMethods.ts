import * as functions from "firebase-functions";
import { stripe } from "./stripeConfig";

export const stripeGetPaymentMethods = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const customerId = req.method === "GET" ? req.query.customerId as string : req.body.customerId;

    if (!customerId) {
      res.status(400).json({ error: "Customer ID required" });
      return;
    }

    // Récupérer les moyens de paiement du client
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    // Récupérer les informations du client pour le moyen de paiement par défaut
    const customer = await stripe.customers.retrieve(customerId);
    const defaultPaymentMethodId = customer && typeof customer !== "string" 
      ? customer.invoice_settings?.default_payment_method 
      : null;

    const formattedPaymentMethods = paymentMethods.data.map(pm => ({
      id: pm.id,
      type: pm.type,
      card: pm.card ? {
        brand: pm.card.brand,
        last4: pm.card.last4,
        exp_month: pm.card.exp_month,
        exp_year: pm.card.exp_year,
      } : null,
      isDefault: pm.id === defaultPaymentMethodId,
    }));

    res.status(200).json({
      success: true,
      paymentMethods: formattedPaymentMethods,
    });

  } catch (error) {
    console.error("Stripe get payment methods error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});