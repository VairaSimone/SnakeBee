import FoodInventory from '../models/FoodInventory.js';
import User from '../models/User.js';
import { logAction } from '../utils/logAction.js';
import Reptile from '../models/Reptile.js';
import Feeding from '../models/Feeding.js';
import mongoose from 'mongoose';
import i18next from 'i18next';
import { sendBroadcastEmailToUser } from '../config/mailer.config.js';

async function isInventoryAccessAllowed(userId) {
  const user = await User.findById(userId);
  return user?.subscription?.plan === 'BREEDER';
}


export const getInventory = async (req, res) => {
  try {
    if (!req.user || !req.user.userid) {
      return res.status(401).json({ message: req.t('user_notFound') });
    }

    if (!await isInventoryAccessAllowed(req.user.userid)) {
      return res.status(403).json({ message: req.t('premium_only_feature') });
    }

    const inventory = await FoodInventory.find({ user: req.user.userid });
    res.json(inventory);
  } catch (err) {
    console.error('Error retrieving inventory:', err);
    res.status(500).json({ message: req.t('error_inventory') });
  }
};

export const updateInventoryItem = async (req, res) => {
  const { id } = req.params;
  const { quantity, weightPerUnit, foodType } = req.body;

  if (!isInventoryAccessAllowed(req.user.userid)) {
    return res.status(403).json({ message: req.t('premium_only_feature') });
  }

  try {
    const item = await FoodInventory.findOneAndUpdate(
      { _id: id, user: req.user.userid },
      { quantity, weightPerUnit, foodType },
      { new: true }
    );

    if (!item) return res.status(404).json({ message: req.t('invalid_value') });

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: req.t('error_inventory') });
  }
};

export const addInventoryItem = async (req, res) => {
  const { foodType, quantity, weightPerUnit } = req.body;
  const userId = req.user.userid;

  if (!isInventoryAccessAllowed(req.user.userid)) {
    return res.status(403).json({ message: req.t('premium_only_feature') });
  }

  try {
    const existing = await FoodInventory.findOne({
      user: userId,
      foodType,
      weightPerUnit,
    });

    if (existing) {
      existing.quantity = Number(existing.quantity) + Number(quantity);
      await existing.save();
      return res.json(existing);
    }

    const newItem = new FoodInventory({
      user: userId,
      foodType,
      quantity,
      weightPerUnit,
    });
    await logAction(req.user.userid, "Create Inventory");

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('error_inventory') });
  }
};

export const deleteFeeding = async (req, res) => {
  const { id } = req.params;

  if (!isInventoryAccessAllowed(req.user.userid)) {
    return res.status(403).json({ message: req.t('premium_only_feature') });
  }

  try {
    const deleted = await FoodInventory.findOneAndDelete({
      _id: id,
      user: req.user.userid,
    });

    if (!deleted) {
      return res.status(404).json({ message: req.t('invalid_value') });
    }

    res.json({ message: req.t('element_delete') });
  } catch (err) {
    console.error('Error while deleting:', err);
    res.status(500).json({ message: req.t('error_inventory') });
  }
};

