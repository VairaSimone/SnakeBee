import Feeding from "../models/Feeding.js";
import Reptile from '../models/Reptile.js';
import FoodInventory from '../models/FoodInventory.js';
import mongoose from "mongoose";


export const GetReptileFeeding = async (req, res) => {
  try {
    const reptileId = req.params.reptileId;
    const page = parseInt(req.query.page) || 1;
    const perPage = 5;

    const feedings = await Feeding.find({ reptile: reptileId })
      .sort({ date: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    if (!feedings) return res.status(404).json({ message: 'No feeding records found' });

    const totalResults = await Feeding.countDocuments({ reptile: reptileId });
    const totalPages = Math.ceil(totalResults / perPage);

    res.json({
      dati: feedings,
      totalPages,
      totalResults,
      page,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Server error' });
  }
};


export const PostFeeding = async (req, res) => {
  const { reptileId } = req.params;
  const {
    foodType, // ora è sempre stringa (nome tipo alimento, o custom)
    quantity,
    weightPerUnit,
    notes,
    date,
    daysUntilNextFeeding,
    wasEaten,
    retryAfterDays,
  } = req.body;

  try {
    const feedingDate = new Date(date || Date.now());
    let nextFeedingDate;

    if (wasEaten) {
      nextFeedingDate = new Date(feedingDate);
      nextFeedingDate.setDate(nextFeedingDate.getDate() + parseInt(daysUntilNextFeeding));
    } else {
      nextFeedingDate = new Date(feedingDate);
      nextFeedingDate.setDate(nextFeedingDate.getDate() + parseInt(retryAfterDays || 3));
    }

    const reptile = await Reptile.findById(reptileId);
    if (!reptile) return res.status(404).json({ message: 'Reptile not found' });

    // Se è un alimento standard ed è stato mangiato, aggiorna l'inventario
    const meatTypes = ['Topo', 'Ratto', 'Coniglio', 'Pulcino'];
    if (wasEaten && meatTypes.includes(foodType)) {
      const inventoryItem = await FoodInventory.findOne({
        user: reptile.user,
        foodType: foodType,
        weightPerUnit: weightPerUnit,
      });

      if (!inventoryItem || inventoryItem.quantity < quantity) {
        return res.status(400).json({
          message: `Not enough ${foodType.toLowerCase()} in inventory`,
        });
      }

      inventoryItem.quantity -= quantity;
      await inventoryItem.save();
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
      retryAfterDays: wasEaten ? undefined : retryAfterDays,
    });

    const savedFeeding = await newFeeding.save();
    res.status(201).json(savedFeeding);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating feeding record' });
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
    if (!updatedFeeding) return res.status(404).json({ message: 'Feeding record not found' });
    res.json(updatedFeeding);
  } catch (error) {
    res.status(500).json({ message: 'Error updating power record' });
  }
};


export const DeleteFeeding = async (req, res) => {
  const { feedingId } = req.params;

  try {
    const feeding = await Feeding.findByIdAndDelete(feedingId);
    if (!feeding) return res.status(404).json({ message: 'Feeding record not found' });
    res.json({ message: 'Power record deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting power record' });
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
