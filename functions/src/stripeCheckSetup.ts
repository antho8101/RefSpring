import * as functions from "firebase-functions";
import { stripe } from "./stripeConfig";

export const stripeCheckSetup = functions.https.onRequest(async (req, res) => {
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
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({ error: "User ID required" });
      return;
    }

    // Créer un setup intent pour configurer un moyen de paiement
    const setupIntent = await stripe.setupIntents.create({
      customer: userId,
      usage: "off_session",
      payment_method_types: ["card"],
    });

    console.log("Setup intent created:", setupIntent.id);

    res.status(200).json({
      success: true,
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
    });

  } catch (error) {
    console.error("Stripe setup intent error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});