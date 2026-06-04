import User from "../models/User.js";
import { getUserPlan } from "../utils/getUserPlans.js";

export async function checkTelegramAccess(req, res, next) {
  try {
    const telegramId = req.headers["x-telegram-id"];
    if (!telegramId) {
      return res.status(401).json({ message: "Telegram ID mancante" });
    }

    const user = await User.findOne({ telegramId });
    if (!user) {
      return res.status(401).json({ message: "Utente non trovato" });
    }

    const planInfo = getUserPlan(user);
if (planInfo.plan === 'NEOPHYTE') {
      return res.status(403).json({ message: "Abbonamento non valido per l'accesso al bot" });
    }

    req.user = user;
    req.plan = planInfo;
    next();
  } catch (err) {
    console.error("Errore checkTelegramAccess:", err);
    res.status(500).json({ message: "Errore server" });
  }
}
