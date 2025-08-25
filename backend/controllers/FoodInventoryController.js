import FoodInventory from '../models/FoodInventory.js';
import User from '../models/User.js';
import { logAction } from '../utils/logAction.js';

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
