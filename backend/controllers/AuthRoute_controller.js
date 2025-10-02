import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { body, validationResult } from 'express-validator';
import RevokedToken from '../models/RevokedToken.js';
import crypto from 'crypto';
import { logSecurityEvent } from "../utils/securityLogger.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../config/mailer.config.js";
import { logAction } from "../utils/logAction.js";
import Stripe from "stripe";
import { sendReferralRewardEmail } from '../config/mailer.config.js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const MAX_VERIFICATION_EMAILS = 5;
async function pwnedPassword() {
  const { pwnedPassword } = await import("hibp");
  return pwnedPassword;
}

const isTempEmail = (email) => {
  const tempDomains = [
    "mailinator.com", "10minutemail.com", "guerrillamail.com",
    "tempmail.dev", "yopmail.com", "trashmail.com", "fakeinbox.com"
  ];
  const domain = email.split("@")[1].toLowerCase();
  return tempDomains.includes(domain);
};

const generateAccessToken = (user) => {
  return jwt.sign({ userid: user._id, role: user.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '30min' });
};

//generate the refresh token with a longer duration that will be used to request the access token
const generateRefreshToken = (user) => {
  return jwt.sign({ userid: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// Minimum time between sending the same email (in milliseconds)
const EMAIL_RESEND_COOLDOWN = 60 * 1000; // 60 seconds

// Password reset code validity time (in milliseconds)
const PASSWORD_RESET_CODE_EXPIRY = 60 * 60 * 1000; // 1 hour

export const validateLogin = [
  body('email').isEmail().withMessage('Email non valida'),
  body('password').notEmpty().withMessage('La password è obbligatoria'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];


export const login = async (req, res, next) => {
  try {
    const MAX_LOGIN_ATTEMPTS = 5;
    // Lock duration in milliseconds (15 minutes)
    const LOCKOUT_DURATION = 15 * 60 * 1000;

    const email = await req.body.email.toLowerCase();

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: req.t('credential_error') });
    if (user.accountLockedUntil && new Date() < user.accountLockedUntil) {
      const timeLeft = Math.ceil((user.accountLockedUntil - new Date()) / 1000);
      return res.status(403).json({ message: req.t('account_blocked', { time: timeLeft }) });
    }
    if (!user.password) {
      return res.status(400).json({ message: req.t('account_google') });
    }
    if (user.isBanned) {
      return res.status(403).json({ message: req.t('account_ban') });
    }
    // Check verified email
    if (!user.isVerified) {
      return res.status(403).json({ message: req.t('account_notVerify') });
    }
    if (user.role === 'banned') {
      return res.status(403).json({ message: req.t('account_ban') });
    }
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        // Blocca l'account per la durata specificata
        user.accountLockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
        await user.save();
        let lockout = LOCKOUT_DURATION / 60000
        return res.status(403).json({ message: req.t('account_blocked', { time: lockout }) });
      }
      return res.status(401).json({ message: req.t('credential_error') });
    }
    user.loginAttempts = 0;
    user.accountLockedUntil = null;
    await logAction(user._id, "Login");

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const hashedToken = await bcrypt.hash(refreshToken, 12);
    if (!user.refreshTokens) user.refreshTokens = [];
    if (user.refreshTokens.length >= 10) {
      user.refreshTokens = user.refreshTokens.slice(-9);
    }
    user.refreshTokens.push({ token: hashedToken });
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      path: '/api/v1',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    user.loginHistory = user.loginHistory || [];
    user.loginHistory.push({
      ip: req.ip,
      userAgent: req.get('User-Agent') || 'unknown',
    });
    if (user.loginHistory.length > 20) {
      user.loginHistory = user.loginHistory.slice(-20);
    }
    await user.save();
    return res.json({ accessToken });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: req.t('server_error') });
  }
};

