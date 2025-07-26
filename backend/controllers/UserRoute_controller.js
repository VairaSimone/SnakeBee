import User from "../models/User.js";
import Reptile from "../models/Reptile.js";
import Feeding from "../models/Feeding.js";
import Notification from "../models/Notification.js";
import Event from '../models/Event.js';
import Breeding from '../models/Breeding.js';

import RevokedToken from "../models/RevokedToken.js";
import jwt from "jsonwebtoken";
import cloudinary from '../config/CloudinaryConfig.js'; 

export const GetAllUser = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;

    const user = await User.find({})
      .sort({ name: 1 })
      .skip((page - 1) * perPage)
      .limit(perPage).select('-password -verificationCode -resetPasswordCode -refreshTokens -lastPasswordResetEmailSentAt -resetPasswordExpires -accountLockedUntil -loginAttempts'); if (!user) return res.status(404).json({ message: 'User not found' });
    ;

    const totalResults = await User.countDocuments();
    const totalPages = Math.ceil(totalResults / perPage);

    res.send({
      dati: user,
      totalPages,
      totalResults,
      page,
    });
  } catch (err) {
    res.status(500).send();
  }
};


export const GetIDUser = async (req, res) => {
  try {
    const id = req.params.userId;

    const user = await User.findById(id).select('-password -verificationCode -resetPasswordCode -refreshTokens -lastPasswordResetEmailSentAt -resetPasswordExpires -accountLockedUntil -loginAttempts'); if (!user) return res.status(404).json({ message: 'User not found' });
    ;
    if (!user) res.status(404).send();
    else res.send(user);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Not Found' });
  }
};

export const PutUser = async (req, res) => {
  try {
    const id = req.params.userId;
    const userData = req.body;

    if (userData.role && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You cannot change your role.' });
    }

    if (req.file) {
      // Qui prendi il file salvato da multer
      // Costruisci l'URL o path locale (dipende da come servi i file)
      userData.avatar = `/uploads/${req.file.filename}`;
    }

    const fieldsAllowed = ['name', 'avatar'];
    const updates = {};
    fieldsAllowed.forEach(field => {
      if (userData[field] !== undefined) {
        updates[field] = userData[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });
    res.send(updatedUser);
  } catch (err) {
    console.error('Errore aggiornamento utente:', err);
    res.status(500).send();
  }
};


export const updateEmailPreferences = async (req, res) => {
  try {
    const { receiveFeedingEmails } = req.body;
    if (typeof receiveFeedingEmails !== 'boolean') {
      return res.status(400).json({ message: 'Valore non valido per receiveFeedingEmails' });
    }
    const id = req.params.userId;

    const user = await User.findByIdAndUpdate(
      id,
      { receiveFeedingEmails },
      { new: true }
    );

    res.json({
      message: 'Preferenze aggiornate con successo',
      receiveFeedingEmails: user.receiveFeedingEmails
    });
  } catch (err) {
    console.error('Errore aggiornamento preferenze email:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};

export const DeleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utente non trovato' });

    // Trova tutti i rettili dell'utente
    const reptiles = await Reptile.find({ user: userId });

    // Per ogni rettile elimina feedings, eventi, notifiche
    for (const reptile of reptiles) {
      await Feeding.deleteMany({ reptile: reptile._id });
      await Event.deleteMany({ reptile: reptile._id });
      await Notification.deleteMany({ reptile: reptile._id });
    }

    // Elimina i rettili
    await Reptile.deleteMany({ user: userId });

    // Elimina riproduzioni legate all'utente
    await Breeding.deleteMany({ user: userId });

    // Elimina notifiche dell'utente
    await Notification.deleteMany({ user: userId });

    // Elimina utente
    await User.findByIdAndDelete(userId);

    // Revoca token se presente
    const token = req.header('Authorization')?.split(' ')[1];
    if (token) {
      const decoded = jwt.decode(token);
      if (decoded) {
        const revokedToken = new RevokedToken({
          token,
          expiresAt: new Date(decoded.exp * 1000),
        });
        await revokedToken.save();
      }
    }

    return res.status(200).json({ message: 'Utente e dati collegati eliminati con successo' });
  } catch (error) {
    console.error('Errore durante l\'eliminazione dell\'utente:', error);
    return res.status(500).json({ message: 'Errore del server' });
  }
};
