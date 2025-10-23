import User from "../models/User.js";
import Stripe from "stripe";
import { sendReferralRewardEmail } from '../config/mailer.config.js';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const REFERRAL_COUPON_ID = 'REFERRAL30'; // Meglio se in .env

/**
 * Gestisce la creazione e l'invio di una ricompensa per un referral.
 * @param {string} referrerId - L'ID dell'utente che ha invitato.
 */
export const handleReferralReward = async (referrerId) => {
  try {
    const referrer = await User.findById(referrerId);

    // Controlla se chi ha invitato esiste e non ha già ricevuto un premio
    if (referrer && !referrer.hasReferred) {
        referrer.hasReferred = true; // Imposta subito per evitare race conditions

        // 1. Recupera o crea il Coupon Stripe
        let coupon;
        try {
            coupon = await stripe.coupons.retrieve(REFERRAL_COUPON_ID);
        } catch (error) {
            if (error.statusCode === 404) {
                // Se il coupon non esiste, lo crea
                coupon = await stripe.coupons.create({
                    id: REFERRAL_COUPON_ID,
                    percent_off: 30,
                    duration: 'once',
                    name: 'Sconto 30% per invito (Referral)',
                });
            } else {
                throw error; // Lancia altri errori di Stripe
            }
        }
        
        // 2. Crea un Codice Promozionale univoco e monouso
        const promoCode = await stripe.promotionCodes.create({
            coupon: coupon.id,
            max_redemptions: 1,
            // Genera un codice univoco
            code: `REF-${referrer.name.toUpperCase().replace(/\s/g, '').substring(0, 8)}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
        });

        // 3. Invia l'email di ricompensa
        await sendReferralRewardEmail(
            referrer.email, 
            referrer.language, 
            referrer.name, 
            promoCode.code
        );
        
        // 4. Salva l'utente
        await referrer.save();
        console.log(`Ricompensa referral inviata con successo a ${referrer.email}`);
    }
  } catch (error) {
    console.error(`Errore critico durante la gestione della ricompensa referral per referrerId: ${referrerId}`, error);
    // Potresti voler rimettere referrer.hasReferred = false se qualcosa fallisce,
    // o implementare un sistema di tentativi. Per ora, logghiamo l'errore.
  }
};