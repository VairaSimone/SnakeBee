import Breeding from '../models/Breeding.js';
import Reptile from '../models/Reptile.js';
import mongoose from 'mongoose';

import { validateDatesSequence } from '../utils/validators.js';

export const createBreeding = async (req, res) => {
  const {
    male, female,
    pairingDate, ovulationDate, clutchDate,
    incubationStart, incubationEnd, incubationNotes,
    notes, hatchlings = []
  } = req.body;
  const userId = req.user.userid;

  // validazione preliminare
  if (male === female)
    return res.status(400).json({ message: "Non puoi accoppiare lo stesso animale" });

  const [maleR, femaleR] = await Promise.all([
    Reptile.findById(male), Reptile.findById(female)
  ]);
  if (!maleR || !femaleR)
    return res.status(404).json({ message: "Uno dei due rettili non esiste" });
  if (maleR.user.toString() !== userId || femaleR.user.toString() !== userId)
    return res.status(403).json({ message: "I rettili devono appartenere allo stesso utente" });

  // controllo coerenza date
  const seqErr = validateDatesSequence({ pairingDate, ovulationDate, clutchDate, incubationStart, incubationEnd });
  if (seqErr) return res.status(400).json({ message: seqErr });

  try {
const year = pairingDate ? new Date(pairingDate).getFullYear() : new Date().getFullYear();
    const events = [];
    if (pairingDate) events.push({ type: 'pairing', date: new Date(pairingDate), notes });
    if (ovulationDate)    events.push({ type: 'ovulation',    date: new Date(ovulationDate) });
    if (clutchDate)       events.push({ type: 'clutch',       date: new Date(clutchDate) });
    if (incubationStart)  events.push({ type: 'incubationStart', date: new Date(incubationStart) });
    if (incubationEnd)    events.push({ type: 'incubationEnd',   date: new Date(incubationEnd) });

    const breeding = new Breeding({
      male, female, user: userId,
      pairingDate, ovulationDate, clutchDate,
      incubationStart, incubationEnd, incubationNotes, notes,
      seasonYear: year,
      events, hatchlings
    });
    const saved = await breeding.save();
    return res.status(201).json({ message: 'Creato con successo', breeding: saved });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Errore nella creazione dell’evento di riproduzione' });
  }
};


export const getBreedingForReptile = async (req, res) => {
  const { reptileId } = req.params;

  try {
    const breedings = await Breeding.find({
      $or: [{ male: reptileId }, { female: reptileId }]
    })
    .populate('male', 'name species sex')
    .populate('female', 'name species sex')
    .sort({ pairingDate: -1 });

    res.json(breedings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore nel recupero delle riproduzioni per rettile' });
  }
};
export const getBreedingByUser = async (req, res) => {
const userId = req.user.userid;
  const page     = parseInt(req.query.page) || 1;
  const perPage  = parseInt(req.query.perPage) || 10;

  try {
    const [breedings, total] = await Promise.all([
      Breeding.find({ user: userId })
        .populate('male', 'name species sex')
        .populate('female', 'name species sex')
        .sort({ pairingDate: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage),
      Breeding.countDocuments({ user: userId })
    ]);

    res.json({
      dati: breedings,
      page,
      perPage,
      totalResults: total,
      totalPages: Math.ceil(total / perPage)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore nel recupero delle riproduzioni' });
  }
};
export const getReptileBreedingSummary = async (req, res) => {
  const { reptileId } = req.params;
  const userId = req.user.userid;

  try {
    const summary = await Breeding.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(userId),
          $or: [
            { male: mongoose.Types.ObjectId(reptileId) },
            { female: mongoose.Types.ObjectId(reptileId) }
          ]
        }
      },
      {
        $group: {
          _id: '$seasonYear',
          breedCount: { $sum: 1 },
          hatchlingsCount: { $sum: { $size: '$hatchlings' } }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.json({ reptileId, summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore nel calcolo del riepilogo' });
  }
};

export const updateBreeding = async (req, res) => {
  const { breedingId } = req.params;
  const userId = req.user.userid;
  const { events, hatchlings, notes } = req.body;

  try {
    const breeding = await Breeding.findById(breedingId);
    if (!breeding) return res.status(404).json({ message: "Riproduzione non trovata" });

    // Check che l'utente sia il proprietario
    if (breeding.user.toString() !== userId) {
      return res.status(403).json({ message: "Non autorizzato" });
    }

    // Validazione sequenza eventi
    const error = validateDatesSequence(events);
    if (error) {
      return res.status(400).json({ message: error });
    }

    // Aggiornamento completo
    breeding.events = events;
    breeding.hatchlings = hatchlings;
    breeding.notes = notes;

    const updated = await breeding.save();
    res.status(200).json({ message: 'Riproduzione aggiornata', breeding: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore durante l’aggiornamento' });
  }
};


export const deleteBreeding = async (req, res) => {
  const { breedingId } = req.params;
  try {
    const deleted = await Breeding.findByIdAndDelete(breedingId);
    if (!deleted)
      return res.status(404).json({ message: "Evento non trovato" });


    res.json({ message: "Evento di riproduzione eliminato" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore durante l’eliminazione' });
  }
};

export const addEventToBreeding = async (req, res) => {
  const { breedingId } = req.params;
  const { type, date, notes } = req.body;

  try {
    const breeding = await Breeding.findById(breedingId);
    if (!breeding) return res.status(404).json({ message: "Riproduzione non trovata" });


    const newEvent = { type, date: new Date(date), notes };
    breeding.events.push(newEvent);

    await breeding.save();
    res.status(200).json({ message: 'Evento aggiunto correttamente', breeding });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore durante l’aggiunta dell’evento' });
  }
};

export const addHatchlingToBreeding = async (req, res) => {
  const { breedingId } = req.params;
  const { morph, weight, sex, photoUrl } = req.body;

  try {
    const breeding = await Breeding.findById(breedingId);
    if (!breeding) return res.status(404).json({ message: "Riproduzione non trovata" });


    breeding.hatchlings.push({ morph, weight, sex, photoUrl });
    await breeding.save();

    res.status(200).json({ message: 'Hatchling aggiunto correttamente', breeding });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore durante l’aggiunta del hatchling' });
  }
};

export const getSeasonRecap = async (req, res) => {
  const { year } = req.params;
  const userId = req.user.userid;

  try {
    const breedings = await Breeding.find({
      user: userId,
      seasonYear: parseInt(year)
    })
    .populate('male', 'name species sex')
    .populate('female', 'name species sex')
    .sort({ pairingDate: 1 });

    res.json({
      season: year,
      count: breedings.length,
      data: breedings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore nel recupero della stagione' });
  }
};
