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

const fieldsAllowed = ['name', 'avatar', 'language', 'address', 'phoneNumber'];
    if (userData.language && !['en', 'it'].includes(userData.language)) {
      return res.status(400).json({ message: req.t('invalid_language') });
    }

    const updates = {};
    fieldsAllowed.forEach(field => {
      if (userData[field] !== undefined) {
        updates[field] = userData[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });
    res.send(updatedUser);
  } catch (err) {
    console.error('User update error:', err);
    res.status(500).send();
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
