import GoogleStrategy from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import Stripe from "stripe";
import crypto from "crypto";
import { sendReferralRewardEmail } from "./mailer.config.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Google strategy for access
const googleStrategy = new GoogleStrategy({
  clientID: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: `${process.env.BACKEND_URL}${process.env.GOOGLE_CALLBACK}`,
  passReqToCallback: true
},

  async function (req, googleAccessToken, googleRefreshToken, profile, passportNext) {
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
          isVerified: true,
          googleStoredRefreshToken,         privacyConsent: {
                    accepted: true,
                    timestamp: new Date()
                }
        });


         const refCode = req.session.refCode;
            if (refCode) {
                const referrer = await User.findOne({ referralCode: refCode });
                
                // Controlla se chi ha invitato è valido
                if (referrer && !referrer.hasReferred) {
                    newUser.referredBy = referrer._id; // Collega il nuovo utente a chi lo ha invitato

                    // Attiva immediatamente la ricompensa
                    referrer.hasReferred = true;

                    // 1. Crea coupon/codice promozionale su Stripe
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
                            throw error;
                        }
                    }
                    const promotionCode = await stripe.promotionCodes.create({
                        coupon: coupon.id,
                        max_redemptions: 1,
                        code: `COUPON-${referrer.name.toUpperCase().replace(/\s/g, '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
                    });

                    // 2. Invia l'email di ricompensa
                    await sendReferralRewardEmail(referrer.email, referrer.language, referrer.name, promotionCode.code);
                    await referrer.save();

                    // 3. Pulisci la sessione
                    delete req.session.refCode;
                }
            }
            // =========================================================
            // FINE: LOGICA DI RICOMPENSA REFERRAL
            // =========================================================

            user = newUser; // Assegna il nuovo utente alla variabile 'user' per il resto della funzione
      }
      await user.save();
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