export const register = async (req, res, next) => {
  try {
    const { ref: referralCode } = req.query; // Leggi il codice di invito dalla URL
    const normalizedEmail = req.body.email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: req.t('Email_duplicated') });
    }
    if (!req.body.privacyConsent) {
      return res.status(400).json({ message: req.t('privacyPolicy') });
    }
    
    const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const count = await pwnedPassword(req.body.password);
    if (count > 0) {
      return res.status(400).json({ message: req.t('password_error') });
    }

    if (isTempEmail(normalizedEmail)) {
      return res.status(400).json({ message: req.t('temporary_email') });
    }

    // INIZIO: Logica per gestire l'invito
    let referrer = null;
    if (referralCode) {
        referrer = await User.findOne({ referralCode });
        // Ignora il codice se non è valido o se l'utente ha già invitato qualcuno
        if (!referrer || referrer.hasReferred) {
            referrer = null; 
        }
    }
    // FINE: Logica per gestire l'invito

    const lang = req.body.language && ['it', 'en'].includes(req.body.language)
      ? req.body.language
      : 'it';
    const pwd = await bcrypt.hash(req.body.password, 12);
    const newUser = new User({
      name: req.body.name,
      email: normalizedEmail,
      password: pwd,
      avatar: req.body.avatar,
      language: lang,
      verificationCode,
      isVerified: false,
      referredBy: referrer ? referrer._id : null, // Salva chi ha invitato l'utente
      privacyConsent: {
        accepted: req.body.privacyConsent === true,
        timestamp: new Date()
      }
    });
    newUser.registrationInfo = {
      ip: req.ip,
      userAgent: req.get('User-Agent') || 'unknown',
      createdAt: new Date()
    };
    
    await newUser.save();
    await sendVerificationEmail(newUser.email, newUser.language, verificationCode);
    res.status(201).json({ message: req.t('verifyEmail')});
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: req.t('Email_duplicated') });
    }
    next(e);
  }
}

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userid).select('-password -verificationCode -resetPasswordCode -refreshTokens -lastPasswordResetEmailSentAt -resetPasswordExpires -accountLockedUntil -loginAttempts'); if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: req.t('server_error') });
  }
};

export const logout = async (req, res) => {
  const token = req.cookies?.refreshToken;
  // Idempotente: se non c'è cookie, pulisco e fine
  if (!token) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      path: '/api/v1',
    });
    return res.status(204).end();
  }

  try {
    // VERIFICA (non solo decode) per evitare CastError e token manipolati
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // Se manca userid nel payload, consideralo invalido/idempotente
    if (!decoded?.userid) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'None',
        secure: true,
        path: '/api/v1',
      });
      return res.status(204).end();
    }

    const user = await User.findById(decoded.userid).select('refreshTokens');
    if (!user) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'None',
        secure: true,
        path: '/api/v1',
      });
      return res.status(204).end();
    }

    // Difesa: se non è un array, normalizza a []
    const tokens = Array.isArray(user.refreshTokens) ? user.refreshTokens : [];

    const keep = [];
    let matched = false;

    for (const rt of tokens) {
      // salta record malformati
      if (!rt?.token) continue;
      const isSame = await bcrypt.compare(token, rt.token);
      if (isSame) matched = true;
      else keep.push(rt);
    }

    // Aggiorna lista token
    user.refreshTokens = keep;
    await user.save();

    // Registra il revoke (hash salato, come già fai)
    try {
      const hashedRevoked = await bcrypt.hash(token, 12);
      await RevokedToken.create({
        token: hashedRevoked,
        // se exp manca, revoca per 7 giorni da ora
        expiresAt: decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    } catch (e) {
      // Non bloccare il logout se il log di revoke fallisce
      console.warn('RevokedToken save failed:', e);
    }

    // In ogni caso pulisco il cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      path: '/api/v1',
    });

    // Se non c’era match, non leakare info: logout idempotente
    return res.status(200).json({ message: req.t('logout_successfully') });
  } catch (err) {
    // Token scaduto/invalid: pulizia e 204 (niente drammi)
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      path: '/api/v1',
    });
    return res.status(204).end();
  }
};