export const getFeedingSuggestions = async (req, res) => {
  try {
    const userId = req.user.userid;
    const summary = {};

    if (!await isInventoryAccessAllowed(userId)) {
      return res.status(403).json({ message: req.t('premium_only_feature') });
    }

    const reptiles = await Reptile.find({
      user: userId,
      status: 'active'
    });

    const inventory = await FoodInventory.find({ user: userId });
    const tempInventory = inventory.map(i => i.toObject());
    const suggestions = [];
    
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Fine giornata

    for (const reptile of reptiles) {
      const lastFeeding = await Feeding.findOne({ reptile: reptile._id, wasEaten: true })
                                       .sort({ date: -1 });

      let nextDate = new Date(); // Default: oggi

      if (lastFeeding) {
        if (reptile.nextMealDay) {
          // PRIORITÀ 1: Calcola usando la frequenza impostata sulla scheda del rettile
          const lastDate = new Date(lastFeeding.date);
          nextDate = new Date(lastDate.setDate(lastDate.getDate() + reptile.nextMealDay));
        } else if (lastFeeding.nextFeedingDate) {
          // PRIORITÀ 2 (FIX): Se manca la frequenza, usa la "prossima data" salvata nel record del pasto
          nextDate = new Date(lastFeeding.nextFeedingDate);
        }
      } 
      // Se non ha mai mangiato (!lastFeeding), nextDate rimane "Oggi"

      // Se la data è futura, salta
      if (nextDate > today) {
        continue;
      }

      // --- LOGICA SUGGERIMENTO CIBO ---
      let idealType = reptile.foodType;
      let idealWeight = reptile.weightPerUnit;

      // Fallback preferenze
      if ((!idealType || !idealWeight) && lastFeeding) {
         idealType = idealType || lastFeeding.foodType;
         idealWeight = idealWeight || lastFeeding.weightPerUnit;
      }

      if (!idealType) {
         suggestions.push({
          reptile: reptile.name?.trim() || reptile.morph,
          idealFood: "N/A",
          suggestion: null,
          available: 0,
          message: 'Specifica il tipo di cibo nella scheda',
          warning: 'no_preference_set'
        });
        continue;
      }

      // Cerca nell'inventario
      let sameTypeFoods = tempInventory.filter(
        (i) =>
          i.foodType === idealType &&
          i.quantity > 0 &&
          Math.abs(i.weightPerUnit - idealWeight) <= 10
      );

      if (sameTypeFoods.length === 0) {
        sameTypeFoods = tempInventory.filter(
          (i) =>
            i.foodType === idealType &&
            i.quantity > 0 &&
            Math.abs(i.weightPerUnit - idealWeight) <= 20
        );
      }

      if (sameTypeFoods.length === 0) {
        suggestions.push({
          reptile: reptile.name?.trim() || reptile.morph,
          idealFood: `${idealType} ${idealWeight}g`,
          suggestion: null,
          available: 0,
          message: 'Nessuna preda adatta in inventario',
          warning: 'food_not_found'
        });
        continue;
      }

      const bestMatch = sameTypeFoods.reduce((best, curr) => {
        return !best ||
          Math.abs(curr.weightPerUnit - idealWeight) <
          Math.abs(best.weightPerUnit - idealWeight)
          ? curr
          : best;
      }, null);

      const availableBefore = bestMatch.quantity;
      bestMatch.quantity = Math.max(bestMatch.quantity - 1, 0);

      suggestions.push({
        reptile: reptile.name?.trim() || reptile.morph,
        idealFood: `${idealType} ${idealWeight}g`,
        suggestion: `${bestMatch.foodType} ${bestMatch.weightPerUnit}g`,
        available: availableBefore,
        message:
          bestMatch.weightPerUnit === idealWeight
            ? 'Perfetta corrispondenza, scongela questa.'
            : `Preda ideale non trovata, suggerita la più vicina (${bestMatch.weightPerUnit}g).`,
        warning: bestMatch.weightPerUnit === idealWeight ? null : 'closest_match'
      });

      const key = `${bestMatch.foodType} ${bestMatch.weightPerUnit}g`;
      summary[key] = (summary[key] || 0) + 1;
    }

    if (suggestions.length === 0) {
       return res.json({ message: req.t('no_feeding_today'), suggestions: [], totalSummary: [] });
    }

    const summaryList = Object.entries(summary).map(([food, qty]) => `${qty} ${food}`);
    res.json({ suggestions, totalSummary: summaryList });

  } catch (err) {
    console.error('Error generating feeding suggestions:', err);
    res.status(500).json({ message: req.t('error_inventory') });
  }
};/**
 * Logica per calcolare la previsione di esaurimento scorte (basata sugli ultimi 90 giorni)
 */
async function getInventoryForecastLogic(userId) {
  const today = new Date();
  const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

  // 1. Trova i rettili dell'utente
  const reptiles = await Reptile.find({ user: userId }, '_id');
  if (reptiles.length === 0) return [];
  const reptileIds = reptiles.map(r => r._id);

  // 2. Calcola il consumo totale per tipo di cibo negli ultimi 90 giorni
  const recentConsumption = await Feeding.aggregate([
    {
      $match: {
        reptile: { $in: reptileIds },
        wasEaten: true,
        date: { $gte: ninetyDaysAgo }
      }
    },
    {
      $group: {
        _id: { foodType: '$foodType', weightPerUnit: '$weightPerUnit' },
        totalConsumed: { $sum: '$quantity' }
      }
    }
  ]);

  if (recentConsumption.length === 0) return []; // Nessun dato di consumo

  // 3. Prendi l'inventario attuale
  const inventory = await FoodInventory.find({ user: userId });

  // 4. Calcola i giorni rimanenti per ogni articolo
  const forecast = inventory.map(item => {
    const consumedData = recentConsumption.find(c =>
      c._id.foodType === item.foodType && c._id.weightPerUnit === item.weightPerUnit
    );

    // Se questo articolo non è mai stato consumato, i giorni rimanenti sono infiniti
    if (!consumedData || consumedData.totalConsumed === 0) {
      return { ...item.toObject(), daysLeft: Infinity, depletionDate: null, dailyRate: 0 };
    }

    // Calcola il tasso di consumo giornaliero
    const dailyRate = consumedData.totalConsumed / 90; // Consumo / 90 giorni
    const daysLeft = Math.floor(item.quantity / dailyRate);
    
    const depletionDate = new Date();
    depletionDate.setDate(depletionDate.getDate() + daysLeft);

    return { ...item.toObject(), daysLeft, depletionDate, dailyRate: dailyRate.toFixed(2) };
  });

  return forecast;
}

