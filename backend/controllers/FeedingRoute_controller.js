import mongoose from "mongoose";
import Feeding from "../models/Feeding.js";
import Reptile from '../models/Reptile.js';
import FoodInventory from '../models/FoodInventory.js';
import { logAction } from "../utils/logAction.js";
import { DateTime } from 'luxon';

export const GetReptileFeeding = async (req, res) => {
  try {
    const { reptileId } = req.params;
    const reptile = await Reptile.findById(reptileId);
    if (!reptile) return res.status(404).json({ message: req.t('reptile_notFound') });
    if (reptile.user.toString() !== req.user.userid)
      return res.status(403).json({ message: req.t('user_notFound') });

    const page = parseInt(req.query.page) || 1;
    const perPage = 5;
    const [feedings, totalResults] = await Promise.all([
      Feeding.find({ reptile: reptileId })
        .sort({ date: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage),
      Feeding.countDocuments({ reptile: reptileId })
    ]);
    res.json({
      dati: feedings,
      totalPages: Math.ceil(totalResults / perPage),
      totalResults,
      page,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: req.t('server_error') });
  }
};

export const PostFeeding = async (req, res) => {
  try {
    const { reptileId } = req.params;
    const {
      foodType,
      quantity,
      weightPerUnit,
      notes,
      date,
      wasEaten,
      retryAfterDays
    } = req.body;

    // 1. Interpreta il timestamp ISO ricevuto (es. "2025-10-25T22:00:00.000Z")
    const utcDate = DateTime.fromISO(date, { zone: 'utc' });
    // 2. Convertilo nel fuso orario dell'utente (Rome)
    const romeDate = utcDate.setZone('Europe/Rome');
    // 3. Estrai la data *calendario* (es. "2025-10-26")
    const feedingDateString = romeDate.toISODate();
    // 4. Crea un oggetto data "pulito" a mezzanotte UTC (es. "2025-10-26T00:00:00.000Z")
    const feedingDate = DateTime.fromISO(feedingDateString, { zone: 'utc' });

    const delta = parseInt(req.body.retryAfterDays, 10);
    // Calcola la data successiva partendo dalla data pulita
    const nextFeedingDate = feedingDate.plus({ days: delta }).toISODate(); // Produce '2025-11-02'
    const reptile = await Reptile.findById(reptileId);
    if (!reptile) return res.status(404).json({ message: req.t('reptile_notFound') });
    if (reptile.user.toString() !== req.user.userid)
      return res.status(403).json({ message: req.t('user_notFound') });

    // Inventario: decremento solo lato server
    const meatTypes = ['Topo', 'Ratto', 'Coniglio', 'Pulcino'];
    if (wasEaten && meatTypes.includes(foodType)) {
      const inv = await FoodInventory.findOne({
        user: reptile.user,
        foodType,
        weightPerUnit
      });
      if (!inv || inv.quantity < quantity)
        return res.status(400).json({ message: req.t('foodTypeQuantity') });
      inv.quantity -= quantity;
      if (inv.quantity === 0) {
        await inv.deleteOne(); // Elimina il documento se la quantità è 0
      } else {
        await inv.save(); // Altrimenti, salva la nuova quantità
      }
    }


    const newFeeding = new Feeding({
      reptile: reptileId,
      date: feedingDate,
      nextFeedingDate,
      foodType,
      quantity,
      weightPerUnit,
      notes,
      wasEaten,
      retryAfterDays: wasEaten ? undefined : retryAfterDays
    });
    await logAction(req.user.userid, "Create Feeding");

    const saved = await newFeeding.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: req.t('errorCreate_feeding') });
  }
};

export const PutFeeding = async (req, res) => {
  const { feedingId } = req.params;
  const { foodType, quantity, notes, date } = req.body;

  try {
    const updatedFeeding = await Feeding.findByIdAndUpdate(feedingId, {
      foodType,
      quantity,
      notes,
      date,
    }, { new: true });
    if (!updatedFeeding) return res.status(404).json({ message: req.t('Feeding_notfound') });
    res.json(updatedFeeding);
  } catch (error) {
    res.status(500).json({ message: req.t('errorUpdate_feeding') });
  }
};


