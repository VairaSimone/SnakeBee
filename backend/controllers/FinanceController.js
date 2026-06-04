import Transaction from '../models/Transaction.js';
import Reptile from '../models/Reptile.js';
import Feeding from '../models/Feeding.js';
import Event from '../models/Event.js';
import mongoose from 'mongoose';
// --- CRUD PER TRANSAZIONI MANUALI ---

export const createTransaction = async (req, res) => {
  try {
    const newTransaction = new Transaction({
      ...req.body,
      user: req.user.userid
    });
    const saved = await newTransaction.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: req.t('server_error') });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.userid }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: req.t('server_error') });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const deleted = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user.userid });
    if (!deleted) return res.status(404).json({ message: req.t('invalid_value') });
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ message: req.t('server_error') });
  }
};

// --- RIEPILOGO FINANZIARIO GLOBALE ---


export const getFinancialSummary = async (req, res) => {
  try {
    // 1. LA MAGIA È QUI: Convertiamo esplicitamente l'ID in ObjectId
    const userId = new mongoose.Types.ObjectId(req.user.userid);

    // 2. Trova tutti i rettili dell'utente per poter filtrare Eventi e Feedings
    const userReptiles = await Reptile.find({ user: userId }).select('_id');
    const reptileIds = userReptiles.map(r => r._id);

    // Eseguiamo tutte le query di aggregazione in parallelo per la massima performance
    const [
      reptilesBought, 
      reptilesSold, 
      vetCosts, 
      foodCosts, 
      manualTransactions
    ] = await Promise.all([
      
      // Costo Acquisto Animali
      Reptile.aggregate([
        { $match: { user: userId, 'purchasePrice.amount': { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$purchasePrice.amount' } } }
      ]),

      // Ricavo Vendita Animali (solo se lo status è 'ceded' o isSold è true)
      Reptile.aggregate([
        { $match: { 
            user: userId, 
            $or: [{ status: 'ceded' }, { isSold: true }],
            'price.amount': { $gt: 0 } 
        }},
        { $group: { _id: null, total: { $sum: '$price.amount' } } }
      ]),

      // Costi Veterinari
      Event.aggregate([
        { $match: { reptile: { $in: reptileIds }, type: 'vet', 'cost.amount': { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$cost.amount' } } }
      ]),

      // Costi Cibo Consumato
      Feeding.aggregate([
        { $match: { reptile: { $in: reptileIds }, wasEaten: true, mealCost: { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$mealCost' } } }
      ]),

      // Transazioni Manuali (Terrari, fiere, etc.)
      Transaction.aggregate([
        { $match: { user: userId } },
        { $group: { 
            _id: '$type', // Raggruppa per 'income' o 'expense'
            total: { $sum: '$amount' } 
        }}
      ])
    ]);

    // Estrazione sicura dei totali (se l'array è vuoto, il totale è 0)
    const totalAnimalsBought = reptilesBought[0]?.total || 0;
    const totalAnimalsSold = reptilesSold[0]?.total || 0;
    const totalVet = vetCosts[0]?.total || 0;
    const totalFood = foodCosts[0]?.total || 0;

    const manualIncome = manualTransactions.find(t => t._id === 'income')?.total || 0;
    const manualExpense = manualTransactions.find(t => t._id === 'expense')?.total || 0;

    // Calcolo bilancio finale
    const totalIncome = totalAnimalsSold + manualIncome;
    const totalExpense = totalAnimalsBought + totalVet + totalFood + manualExpense;
    const netProfit = totalIncome - totalExpense;

    // Strutturiamo la risposta
    res.json({
      overview: {
        totalIncome: Number(totalIncome.toFixed(2)),
        totalExpense: Number(totalExpense.toFixed(2)),
        netProfit: Number(netProfit.toFixed(2))
      },
      breakdown: {
        incomes: {
          animalsSold: Number(totalAnimalsSold.toFixed(2)),
          custom: Number(manualIncome.toFixed(2))
        },
        expenses: {
          animalsBought: Number(totalAnimalsBought.toFixed(2)),
          veterinary: Number(totalVet.toFixed(2)),
          foodConsumed: Number(totalFood.toFixed(2)),
          custom: Number(manualExpense.toFixed(2))
        }
      }
    });

  } catch (error) {
    console.error("Error in getFinancialSummary:", error);
    res.status(500).json({ message: req.t('server_error') });
  }
};