/**
 * Logica per generare consigli d'acquisto (scorta per 1 mese)
 */
async function getPurchaseRecommendationsLogic(userId) {
  // 1. Trova i rettili attivi con preferenze impostate
  const activeReptiles = await Reptile.find({
    user: userId,
    status: 'active',
    foodType: { $exists: true, $ne: '' },
    weightPerUnit: { $exists: true, $ne: null }
  });

  // 2. Mappa l'inventario attuale per una ricerca rapida
  const inventory = await FoodInventory.find({ user: userId });
  const inventoryMap = new Map();
  inventory.forEach(item => {
    const key = `${item.foodType}-${item.weightPerUnit}`;
    inventoryMap.set(key, item.quantity);
  });

  // 3. Aggrega il fabbisogno (quanti rettili mangiano cosa)
  const idealNeeds = new Map();
  activeReptiles.forEach(r => {
    const key = `${r.foodType}-${r.weightPerUnit}`;
    idealNeeds.set(key, (idealNeeds.get(key) || 0) + 1);
  });

  // 4. Calcola cosa comprare (fabbisogno per 4 settimane - scorte attuali)
  const recommendations = [];
  for (const [key, numReptiles] of idealNeeds.entries()) {
    const [foodType, weightPerUnitStr] = key.split('-');
    const weightPerUnit = Number(weightPerUnitStr);
    const qtyInStock = inventoryMap.get(key) || 0;

    // Assumiamo 4 pasti al mese per rettile (1 a settimana)
    const neededForOneMonth = numReptiles * 4;
    const toBuy = neededForOneMonth - qtyInStock;

    if (toBuy > 0) {
      recommendations.push({
        foodType,
        weightPerUnit,
        qtyInStock,
        neededForOneMonth,
        toBuy
      });
    }
  }
  return recommendations;
}


// --- NUOVI ENDPOINT API ---

/**
 * API: Calcolo di quando finirà il cibo
 */
export const getInventoryForecast = async (req, res) => {
  try {
    if (!await isInventoryAccessAllowed(req.user.userid)) {
      return res.status(403).json({ message: req.t('premium_only_feature') });
    }

    const forecast = await getInventoryForecastLogic(req.user.userid);
    res.json(forecast);

  } catch (err) {
    console.error('Error getting inventory forecast:', err);
    res.status(500).json({ message: req.t('error_inventory_forecast') });
  }
};

/**
 * API: Consiglio su cosa comprare in base ai rettili
 */
export const getPurchaseRecommendations = async (req, res) => {
  try {
    if (!await isInventoryAccessAllowed(req.user.userid)) {
      return res.status(403).json({ message: req.t('premium_only_feature') });
    }

    const recommendations = await getPurchaseRecommendationsLogic(req.user.userid);
    res.json(recommendations);

  } catch (err) {
    console.error('Error getting purchase recommendations:', err);
    res.status(500).json({ message: req.t('error_inventory_recommendations') });
  }
};


/**
 * CRON: Invia email automatica di avviso fine cibo
 * (Questa funzione va chiamata da uno scheduler, es. node-cron, ogni giorno)
 */
