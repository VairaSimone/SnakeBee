import User from "../models/User.js";
import Reptile from "../models/Reptile.js";
import Feeding from "../models/Feeding.js";
import Notification from "../models/Notification.js";
import Event from '../models/Event.js';
import Breeding from '../models/Breeding.js';
import RevokedToken from "../models/RevokedToken.js";
import jwt from "jsonwebtoken";
import { deleteFileIfExists } from "../utils/deleteFileIfExists.js";
import { logAction } from "../utils/logAction.js";
import Stripe from "stripe";
import { sendStripeNotificationEmail } from '../config/mailer.config.js';
import { validateItalianTaxCode } from "../utils/checktaxCode.js";
import crypto from 'crypto';
import { syncReptileFeedingDates } from '../utils/syncReptileFeedings.js';
import { sendDelegateInvitationEmail } from '../config/mailer.config.js'; // Importala qui
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
export const GetAllUser = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;

    const user = await User.find({})
      .sort({ name: 1 })
      .skip((page - 1) * perPage)
      .limit(perPage).select('-password -verificationCode -resetPasswordCode -refreshTokens -lastPasswordResetEmailSentAt -resetPasswordExpires -accountLockedUntil -loginAttempts'); if (!user) return res.status(404).json({ message: req.t('user_notFound') });
    ;
if (!user || user.length === 0) {
      return res.status(404).json({ message: req.t('user_notFound') });
    }
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

    const user = await User.findById(id).select('-password -verificationCode -resetPasswordCode -refreshTokens -lastPasswordResetEmailSentAt -resetPasswordExpires -accountLockedUntil -loginAttempts'); if (!user) return res.status(404).json({ message: req.t('user_notFound') });
    ;
    if (!user) res.status(404).send();
    else res.send(user);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: req.t('user_notFound') });
  }
};

export const PutUser = async (req, res) => {
  try {
    const id = req.user.userid;
    const userData = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: req.t('user_notFound') });

    if (userData.role && req.user.role !== 'admin') {
      return res.status(403).json({ message: req.t('user_NotModifyRole') });
    }

    if (req.file) {
      if (user.avatar) {
        await deleteFileIfExists(user.avatar);
      }
      userData.avatar = `/uploads/${req.file.filename}`;
    }
    await logAction(req.user.userid, "Moodify User");

    const fieldsAllowed = ['name', 'avatar', 'language', 'address', 'phoneNumber', 'isPublic', 'social'];
    if (userData.language && !['en', 'it', 'fr', 'de'].includes(userData.language)) {
      return res.status(400).json({ message: req.t('invalid_language') });
    }
    if ('isPublic' in userData) {
         const isPublicBool = userData.isPublic === 'true' || userData.isPublic === true;
      if (isPublicBool) {
        const plan = user.subscription?.plan || 'NEOPHYTE';
        const status = user.subscription?.status;
        const isActive = status === 'active' || status === 'pending_cancellation';
if (!isActive || plan === 'NEOPHYTE') {
          return res.status(403).json({ 
            message: "Devi avere un abbonamento attivo (Apprentice o superiore) per rendere il profilo pubblico" 
          });
        }
      }
    }
    const updates = {};
    fieldsAllowed.forEach(field => {
      if (userData[field] !== undefined) {
        if (field === 'isPublic') {
          updates[field] = userData[field] === 'true' || userData[field] === true;
        } else {
          updates[field] = userData[field];
        }
      }
    });

    // --- NUOVA GESTIONE SOCIALS ---
    // Aggiungiamo i campi social all'oggetto 'updates'
    // Mongoose può gestire l'aggiornamento di campi nidificati usando la dot notation
if (userData.socialsFacebook !== undefined) {
  // Rimuove l'eventuale URL intero lasciando solo lo username
  const cleanedFB = userData.socialsFacebook
    .trim()
    .replace(/^(https?:\/\/)?(www\.)?facebook\.com\//i, '')
    .replace(/\/$/, '');
  updates['socials.facebook'] = cleanedFB;
}

if (userData.socialsInstagram !== undefined) {
  // Rimuove l'eventuale URL intero lasciando solo lo username
  const cleanedIG = userData.socialsInstagram
    .trim()
    .replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '')
    .replace(/\/$/, '');
  updates['socials.instagram'] = cleanedIG;
}
    // --- FINE NUOVA GESTIONE ---

    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });
    res.send(updatedUser);
  } catch (err) {
    console.error('User update error:', err);
    res.status(500).send();
  }
};
// Aggiungi questa funzione alla fine del file UserRoute_controller.js