export const callBackGoogle = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, googleId, name, email } = req.user;
    if (!accessToken || !refreshToken) return res.status(401).send(req.t('auth_fail'));

    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({
        googleId,
        name: name || "User",
        email,
        avatar: req.user.avatar,
        privacyConsent: {
          accepted: true,
          timestamp: new Date()
        }
      });
      user.loginHistory = user.loginHistory || [];
      user.loginHistory.push({
        ip: req.ip,
        userAgent: req.get('User-Agent') || 'unknown',
      });
      if (user.loginHistory.length > 20) {
        user.loginHistory = user.loginHistory.slice(-20);
      }
      await user.save();
    }


    const hashedToken = await bcrypt.hash(refreshToken, 12);
    if (!user.refreshTokens) user.refreshTokens = [];
    if (user.refreshTokens.length >= 10) {
      user.refreshTokens = user.refreshTokens.slice(-9);
    }
    user.refreshTokens.push({ token: hashedToken });
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      path: '/api/v1',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${process.env.FRONTEND_URL}/login-google-callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
  } catch (err) {
    console.error("Google authentication error:", err);
    res.status(500).send(req.t('server_error'));
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: req.t('invalid_value') });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: req.t('confirmPassword') });
    }
    // Retrieve the logged in user using the ID obtained from the token
    const user = await User.findById(req.user.userid);
    if (!user) {
      return res.status(404).json({ message: req.t('user_notFound') });
    }
    if (!user.password) {
      return res.status(400).json({ message: req.t('googlePassword') });
    }

    // Verify that the old password matches
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: req.t('passwordOld') });
    }

    const count = await pwnedPassword(req.body.password);
    if (count > 0) {
      return res.status(400).json({ message: req.t('password_error') });
    }
    // Hash of the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await logAction(user._id, "Cange password");

    // Save the update to the database
    await user.save();
    await logSecurityEvent({
      userId: user.id,
      action: "PASSWORD_CHANGED",
      req
    });

    res.status(200).json({ message: req.t('passwordUpdate') });
  } catch (error) {
    next(error);
  }
};


export const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: req.t('email_invalid') });
    }

    const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });

    if (!user || user.isVerified) {
      return res.status(200).json({ message: req.t('email_reset') });
    }

    if (user.verificationEmailAttempts >= MAX_VERIFICATION_EMAILS) {
      return res.status(429).json({ message: req.t('account_maxVerificationEmails') });
    }

    const timeSinceLastSend = Date.now() - new Date(user.lastVerificationEmailSentAt).getTime();
    if (timeSinceLastSend < EMAIL_RESEND_COOLDOWN) {
      const timeLeft = Math.ceil((EMAIL_RESEND_COOLDOWN - timeSinceLastSend) / 1000);
      return res.status(429).json({ message: req.t('account_blocked', { time: timeLeft }) });
    }

    const newVerificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    user.verificationCode = newVerificationCode;
    user.lastVerificationEmailSentAt = new Date();
    user.verificationEmailAttempts = (user.verificationEmailAttempts || 0) + 1;
    await user.save();

    await sendVerificationEmail(user.email, user.language, newVerificationCode);

    res.json({ message: req.t('verification_email_sent') });

  } catch (e) {
    console.error("Errore nel rinvio dell'email di verifica:", e);
    next(e);
  }
};