export const checkAndSendLowInventoryAlerts = async () => {
  console.log('Running CRON: checkAndSendLowInventoryAlerts...');
  
  // 1. Trova tutti gli utenti BREEDER verificati che vogliono ricevere email
  const usersToAlert = await User.find({
    'subscription.plan': 'BREEDER',
    'isVerified': true,
    'receiveFeedingEmails': true // Usiamo questo flag
  });

  const alertThresholdDays = 14; // Avvisa se le scorte finiscono entro 14 giorni

  for (const user of usersToAlert) {
    try {
      // 2. Calcola la previsione per l'utente
      const forecast = await getInventoryForecastLogic(user._id);
      
      const lowStockItems = forecast.filter(item => 
        item.daysLeft !== Infinity && item.daysLeft < alertThresholdDays
      );

      // 3. Se ci sono articoli in esaurimento, invia l'email
      if (lowStockItems.length > 0) {
        // 4. Genera anche i consigli d'acquisto da includere nell'email
        const recommendations = await getPurchaseRecommendationsLogic(user._id);
        
        const t = i18next.getFixedT(user.language || 'it');
        const subject = t('emails.lowInventory.subject', '🚨 Avviso Scorte Cibo - SnakeBee');

        // Costruisci il corpo dell'email
        let lowStockHtml = lowStockItems.map(item =>
          `<li><strong>${item.foodType} (${item.weightPerUnit}g):</strong> ${t('emails.lowInventory.remaining', 'Quantità: {{quantity}}, stimati {{daysLeft}} giorni.', { quantity: item.quantity, daysLeft: item.daysLeft })}</li>`
        ).join('');

        let recommendationsHtml = recommendations.length > 0
          ? recommendations.map(item =>
              `<li><strong>${item.foodType} (${item.weightPerUnit}g):</strong> ${t('emails.lowInventory.recommendation', 'Acquista {{toBuy}} unità (fabbisogno mensile).', { toBuy: item.toBuy })}</li>`
            ).join('')
          : `<li>${t('emails.lowInventory.noRecommendations', 'Nessun consiglio. Imposta cibo e peso preferiti nei profili dei tuoi rettili.')}</li>`;

        const dynamicHtml = `
          <h1 style="color:#CC3300;text-align:center;margin-bottom:25px;font-weight:700;">
            ${t('emails.lowInventory.title', 'Scorte di Cibo in Esaurimento!')}
          </h1>
          <p style="font-size:16px;line-height:1.5;margin-bottom:20px;">
            ${t('emails.lowInventory.intro', 'Ciao! Il nostro sistema ha calcolato che alcune delle tue scorte di cibo per rettili si stanno esaurendo:')}
          </p>
          <div style="background-color:#EDE7D6;padding:20px;border-radius:8px;margin-bottom:20px;">
            <h3 style="color:#556B2F;margin-top:0;">${t('emails.lowInventory.alertHeader', 'Articoli in esaurimento (meno di 14 giorni):')}</h3>
            <ul style="font-size:15px;line-height:1.6;padding-left:20px;">${lowStockHtml}</ul>
          </div>
          <div style="background-color:#EDE7D6;padding:20px;border-radius:8px;">
            <h3 style="color:#556B2F;margin-top:0;">${t('emails.lowInventory.recommendationHeader', 'Consigli per l\'acquisto:')}</h3>
            <p style="font-size:14px;margin-top:0;">${t('emails.lowInventory.recommendationIntro', 'In base ai tuoi rettili attivi, ti consigliamo di acquistare:')}</p>
            <ul style="font-size:15px;line-height:1.6;padding-left:20px;">${recommendationsHtml}</ul>
          </div>
          <div style="text-align:center;margin-top:30px;">
            <a href="${process.env.FRONTEND_URL}/inventory" style="background-color:#228B22;color:#FFD700;padding:14px 35px;border-radius:25px;text-decoration:none;font-weight:700;font-size:18px;display:inline-block;box-shadow:0 4px 8px rgba(34,139,34,0.3);">
              ${t('emails.lowInventory.button', 'Gestisci Inventario')}
            </a>
          </div>
        `;
        
        // Testo alternativo per client email che non supportano HTML
        const dynamicText = `${t('emails.lowInventory.title', 'Scorte di Cibo in Esaurimento!')}\n\n
          ${t('emails.lowInventory.intro', 'Ciao! Il nostro sistema ha calcolato che alcune delle tue scorte di cibo per rettili si stanno esaurendo:')}\n\n
          ${t('emails.lowInventory.alertHeader', 'Articoli in esaurimento (meno di 14 giorni):')}\n
          ${lowStockItems.map(item => `* ${item.foodType} (${item.weightPerUnit}g): ${t('emails.lowInventory.remaining', 'Quantità: {{quantity}}, stimati {{daysLeft}} giorni.', { quantity: item.quantity, daysLeft: item.daysLeft })}`).join('\n')}\n\n
          ${t('emails.lowInventory.recommendationHeader', 'Consigli per l\'acquisto:')}\n
          ${recommendations.map(item => `* ${item.foodType} (${item.weightPerUnit}g): ${t('emails.lowInventory.recommendation', 'Acquista {{toBuy}} unità (fabbisogno mensile).', { toBuy: item.toBuy })}`).join('\n')}\n\n
          ${t('emails.lowInventory.button', 'Gestisci Inventario')}: ${process.env.FRONTEND_URL}/inventory
        `;

        // 5. Invia l'email usando la funzione di broadcast (che usa il template)
        await sendBroadcastEmailToUser(user, subject, dynamicHtml, dynamicText);
        await logAction(user._id, "Sent Low Inventory Alert");

        console.log(`Sent low inventory alert to ${user.email}`);
      }
    } catch (err) {
      console.error(`Failed to process inventory alert for user ${user._id}:`, err);
    }
  }
  console.log('Finished CRON: checkAndSendLowInventoryAlerts.');
};