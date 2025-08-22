import * as functions from "firebase-functions";
import { stripe } from "./stripeConfig";

export const stripeDeletePaymentMethod = functions.https.onRequest(async (req, res) => {
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
    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      res.status(400).json({ error: "Payment Method ID required" });
      return;
    }

    // Détacher le moyen de paiement
    await stripe.paymentMethods.detach(paymentMethodId);

    console.log("Payment method deleted:", paymentMethodId);

    res.status(200).json({
      success: true,
      message: "Payment method deleted successfully",
    });

  } catch (error) {
    console.error("Stripe delete payment method error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});