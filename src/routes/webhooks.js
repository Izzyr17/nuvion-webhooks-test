require("dotenv").config();
const express = require("express");
const router = express.Router();
const crypto = require("crypto");

const NUVION_WEBHOOK_SECRET = process.env.NUVION_WEBHOOK_SECRET;

// Middleware to validate webhook signature
const validateWebhookSignature = (req, res, next) => {
  try {
    const headers = req.headers;

    const receivedSignature = headers["x-nuvion-event-signature"];
    const receivedTimestamp = headers["x-nuvion-event-timestamp"];
    const receivedWebhookId = headers["x-nuvion-event-id"];
    if (!receivedSignature || !receivedTimestamp || !receivedWebhookId) {
      console.warn("Missing webhook verification headers.");
      return res
        .status(400)
        .json({ error: "Missing webhook verification headers." });
    }
    console.info({ receivedSignature, receivedTimestamp, receivedWebhookId });

    const rawBodyString = JSON.stringify(req.body);
    const signaturePayload = `${receivedTimestamp}.${rawBodyString}`;

    const computedSignature = crypto
      .createHmac("sha256", NUVION_WEBHOOK_SECRET)
      .update(signaturePayload, "utf-8")
      .digest("hex");

    const bufferComputedSignature = Buffer.from(computedSignature);
    const bufferReceivedSignature = Buffer.from(receivedSignature);

    if (
      !bufferComputedSignature ||
      bufferComputedSignature.length !== bufferReceivedSignature.length
    ) {
      console.warn("Invalid webhook signature length.");
      return res.status(400).json({ error: "Invalid signature" });
    }

    if (
      crypto.timingSafeEqual(bufferComputedSignature, bufferReceivedSignature)
    ) {
      // Request is valid and actually came from Nuvion!
      console.log("Webhook signature verified successfully.");
      next();
    } else {
      // Invalid signature - possible tampering or not from Nuvion
      console.warn("Invalid webhook signature. Computed:", computedSignature);
      return res.status(400).json({ error: "Invalid signature" });
    }
  } catch (error) {
    console.error("Error validating webhook signature:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/webhooks/nuv
router.post("/nuv", validateWebhookSignature, (req, res) => {
  console.log("Received webhook event:", req.body, req.headers);
  res.status(200).json({ ok: true });
});

module.exports = router;
