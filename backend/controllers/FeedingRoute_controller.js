import mongoose from "mongoose";
import Feeding from "../models/Feeding.js";
import Reptile from '../models/Reptile.js';
import FoodInventory from '../models/FoodInventory.js';
import { logAction } from "../utils/logAction.js";

export const GetReptileFeeding = async (req, res) => {
  try {
    const { reptileId } = req.params;
    const reptile = await Reptile.findById(reptileId);
    if (!reptile) return res.status(404).json({ message: req.t('reptile_notFound') });
    if (reptile.user.toString() !== req.user.userid)
      return res.status(403).json({ message: req.t('user_notFound')  });

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

    const feedingDate = new Date(date || Date.now());
    let nextFeedingDate = new Date(feedingDate);
const delta = parseInt(req.body.retryAfterDays, 10);
    nextFeedingDate.setDate(nextFeedingDate.getDate() + delta);

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
      await inv.save();
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
    res.status(500).json({ message:  req.t('errorUpdate_feeding') });
  }
};


export const DeleteFeeding = async (req, res) => {
  const { feedingId } = req.params;

  try {
    const feeding = await Feeding.findByIdAndDelete(feedingId);
    if (!feeding) return res.status(404).json({ message: req.t('Feeding_notfound') });
    res.json({ message:  req.t('feeding_delete')});
  } catch (error) {
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
