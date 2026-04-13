import GoogleStrategy from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import Stripe from "stripe";
import { sendReferralRewardEmail } from '../config/mailer.config.js';
import crypto from 'crypto';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const handleReferralReward = async (referrerId, newUser) => {
  try {
    const referrer = await User.findById(referrerId);
if (!referrer) return;
referrer.referralCount = (referrer.referralCount || 0) + 1;
    // 1. Gestione del Coupon Stripe del 30% (Comune a entrambi)
    const couponId = 'REFERRAL30n';
    let coupon;
    try {
      coupon = await stripe.coupons.retrieve(couponId);
    } catch (error) {
      if (error.statusCode === 404) {
        coupon = await stripe.coupons.create({
          id: couponId,
          percent_off: 30,
          duration: 'once',
          name: 'Benvenuto 30%',
        });
      } else {
        throw error;
      }
    }

    // 2. PREMIO PER CHI HA INVITATO (Referrer)

    if (!referrer.hasReferred) {
      referrer.hasReferred = true;

      const promoCodeReferrer = await stripe.promotionCodes.create({
        coupon: coupon.id,
        max_redemptions: 1,
        code: `REF-${referrer.name.toUpperCase().replace(/\s/g, '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
      });

      await sendReferralRewardEmail(referrer.email, referrer.language, referrer.name, promoCodeReferrer.code);
    }
  
    // 3. PREMIO PER IL NUOVO UTENTE (Appena registrato con Google)
    const promoCodeInvited = await stripe.promotionCodes.create({
      coupon: coupon.id,
      max_redemptions: 1,
      code: `WELCOME-${newUser.name.toUpperCase().replace(/\s/g, '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
    });

    await sendReferralRewardEmail(newUser.email, newUser.language, newUser.name, promoCodeInvited.code);
          await referrer.save();

    console.log(`Referral completato: coupon inviati a ${newUser.email} e (se idoneo) a ${referrer?.email}`);

  } catch (error) {
    console.error(`Errore nella ricompensa referral (Google Auth):`, error);
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

      if (req.query.state) {
        try {
          const state = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
          const { referralCode } = state;
  
          if (referralCode) {
            const referrer = await User.findOne({ referralCode: referralCode });
            if (referrer) {
              user.referredBy = referrer._id; 
              console.log(`Nuovo utente ${user.email} invitato da ${referrer.email}`);
            }
          }
        } catch (e) {
            console.error("Errore nel parsing dello stato del referral:", e);
        }
      }
    }
    await user.save();

    if (isNewUser && user.referredBy) {
        await handleReferralReward(user.referredBy, user);
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