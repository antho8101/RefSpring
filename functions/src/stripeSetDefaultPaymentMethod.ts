import * as functions from "firebase-functions";
import { stripe } from "./stripeConfig";

export const stripeSetDefaultPaymentMethod = functions.https.onRequest(async (req, res) => {
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
    const { customerId, paymentMethodId } = req.body;

    if (!customerId || !paymentMethodId) {
      res.status(400).json({ error: "Customer ID and Payment Method ID required" });
      return;
    }

    // Mettre à jour le client pour définir le moyen de paiement par défaut
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    console.log("Default payment method updated:", paymentMethodId);

    res.status(200).json({
      success: true,
      message: "Default payment method updated successfully",
    });

  } catch (error) {
    console.error("Stripe set default payment method error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});