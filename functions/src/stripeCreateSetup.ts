import * as functions from "firebase-functions";
import { stripe } from "./stripeConfig";

export const stripeCreateSetup = functions.https.onRequest(async (req, res) => {
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

    // Attacher le moyen de paiement au client
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Mettre à jour le client pour définir ce moyen de paiement par défaut
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    console.log("Payment method attached:", paymentMethodId);

    res.status(200).json({
      success: true,
      message: "Payment method configured successfully",
    });

  } catch (error) {
    console.error("Stripe setup error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});