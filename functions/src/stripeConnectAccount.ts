import * as functions from "firebase-functions";
import { stripe } from "./stripeConfig";

export const stripeCreateConnectAccount = functions.https.onRequest(async (req, res) => {
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
    const { email, country = "FR" } = req.body;

    if (!email) {
      res.status(400).json({ error: "Email required" });
      return;
    }

    // Créer un compte Connect Express
    const account = await stripe.accounts.create({
      type: "express",
      country,
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    console.log("Connect account created:", account.id);

    res.status(200).json({
      success: true,
      accountId: account.id,
    });

  } catch (error) {
    console.error("Stripe create connect account error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export const stripeCreateAccountLink = functions.https.onRequest(async (req, res) => {
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
    const { accountId, refreshUrl, returnUrl } = req.body;

    if (!accountId || !refreshUrl || !returnUrl) {
      res.status(400).json({ error: "Account ID, refresh URL and return URL required" });
      return;
    }

    // Créer un lien d'onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    console.log("Account link created:", accountLink.url);

    res.status(200).json({
      success: true,
      url: accountLink.url,
    });

  } catch (error) {
    console.error("Stripe create account link error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export const stripeCreateTransfer = functions.https.onRequest(async (req, res) => {
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
    const { accountId, amount, currency = "eur", description } = req.body;

    if (!accountId || !amount) {
      res.status(400).json({ error: "Account ID and amount required" });
      return;
    }

    // Créer un transfert vers le compte Connect
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convertir en centimes
      currency,
      destination: accountId,
      description: description || "Commission RefSpring",
    });

    console.log("Transfer created:", transfer.id);

    res.status(200).json({
      success: true,
      transfer: {
        id: transfer.id,
        amount: transfer.amount / 100,
        currency: transfer.currency,
        destination: transfer.destination,
      },
    });

  } catch (error) {
    console.error("Stripe create transfer error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});