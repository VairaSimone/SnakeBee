// controllers/FoodInventoryController.js
import FoodInventory from '../models/FoodInventory.js';

export const getInventory = async (req, res) => {
  try {
    if (!req.user || !req.user.userid) {
      return res.status(401).json({ message: 'Utente non autenticato' });
    }

    const inventory = await FoodInventory.find({ user: req.user.userid });
    res.json(inventory);
  } catch (err) {
    console.error('Errore nel recupero dell\'inventario:', err);
    res.status(500).json({ message: 'Errore nel recupero dell\'inventario' });
  }
};

export const updateInventoryItem = async (req, res) => {
  const { id } = req.params;
  const { quantity, weightPerUnit } = req.body;

  try {
    const item = await FoodInventory.findOneAndUpdate(
      { _id: id, user: req.user.userid },
      { quantity, weightPerUnit },
      { new: true }
    );

    if (!item) return res.status(404).json({ message: 'Elemento non trovato' });

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Errore nell\'aggiornamento dell\'elemento' });
  }
};

export const addInventoryItem = async (req, res) => {
  const { foodType, quantity, weightPerUnit } = req.body;
  const userId = req.user.userid; // <-- Preso dal token JWT

 try {
    // Cerca se esiste già un item con stesso tipo e peso per unità
    const existing = await FoodInventory.findOne({
      user: userId,
      foodType,
      weightPerUnit, // deve combaciare anche il peso per unità
    });

    if (existing) {
      // Se già esiste, somma la quantità ma NON toccare il weightPerUnit
existing.quantity = Number(existing.quantity) + Number(quantity);
      await existing.save();
      return res.json(existing);
    }

    // Altrimenti, crea un nuovo elemento
    const newItem = new FoodInventory({
      user: userId,
      foodType,
      quantity,
      weightPerUnit,
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore nella creazione dell\'elemento' });
  }
};

export const deleteFeeding = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await FoodInventory.findOneAndDelete({
      _id: id,
      user: req.user.userid,
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Elemento non trovato o già eliminato' });
    }

    res.json({ message: 'Elemento eliminato con successo' });
  } catch (err) {
    console.error('Errore durante eliminazione:', err);
    res.status(500).json({ message: 'Errore durante l\'eliminazione dell\'elemento' });
  }
};