export const completeOnboarding = async (req, res) => { 
  try {
    const userId = req.user.userid; // Recupera l'ID dal token
    const user = await User.findById(userId);
    
    if (!user) return res.status(404).json({ message: req.t('user_notFound') });

    // Inizializza l'oggetto onboarding se non esiste (fondamentale per utenti vecchi)
    if (!user.onboarding) {
        user.onboarding = { hasSeenTutorial: false, emailsSent: [] };
    }

    // Segna il tutorial come visto
    user.onboarding.hasSeenTutorial = true;
    
    // Aggiorna opzionalmente nome e preferenze email se inviati dal frontend
    if (req.body.name) user.name = req.body.name;
    if (typeof req.body.receiveFeedingEmails === 'boolean') {
        user.receiveFeedingEmails = req.body.receiveFeedingEmails;
    }

    await user.save();
    
    // Log dell'azione (opzionale, se usi il sistema di log)
    try {
        await logAction(userId, "Onboarding Completed");
    } catch (logErr) {
        console.warn("Log action failed", logErr);
    }

    res.json({ message: "Onboarding completato", user });
  } catch (err) {
    console.error("Errore completeOnboarding:", err);
    res.status(500).json({ message: req.t('server_error') });
  }
};
export const updateEmailPreferences = async (req, res) => {
  try {
    const { receiveFeedingEmails } = req.body;
    if (typeof receiveFeedingEmails !== 'boolean') {
      return res.status(400).json({ message: req.t('invalid_value') });
    }
    const id = req.params.userId;

    const user = await User.findByIdAndUpdate(
      id,
      { receiveFeedingEmails },
      { new: true }
    );

    res.json({
      message: req.t('preferences_updated'),
      receiveFeedingEmails: user.receiveFeedingEmails
    });
  } catch (err) {
    console.error('Error updating email preferences:', err);
    res.status(500).json({ message: req.t('server_error') });
  }
};

async function cancelStripeSubscription(user) {
  const subId = user.subscription?.stripeSubscriptionId;
  const subStatus = user.subscription?.status;

  if (subId && ['active', 'incomplete', 'past_due', 'pending_cancellation'].includes(subStatus)) {
    try {
      await stripe.subscriptions.cancel(subId);
      await logAction(user._id, 'stripe_subscription_cancelled_on_user_deletion', `Sub ID: ${subId}`);
      return true;
    } catch (err) {
      console.error('Stripe cancellation error:', err);
      throw new Error(req.t('delete_Stripe'));
    }
  }
  return false;
}

async function deleteUserRelatedData(userId) {
  const reptiles = await Reptile.find({ user: userId });

  for (const reptile of reptiles) {
    await Feeding.deleteMany({ reptile: reptile._id });
    await Event.deleteMany({ reptile: reptile._id });
    await Notification.deleteMany({ reptile: reptile._id });

    if (reptile.image) await deleteFileIfExists(reptile.image);
  }

  await Reptile.deleteMany({ user: userId });
  await Breeding.deleteMany({ user: userId });
  await Notification.deleteMany({ user: userId });
}

async function revokeUserToken(token) {
  if (!token) return;
  const decoded = jwt.decode(token);
  if (!decoded) return;

  const revokedToken = new RevokedToken({
    token,
    expiresAt: new Date(decoded.exp * 1000),
  });
  await revokedToken.save();
}

export const DeleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: req.t('user_notFound') });

    try {
      await cancelStripeSubscription(user);
    } catch (stripeErr) {
      return res.status(500).json({ message: stripeErr.message });
    }
    await deleteUserRelatedData(userId);
    if (user.avatar) {
      await deleteFileIfExists(user.avatar);
    }

    await User.findByIdAndDelete(userId);

    const token = req.header('Authorization')?.split(' ')[1];
    await revokeUserToken(token);

    await logAction(req.user.userid, "user_deleted", `User deleted ${userId}`);

    sendStripeNotificationEmail(
      user.email,
      user.language,
      req.t('emails.delete_user.subject'),
      req.t('emails.delete_user.html', { name: user.name }),
      req.t('emails.delete_user.text', { name: user.name })
    ).catch(e => console.error('Error sending cancellation confirmation email:', e));


    return res.status(200).json({ message: req.t('delete_successfully') });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: req.t('server_error') });
  }
};

export const UpdateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'banned'].includes(role)) {
      return res.status(400).json({ message: req.t('role_invalid') });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: req.t('user_notFound') });

    user.role = role;

    if (role === 'banned') {
      user.refreshTokens = [];
    }

    await user.save();
    return res.json({ message: req.t('role_add', { rol: role }), user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('role_add_error') });
  }
};

