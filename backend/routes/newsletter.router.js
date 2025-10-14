import express from "express";
import Newsletter from "../models/Newsletter.js";

const newsletterRoute = express.Router();

newsletterRoute.post("/subscribe", async (req, res) => {
  const { email, language } = req.body;

  try {
    if (!email) return res.status(400).json({ message: req.t("email_required") });

    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res.status(200).json({ message: req.t("already_subscribed") });
    }

    const subscriber = new Newsletter({ email, language });
    await subscriber.save();

    return res.status(201).json({ message: req.t("subscribed_successfully") });
  } catch (err) {
    console.error("Newsletter error:", err);
    return res.status(500).json({ message: req.t("internal_server_error") });
  }
});

newsletterRoute.get("/check", async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: req.t("email_required") });
  }

  const existing = await Newsletter.findOne({ email });
  return res.json({ subscribed: !!existing });
});

export default newsletterRoute;
