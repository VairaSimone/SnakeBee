import FoodInventory from '../models/FoodInventory.js';
import User from '../models/User.js';
import { logAction } from '../utils/logAction.js';
import Reptile from '../models/Reptile.js';
import Feeding from '../models/Feeding.js';
import mongoose from 'mongoose';
async function isInventoryAccessAllowed(userId) {
  const user = await User.findById(userId);
  return user?.subscription?.plan === 'BREEDER';
}


export const getInventory = async (req, res) => {
  try {
    if (!req.user || !req.user.userid) {
      return res.status(401).json({ message:  req.t('user_notFound') });
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
  const { quantity, weightPerUnit } = req.body;

  if (!isInventoryAccessAllowed(req.user.userid)) {
    return res.status(403).json({ message: req.t('premium_only_feature')  });
  }

  try {
    const item = await FoodInventory.findOneAndUpdate(
      { _id: id, user: req.user.userid },
      { quantity, weightPerUnit },
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
    return res.status(403).json({ message: req.t('premium_only_feature')  });
  }

  try {
    // Check if an item with the same type and weight per unit already exists
    const existing = await FoodInventory.findOne({
      user: userId,
      foodType,
      weightPerUnit,
    });

    if (existing) {
      // If it already exists, add the quantity but do NOT touch the weightPerUnit
      existing.quantity = Number(existing.quantity) + Number(quantity);
      await existing.save();
      return res.json(existing);
    }

    // Otherwise, create a new element
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
    return res.status(403).json({ message: req.t('premium_only_feature')  });
  }

  try {
    const deleted = await FoodInventory.findOneAndDelete({
      _id: id,
      user: req.user.userid,
    });

    if (!deleted) {
      return res.status(404).json({ message: req.t('invalid_value')});
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

    if (!await isInventoryAccessAllowed(userId)) {
      return res.status(403).json({ message: req.t('premium_only_feature') });
    }

    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);

    // Aggregation Pipeline per ottenere SOLO l'ultimo pasto per ogni rettile
    const validFeedings = await Feeding.aggregate([
      // Fase 1: Ordina tutti i pasti dal più recente al più vecchio
      { $sort: { date: -1 } },
      
      // Fase 2: Raggruppa per rettile e prendi solo il primo documento (il più recente)
      {
        $group: {
          _id: "$reptile", // Raggruppa per ID del rettile
          latestFeeding: { $first: "$$ROOT" } // Prendi l'intero documento del pasto più recente
        }
      },

      // Fase 3: Sostituisci la struttura del documento con quella del pasto più recente
      { $replaceRoot: { newRoot: "$latestFeeding" } },

      // Fase 4: Ora che abbiamo solo i pasti più recenti, filtriamo quelli la cui prossima data di pasto è passata
      { $match: { nextFeedingDate: { $lte: todayUTC } } },

      // Fase 5: "Popola" manualmente i dati del rettile per verificare l'utente proprietario
      {
        $lookup: {
          from: "Reptile", // Nome della collezione dei rettili
          localField: "reptile",
          foreignField: "_id",
          as: "reptileInfo"
        }
      },
      
      // Fase 6: Decomprimi l'array 'reptileInfo' creato da $lookup
      { $unwind: "$reptileInfo" },

      // Fase 7: Filtra per i rettili che appartengono all'utente corrente
      { $match: { "reptileInfo.user": new mongoose.Types.ObjectId(userId) } },
      
      // Fase 8: Rinomina 'reptileInfo' in 'reptile' per coerenza con il codice originale
      { $addFields: { reptile: "$reptileInfo" } },
      { $project: { reptileInfo: 0 } }
    ]);
    
    if (validFeedings.length === 0) {
      return res.json({ message: req.t('no_feeding_today'), suggestions: [] });
    }

    // Il resto della logica per raggruppare il cibo necessario rimane invariato
    const needed = {};
    validFeedings.forEach(f => {
      const foodType = f.foodType.trim(); // Aggiunto .trim() per rimuovere spazi come in " topi"
      const weightPerUnit = f.weightPerUnit;
      const key = `${foodType}_${weightPerUnit}`;

      if (!needed[key]) {
        needed[key] = {
          foodType: foodType,
          weightPerUnit: weightPerUnit,
          quantity: 0
        };
      }
      // La quantità viene dal campo 'quantity' del record di alimentazione
      needed[key].quantity += f.quantity; 
    });

    const inventory = await FoodInventory.find({ user: userId });

    const suggestions = Object.values(needed).map(item => {
      const stock = inventory.find(
        i => i.foodType === item.foodType && i.weightPerUnit === item.weightPerUnit
      );

      if (!stock) {
        return { ...item, available: 0, warning: 'food_not_found' };
      }

      if (stock.quantity < item.quantity) {
        return { ...item, available: stock.quantity, warning: 'not_enough_stock' };
      }

      return { ...item, available: stock.quantity, warning: null };
    });

    res.json({ suggestions });

  } catch (err) {
    console.error('Error generating feeding suggestions:', err);
    res.status(500).json({ message: req.t('error_inventory') });
  }
};