export const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: req.t('invalid_value') });
    }

    const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
    if (!user) {
      return res.status(404).json({ message: req.t('user_notFound') });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: req.t('email_alreadyVerified') });
    }

    if (user.verificationCode !== code.toUpperCase()) {
      return res.status(400).json({ message: req.t('invalid_verification_code') });
    }

    if (user.referredBy && !user.isVerified) {
        const referrer = await User.findById(user.referredBy);

        // Controlla se chi ha invitato esiste e non ha già ricevuto un premio
        if (referrer && !referrer.hasReferred) {
            referrer.hasReferred = true; // Imposta che ha ricevuto il premio

            // 1. Crea un coupon Stripe del 30% (se non esiste già)
            const couponId = 'REFERRAL30';
            let coupon;
            try {
                coupon = await stripe.coupons.retrieve(couponId);
            } catch (error) {
                if (error.statusCode === 404) {
                    coupon = await stripe.coupons.create({
                        id: couponId,
                        percent_off: 30,
                        duration: 'once',
                        name: 'Sconto del 30% per invito',
                    });
                } else {
                    throw error; // Lancia altri errori
                }
            }
            
            // 2. Crea un codice promozionale univoco e monouso
            const promotionCode = await stripe.promotionCodes.create({
                coupon: coupon.id,
                max_redemptions: 1,
                code: `COUPON-${referrer.name.toUpperCase().replace(/\s/g, '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
            });

            // 3. Invia l'email di ricompensa
            await sendReferralRewardEmail(referrer.email, referrer.language, referrer.name, promotionCode.code);
            
            await referrer.save();
        }
    }
    // FINE: Logica di ricompensa per il referral

    await logAction(user._id, "Verify-email");

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    res.json({ message: req.t('email_verified_success') });
  } catch (e) {
    next(e);
  }
};

export const changeEmailAndResendVerification = async (req, res, next) => {
  try {
    const { newEmail, password } = req.body;
    const userId = req.user.userid;

    if (!newEmail || !password) {
      return res.status(400).json({ message: req.t('invalid_value') });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: req.t('user_notFound') });

    if (!user.password) {
      return res.status(400).json({ message: req.t('googlePassword') });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: req.t('passwordOld') });
    }

    if (newEmail === user.email) {
      return res.status(400).json({ message: req.t('email_same') });
    }

    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return res.status(400).json({ message: req.t('Email_duplicated') });
    }

    const timeSinceLast = user.lastVerificationEmailSentAt
      ? Date.now() - new Date(user.lastVerificationEmailSentAt).getTime()
      : EMAIL_RESEND_COOLDOWN;

    if (timeSinceLast < EMAIL_RESEND_COOLDOWN) {
      const timeLeft = Math.ceil((EMAIL_RESEND_COOLDOWN - timeSinceLast) / 1000);
      return res.status(429).json({ message: req.t('account_blocked', { time: timeLeft }) });
    }

    await logAction(user._id, "Change-Email");

    const code = crypto.randomBytes(3).toString("hex").toUpperCase();
    user.email = newEmail;
    user.isVerified = false;
    user.verificationCode = code;
    user.lastVerificationEmailSentAt = new Date();
    await user.save();

    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'None',
      path: "/api/v1",
      secure: true,
    });

    await sendVerificationEmail(newEmail, user.language, code);
    res.json({ message: req.t('email_changed'), forceLogout: true });

  } catch (e) {
    console.error("Error changing email address:", e);
    next(e);
  }
};


// Controller to request password reset
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: req.t('email_invalid') });
    }

    const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });

    if (!user) {
      return res.status(200).json({ message: req.t('email_reset') });
    }

    // Control rate limiting for password reset
    if (user.lastPasswordResetEmailSentAt) {
      const timeSinceLastSend = Date.now() - new Date(user.lastPasswordResetEmailSentAt).getTime();
      if (timeSinceLastSend < EMAIL_RESEND_COOLDOWN) {
        console.warn(`Rate limit hit for password reset email to ${user.email}`);
        return res.status(200).json({ message: req.t('email_reset') });
      }
    }

    // Generate a unique reset code (e.g. 6 hexadecimal characters)
    const resetCode = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 caratteri

    // Set the expiration date (e.g. 1 hour from now)
    const resetExpires = new Date(Date.now() + PASSWORD_RESET_CODE_EXPIRY);

    // Save the reset code and expiration in the user
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = resetExpires;
    user.lastPasswordResetEmailSentAt = new Date();
    await user.save();

    try {
      await sendPasswordResetEmail(user.email, user.language, resetCode);
      res.status(200).json({ message: req.t('email_reset') });
    } catch (emailError) {
      console.error("Critical error sending password reset email:", emailError);
      res.status(500).json({ message: req.t('email_error') });
    }


  } catch (e) {
    console.error("Error in password reset request:", e);
    next(e);
  }
};

// Controller to reset password using code
export const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;
    const count = await pwnedPassword(req.body.newPassword);
    if (count > 0) {
      return res.status(400).json({ message: req.t('password_error') });
    }
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: req.t('invalid_value') });
    }
    const user = await User.findOne({

      email: new RegExp(`^${email}$`, 'i'),
      resetPasswordCode: code.toUpperCase()

    });

    // If the user was not found with that code OR the code is null
    if (!user) {
      return res.status(400).json({ message: req.t('Code_reset_error') });
    }

    // Check if the code has expired
    if (user.resetPasswordExpires < new Date()) {
      user.resetPasswordCode = null;
      user.resetPasswordExpires = null;
      await user.save();
      return res.status(400).json({ message: req.t('Code_reset_expired') });
    }

    await logAction(user._id, "Reset-password");

    // If the code is valid and has not expired:
    // 1. Hasher the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // 2. Update the user's password
    user.password = hashedNewPassword;

    // 3. Invalidate the reset code
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null
    user.lastPasswordResetEmailSentAt = null;

    // 4. Save the user
    await user.save();
    await logSecurityEvent({
      userId: user.id,
      action: "PASSWORD_CHANGED",
      req
    });

    res.status(200).json({ message: req.t('password_reset') });

  } catch (e) {
    console.error("Password reset error:", e);
    next(e);
  }
};