export const DeleteFeeding = async (req, res) => {
  const { feedingId } = req.params;

  try {
    // 1. Trova il feeding e popola i dati del rettile (per avere l'ID utente)
    const feeding = await Feeding.findById(feedingId).populate('reptile');
    
    if (!feeding) {
      return res.status(404).json({ message: req.t('Feeding_notfound') });
    }

    // 2. [SICUREZZA] Verifica che l'utente che cancella sia il proprietario
    //    (Questo controllo mancava nella tua versione originale)
    if (feeding.reptile.user.toString() !== req.user.userid) {
        return res.status(403).json({ message: req.t('user_notAuthorized') }); // Assicurati di avere questa traduzione
    }

    // 3. Logica di ripristino inventario
    const meatTypes = ['Topo', 'Ratto', 'Coniglio', 'Pulcino'];
    
    // Ripristina l'inventario SOLO se il pasto era stato segnato come mangiato
    // e se è un tipo di cibo tracciato
    if (feeding.wasEaten && meatTypes.includes(feeding.foodType)) {
      
      // Cerca l'item di inventario e incrementa la sua quantità.
      // Se l'item era stato cancellato (perché a 0), 'upsert: true' 
      // lo ricreerà automaticamente.
      await FoodInventory.findOneAndUpdate(
        { 
          user: feeding.reptile.user, // ID utente preso dal rettile
          foodType: feeding.foodType, 
          weightPerUnit: feeding.weightPerUnit 
        },
        { $inc: { quantity: feeding.quantity } }, // Incrementa la quantità
        { upsert: true } // Opzione fondamentale: crea se non esiste
      );
    }

    // 4. Ora che l'inventario è a posto, elimina il feeding
    await feeding.deleteOne(); // o await Feeding.findByIdAndDelete(feedingId);

    res.json({ message: req.t('feeding_delete') });

  } catch (error) {
    console.error(error); // È buona norma loggare l'errore effettivo
    res.status(500).json({ message: req.t('errorDelete_feeding') });
  }
};
export const feedingRefusalRate = async (req, res) => {
  const userId = req.user.userid;

  const feedings = await Feeding.aggregate([
    {
      $lookup: {
        from: 'Reptile',
        localField: 'reptile',
        foreignField: '_id',
        as: 'reptileData'
      }
    },
    { $unwind: '$reptileData' },
    { $match: { 'reptileData.user': new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$wasEaten',
        count: { $sum: 1 }
      }
    }
  ]);

  const total = feedings.reduce((acc, val) => acc + val.count, 0);
  const refused = feedings.find(f => f._id === false)?.count || 0;

  res.json({
    total,
    refused,
    refusalRate: total > 0 ? ((refused / total) * 100).toFixed(2) + '%' : '0%'
  });
};

export const PostMultipleFeedings = async (req, res) => {
  try {
    const {
      reptileIds, // Array di ID dei rettili
      foodType,
      quantity,
      weightPerUnit,
      notes,
      date,
      wasEaten,
      retryAfterDays
    } = req.body;

    const userId = req.user.userid;

    // 1. Validazione input
    if (!Array.isArray(reptileIds) || reptileIds.length === 0) {
      return res.status(400).json({ message: req.t('reptileIds_required_array') });
    }

    // 1. Interpreta il timestamp ISO ricevuto (es. "2025-10-25T22:00:00.000Z")
    const utcDate = DateTime.fromISO(date, { zone: 'utc' });
    // 2. Convertilo nel fuso orario dell'utente (Rome)
    const romeDate = utcDate.setZone('Europe/Rome');
    // 3. Estrai la data *calendario* (es. "2025-10-26")
    const feedingDateString = romeDate.toISODate();
    // 4. Crea un oggetto data "pulito" a mezzanotte UTC (es. "2025-10-26T00:00:00.000Z")
    const feedingDate = DateTime.fromISO(feedingDateString, { zone: 'utc' });

    const delta = parseInt(req.body.retryAfterDays, 10);
    // Calcola la data successiva partendo dalla data pulita
    const nextFeedingDate = feedingDate.plus({ days: delta }).toISODate(); // Produce '2025-11-02'
    // 3. Verifica proprietà dei rettili
    const reptiles = await Reptile.find({
      '_id': { $in: reptileIds },
      'user': userId
    });

    // Se il numero di rettili trovati non corrisponde a quelli richiesti,
    // significa che alcuni ID non esistono o non appartengono all'utente.
    if (reptiles.length !== reptileIds.length) {
      return res.status(403).json({ message: req.t('reptile_mismatch_or_notfound') });
    }

    // 4. Gestione inventario (in blocco)
    const meatTypes = ['Topo', 'Ratto', 'Coniglio', 'Pulcino'];
    if (wasEaten && meatTypes.includes(foodType)) {
      const totalQuantityNeeded = quantity * reptiles.length; // Quantità totale

      const inv = await FoodInventory.findOne({
        user: userId,
        foodType,
        weightPerUnit
      });

      if (!inv || inv.quantity < totalQuantityNeeded) {
        return res.status(400).json({ message: req.t('foodTypeQuantity') });
      }

      // Decrementa l'inventario del totale
      inv.quantity -= totalQuantityNeeded;
      if (inv.quantity === 0) {
        await inv.deleteOne(); // Elimina il documento se la quantità è 0
      } else {
        await inv.save(); // Altrimenti, salva la nuova quantità
      }
    }

    // 5. Creazione dei documenti di feeding
    const newFeedingsData = reptiles.map(reptile => ({
      reptile: reptile._id,
      date: feedingDate,
      nextFeedingDate,
      foodType,
      quantity,
      weightPerUnit,
      notes,
      wasEaten,
      retryAfterDays: wasEaten ? undefined : retryAfterDays
    }));

    // 6. Inserimento multiplo nel database (molto efficiente)
    const savedFeedings = await Feeding.insertMany(newFeedingsData);

    await logAction(userId, "Create Multiple Feedings");

    res.status(201).json(savedFeedings);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: req.t('errorCreate_feeding') });
  }
};