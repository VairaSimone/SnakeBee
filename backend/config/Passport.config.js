import GoogleStrategy from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcrypt";
// In un file come utils/referralUtils.js
import Stripe from "stripe";
import { sendReferralRewardEmail } from '../config/mailer.config.js';
import crypto from 'crypto';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const handleReferralReward = async (referrerId) => {
  try {
    const referrer = await User.findById(referrerId);

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
        console.log(`Ricompensa inviata con successo a ${referrer.email}`);
    }
  } catch (error) {
    console.error(`Errore durante la gestione della ricompensa referral per referrerId: ${referrerId}`, error);
    // Potresti voler aggiungere un sistema di logging più robusto qui
  }
};

// Google strategy for access
const googleStrategy = new GoogleStrategy({
  clientID: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: `${process.env.BACKEND_URL}${process.env.GOOGLE_CALLBACK}`,
  passReqToCallback: true
}, async function (req, googleAccessToken, googleRefreshToken, profile, passportNext) {
  const { name, sub: googleId, email, picture } = profile._json;
  const googleStoredRefreshToken = googleRefreshToken;

  try {
    // Search or create the user in the DB
    // First, search for the user by Google ID or (if not available) by email:
    let user = await User.findOne({
      $or: [
        { googleId: googleId },
        { email: profile._json.email }
      ]
    });

    const isNewUser = !user; 

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
      }
if (googleRefreshToken && googleRefreshToken !== user.googleStoredRefreshToken) {
  user.googleStoredRefreshToken = googleRefreshToken;
}
    } else {
      user = new User({
        googleId,
        name: name || "SnakeBee",
        email,
        avatar: picture,
        googleStoredRefreshToken,
        isVerified: true
      });

       // ---- INIZIO LOGICA REFERRAL ----
      if (req.query.state) {
        try {
          const state = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
          const { referralCode } = state;
  
          if (referralCode) {
            // Trova l'utente che ha invitato tramite il suo codice referral
            const referrer = await User.findOne({ referralCode: referralCode });
            if (referrer) {
              user.referredBy = referrer._id; // Associa il nuovo utente al suo referente
              console.log(`Nuovo utente ${user.email} invitato da ${referrer.email}`);
            }
          }
        } catch (e) {
            console.error("Errore nel parsing dello stato del referral:", e);
        }
      }
      // ---- FINE LOGICA REFERRAL ----
    }
    await user.save();

        // Se l'utente è nuovo ed è stato invitato, invia la ricompensa
    if (isNewUser && user.referredBy) {
        await handleReferralReward(user.referredBy);
    }
    // Let's generate our JWT tokens
    const appAccessToken = jwt.sign(
      { userid: user._id, role: user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "30min", algorithm: "HS256" }
    );
    const appRefreshToken = jwt.sign(
      { userid: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Hash and save the JWT refresh token to the DB
    const hashed = await bcrypt.hash(appRefreshToken, 12);
    user.refreshTokens = user.refreshTokens || [];
    if (user.refreshTokens.length >= 10) {
      user.refreshTokens = user.refreshTokens.slice(-9);
    }
    user.refreshTokens.push({ token: hashed });
    await user.save();

    // Let's send everything back to Passport
    return passportNext(null, {
      accessToken: appAccessToken,
      refreshToken: appRefreshToken,
      googleId: user.googleId,
      name: user.name,
      email: user.email,
      avatar: user.avatar
    });
  } catch (err) {
    console.error("Google Authentication Error: ", err);
    return passportNext(err, null);
  }
});

export default googleStrategy;