export const removeDelegate = async (req, res) => {
    try {
        const { delegateId } = req.params; // ID dell'utente da rimuovere
        const masterUserId = req.user.userid;

        const masterUser = await User.findById(masterUserId);
        
        masterUser.delegates = masterUser.delegates.filter(
            d => d.user.toString() !== delegateId
        );
        
        await masterUser.save();

        res.status(200).json({ message: "Collaboratore rimosso con successo." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getAccessibleWorkspaces = async (req, res) => {
    try {
        const loggedInUserId = req.user.userid;

        // Cerca tutti gli utenti che hanno il mio ID nel loro array 'delegates'
        const workspaces = await User.find(
            { "delegates.user": loggedInUserId },
            "name email" // Modifica con i campi che usi per identificare l'allevamento (es. 'farmName' o 'firstName', 'lastName')
        );

        res.status(200).json(workspaces);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getMyDelegates = async (req, res) => {
    try {
        const userId = req.user.userid;
        // Popoliamo i dati dell'utente per avere nome/email del collaboratore
        const user = await User.findById(userId).populate('delegates.user', 'firstName lastName email');
        
        if (!user) return res.status(404).json({ message: "Utente non trovato" });

        res.status(200).json(user.delegates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const addDelegate = async (req, res) => {
    try {
        const { email, role } = req.body; // email del collaboratore da aggiungere
        const masterUserId = req.user.userid;

        // 1. Trova l'utente da aggiungere
        const delegateUser = await User.findOne({ email });
        if (!delegateUser) {
            return res.status(404).json({ message: "Utente non trovato con questa email." });
        }

        // 2. Evita che un utente aggiunga se stesso
        if (delegateUser._id.toString() === masterUserId.toString()) {
            return res.status(400).json({ message: "Non puoi aggiungere te stesso come collaboratore." });
        }

        // 3. Trova l'utente principale
        const masterUser = await User.findById(masterUserId);

        // 4. Controlla se è già un delegato
        const alreadyExists = masterUser.delegates.some(
            d => d.user.toString() === delegateUser._id.toString()
        );
        if (alreadyExists) {
            return res.status(400).json({ message: "Questo utente è già un tuo collaboratore." });
        }

        // 5. Aggiungi il delegato
        masterUser.delegates.push({ user: delegateUser._id, role: role || 'editor' });
        await masterUser.save();
await sendDelegateInvitationEmail(
            delegateUser.email, 
            delegateUser.language || 'it', 
            masterUser.name, 
            masterUser.name // O usa il campo del nome allevamento se lo hai
        );
        res.status(200).json({ message: "Collaboratore aggiunto con successo!", delegate: delegateUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const updateFiscalDetails = async (req, res) => {
  try {
    const userId = req.user?.userid;
    if (!userId) return res.status(401).json({ error: 'not_authenticated' });

    const { taxCode } = req.body;
    if (!taxCode) return res.status(400).json({ error: 'missing_taxCode' });

    const normalized = String(taxCode).toUpperCase().replace(/\s+/g, '');

    if (!validateItalianTaxCode(normalized)) {
      return res.status(400).json({ error: 'invalid_taxCode' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'user_notFound' });

    user.fiscalDetails = user.fiscalDetails || {};
    user.fiscalDetails.taxCode = normalized;

    await user.save();
    await logAction(user._id, 'fiscal_taxcode_updated', `CF Update`);

    res.status(200).json({ success: true, fiscalDetails: { taxCode: normalized } });
  } catch (error) {
    console.error('updateFiscalDetails error:', error);
    res.status(500).json({ error: 'server_error' });
  }
};


export const generateReferralLink = async (req, res) => {

  try {
    const userId = req.user.userid || req.user.id || req.user._id;
    const user = await User.findById(userId);

    if (!user) {

      return res.status(404).json({ message: req.t('user_notFound') });
    }

    

    if (!user.referralCode) {
      user.referralCode = crypto.randomBytes(5).toString('hex');
      await user.save();
    }

    const referralLink = `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`;

    res.status(200).json({ referralLink });

  } catch (error) {

    console.error('Error generating referral link:', error);
    res.status(500).json({ message: req.t('server_error') });
  }
};


export const migrateAllReptilesFeedings = async (req, res) => {
    try {
        // Trova tutti i rettili (usiamo il cursore per non saturare la RAM del server)
        const cursor = Reptile.find({ status: 'active' }).cursor();
        let count = 0;

        for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
            await syncReptileFeedingDates(doc._id);
            count++;
        }

        res.status(200).json({ message: `Migrazione completata con successo. Aggiornati ${count} rettili.` });
    } catch (err) {
        console.error("Errore migrazione:", err);
        res.status(500).json({ error: "Errore durante la migrazione" });
    }
};


