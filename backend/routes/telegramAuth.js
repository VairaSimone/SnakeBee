import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import Reptile from "../models/Reptile.js";
import Feeding from "../models/Feeding.js";
import Event from "../models/Event.js"; 
import FoodInventory from "../models/FoodInventory.js"; 
import { getUserPlan } from "../utils/getUserPlans.js";
import { checkTelegramAccess } from "../middlewares/checkTelegramAccess.js";

const routerTelegram = express.Router();
async function isInventoryAccessAllowed(userId) {
  const user = await User.findById(userId);
  return user?.subscription?.plan === 'BREEDER';
}

async function telegramAuth(req, res, next) {
  const telegramId = req.header("x-telegram-id");
  if (!telegramId) return res.status(400).json({ message: "Missing telegramId" });

  const user = await User.findOne({ telegramId });
  if (!user) return res.status(404).json({ message: "User not found" });

  req.user = user;
  next();
}

routerTelegram.get("/link", async (req, res) => {
  try {
    const { telegramId } = req.query;
    if (!telegramId) return res.status(400).json({ message: "Telegram ID required" });

    const token = jwt.sign({ telegramId }, process.env.JWT_SECRET, { expiresIn: "30m" });
    const url = `${process.env.FRONTEND_URL}/telegram-auth?token=${token}`;
    return res.json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

routerTelegram.post("/connect", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Missing token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const telegramId = decoded.telegramId;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "Missing userId" });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.telegramId = telegramId;
    await user.save();

    return res.json({ message: "Telegram account linked successfully" });
  } catch (err) {
    if (err.name === "TokenExpiredError") return res.status(401).json({ message: "Token scaduto" });
    return res.status(401).json({ message: "Token non valido" });
  }
});

routerTelegram.get("/reptiles", telegramAuth, checkTelegramAccess, async (req, res) => {
  const reptiles = await Reptile.find({ user: req.user._id }).select("name species sex morph");
  res.json({ reptiles });
});

routerTelegram.get("/reptile/:id", telegramAuth, checkTelegramAccess, async (req, res) => {
  const reptile = await Reptile.findOne({ _id: req.params.id, user: req.user._id }).lean();
  if (!reptile) return res.status(404).json({ message: "Reptile not found" });
  res.json({ reptile });
});

routerTelegram.get("/reptile/:id/feedings", telegramAuth, checkTelegramAccess, async (req, res) => {
  const reptile = await Reptile.findOne({ _id: req.params.id, user: req.user._id });
  if (!reptile) return res.status(404).json({ message: "Reptile not found" });

  const feedings = await Feeding.find({ reptile: reptile._id }).sort({ date: -1 }).limit(5).lean();
  res.json({ feedings });
});

routerTelegram.get("/reptile/:id/events", telegramAuth, checkTelegramAccess, async (req, res) => {
  const reptile = await Reptile.findOne({ _id: req.params.id, user: req.user._id });
  if (!reptile) return res.status(404).json({ message: "Reptile not found" });

  const events = await Event.find({ reptile: reptile._id }).sort({ date: -1 }).lean();
  res.json({ events });
});

routerTelegram.get("/inventory", telegramAuth, checkTelegramAccess, async (req, res) => {
  try {
    const { plan } = getUserPlan(req.user);
    if (plan !== 'BREEDER') { // Logica basata su `isInventoryAccessAllowed` [cite: 118]
      return res.status(403).json({ message: "Questa funzionalità è riservata agli utenti BREEDER." });
    }
    const inventory = await FoodInventory.find({ user: req.user._id }).lean();
    res.json({ inventory });
  } catch (err) {
    console.error("Telegram inventory error:", err);
    res.status(500).json({ message: "Errore nel recuperare l'inventario." });
  }
});

routerTelegram.post("/reptile/:id/feedings", telegramAuth, checkTelegramAccess, async (req, res) => {
  try {
    const reptile = await Reptile.findOne({ _id: req.params.id, user: req.user._id });
    if (!reptile) return res.status(404).json({ message: "Rettile non trovato" });

    const { foodType, quantity, weightPerUnit, wasEaten, notes, date, nextMealDayManual, manual } = req.body;

    const feedingDate = new Date(date || Date.now());
    let nextFeedingDate = null;
    const retryDays = 1;
    if (wasEaten) {
      const daysToAdd = nextMealDayManual || reptile.nextMealDay;
      if (daysToAdd) {
        nextFeedingDate = new Date(feedingDate);
        nextFeedingDate.setDate(feedingDate.getDate() + parseInt(daysToAdd, 10));
      } else {
        return res.status(400).json({ message: "Il numero di giorni per il prossimo pasto è obbligatorio." });
      }
    } else { 
      nextFeedingDate = new Date(feedingDate);
      nextFeedingDate.setDate(feedingDate.getDate() + retryDays);
    }

    const meatTypes = ['Topo', 'Ratto', 'Coniglio', 'Pulcino'];
    const { plan } = getUserPlan(req.user);
    if (plan === 'BREEDER' && wasEaten && meatTypes.includes(foodType)  && !manual) {
      const invItem = await FoodInventory.findOne({ user: req.user._id, foodType, weightPerUnit });
      if (!invItem || invItem.quantity < quantity) {
        return res.status(400).json({ message: `Scorte insufficienti per ${foodType} da ${weightPerUnit}g.` });
      }
      invItem.quantity -= quantity;
      await invItem.save();

    }

    const newFeeding = new Feeding({
      reptile: req.params.id,
      date: feedingDate,
      foodType,
      quantity,
      weightPerUnit,
      wasEaten,
      notes,
      nextFeedingDate: nextFeedingDate,
      retryAfterDays: !wasEaten ? retryDays : undefined
    });

    await newFeeding.save();
    res.status(201).json({ message: "Alimentazione aggiunta con successo!", feeding: newFeeding });

  } catch (err) {
    console.error("Telegram add feeding error:", err);
    res.status(500).json({ message: "Errore durante l'aggiunta dell'alimentazione." });
  }
});

routerTelegram.post("/reptile/:id/events", telegramAuth, checkTelegramAccess, async (req, res) => {
  try {
    const reptile = await Reptile.findOne({ _id: req.params.id, user: req.user._id });
    if (!reptile) return res.status(404).json({ message: "Rettile non trovato" });

    const { type, date, notes, weight } = req.body;

    const { plan, limits } = getUserPlan(req.user);
    if ((plan === 'NEOPHYTE' || plan === 'APPRENTICE') && limits.eventsPerTypePerReptile) {
      const count = await Event.countDocuments({ reptile: req.params.id, type });
      if (count >= limits.eventsPerTypePerReptile) {
        return res.status(403).json({ message: `Hai raggiunto il limite di eventi di tipo '${type}' per questo rettile.` });
      }
    }

    const newEvent = new Event({
      reptile: req.params.id,
      type,
      date: new Date(date || Date.now()),
      notes,
      weight: type === 'weight' ? weight : undefined
    });

    await newEvent.save();
    res.status(201).json({ message: "Evento aggiunto con successo!", event: newEvent });

  } catch (err) {
    console.error("Telegram add event error:", err);
    res.status(500).json({ message: "Errore durante l'aggiunta dell'evento." });
  }
});

export default routerTelegram;
