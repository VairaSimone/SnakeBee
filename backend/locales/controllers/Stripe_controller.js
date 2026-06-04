import stripe from 'stripe';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendStripeNotificationEmail } from '../config/mailer.config.js';
import { logAction } from "../utils/logAction.js";
import i18next from 'i18next';

function setPeriodEndIfLater(user, newDate) {
  if (!newDate) return false;
  const newTs = newDate instanceof Date ? newDate.getTime() : (new Date(newDate)).getTime();
  const oldTs = user.subscription?.currentPeriodEnd ? new Date(user.subscription.currentPeriodEnd).getTime() : 0;
  if (newTs > oldTs) {
    user.subscription.currentPeriodEnd = new Date(newTs);
    return true;
  }
  return false;
}

const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
const subscriptionPlans = {
  monthly: {
    APPRENTICE: process.env.STRIPE_PRICE_ID_APPRENTICE,
    PRACTITIONER: process.env.STRIPE_PRICE_ID_PRACTITIONER,
    BREEDER: process.env.STRIPE_PRICE_ID_BREEDER,
  },
  yearly: {
    APPRENTICE: process.env.STRIPE_PRICE_ID_APPRENTICE_YEARLY,
    PRACTITIONER: process.env.STRIPE_PRICE_ID_PRACTITIONER_YEARLY,
    BREEDER: process.env.STRIPE_PRICE_ID_BREEDER_YEARLY,
  }
};

function parsePeriodEnd(obj) {
  const ts1 = obj.current_period_end;
  const ts2 = obj.items?.data[0]?.current_period_end;
  const ts = ts1 ?? ts2;
  if (!ts || typeof ts !== 'number') return null;
  return new Date(ts * 1000);
}
/**
 * @param {string} priceId -Stripe Price ID.
 * @returns {string|null} - The name of the plan or null if not found.
 */

const getPlanNameByPriceId = (priceId) => {
  for (const interval of ['monthly', 'yearly']) {
    const planKey = Object.keys(subscriptionPlans[interval]).find(
      key => subscriptionPlans[interval][key] === priceId
    );
    if (planKey) return planKey; // Ritornerà sempre il nome base, es. 'APPRENTICE'
  }
  return null;
}

export function validateItalianTaxCode(cf) {
  const regex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/i;
  return regex.test(cf);
}

/**
* Create a Stripe checkout session for a new subscription.
 */
export const createCheckoutSession = async (req, res) => {
 // Aggiungiamo 'interval' dal req.body (default 'monthly' per retrocompatibilità)
  const { plan, interval = 'monthly' } = req.body; 

  const userId = req.user.userid;
  if (!userId) {
    return res.status(400).json({ error: 'user_notFound' });
  }

  try {
    const user = await User.findById(userId);
    const t = i18next.getFixedT(user.language || 'it');

    // Verifichiamo che il piano esista per l'intervallo scelto
    const priceId = subscriptionPlans[interval]?.[plan];
    if (!priceId) {
      return res.status(400).json({ error: t('invalid_subscription') });
    }

    if (!user) {
      return res.status(404).json({ error: t('user_notFound') });
    }

    const activeSubStatuses = ['active', 'past_due', 'trialing', 'processing'];
    if (user.subscription && user.subscription.stripeSubscriptionId && activeSubStatuses.includes(user.subscription.status)) {
        return createCustomerPortalSession(req, res);
    }

    let stripeCustomerId = user.subscription?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripeClient.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user._id.toString() },
      });
      stripeCustomerId = customer.id;
      user.subscription.stripeCustomerId = stripeCustomerId;
      await user.save();
    }

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card', 'paypal'],
      customer: stripeCustomerId,
      allow_promotion_codes: true,
      locale: 'auto',
      billing_address_collection: 'required',
line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/canceled`,
metadata: { userId: user._id.toString(), plan: plan, interval: interval }
    });
    await logAction(user._id, 'subscription_checkout_started', `Plan: ${plan}`);

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: t('server_error') });
  }
};

/**
* Modify (upgrade/downgrade) an existing subscription.
 */
export const manageSubscription = async (req, res) => {
  const { newPlan, interval = 'monthly' } = req.body; // Riceviamo anche il nuovo intervallo
  const userId = req.user.userid;

  if (!userId || !newPlan) {
    return res.status(400).json({ error: 'invalid_value' });
  }

  try {
    const user = await User.findById(userId);
    const t = i18next.getFixedT(user.language || 'it');

    if (!user || !user.subscription?.stripeSubscriptionId) {
      return res.status(404).json({ error: t('invalid_subscription') });
    }

    const priceId = subscriptionPlans[interval]?.[newPlan];
    if (!priceId) {
      return res.status(400).json({ error: t('invalid_subscription') });
    }

    const subscriptionId = user.subscription.stripeSubscriptionId;
    const subscription = await stripeClient.subscriptions.retrieve(subscriptionId);
    
    const currentItemId = subscription.items.data[0].id;
    const currentPrice = subscription.items.data[0].price;
    // Rileviamo se l'abbonamento attuale in Stripe è mensile o annuale
    const currentInterval = currentPrice.recurring.interval === 'year' ? 'yearly' : 'monthly';
    const currentPlan = user.subscription.plan;

    // Blocchiamo solo se non cambia NÉ il piano NÉ l'intervallo di pagamento
    if (newPlan === currentPlan && interval === currentInterval) {
      return res.status(400).json({ error: t('subscription_errorModify') });
    }

    // Logica di prevenzione Downgrade sui tier
    const planWeights = { APPRENTICE: 1, PRACTITIONER: 2, BREEDER: 3 };
    if (!planWeights[currentPlan]) console.warn(`Current plan unknown: ${currentPlan}`);
    
    if (planWeights[newPlan] < planWeights[currentPlan]) {
      return res.status(400).json({ error: t('subscription_downgrade') });
    }

    const updatedSubscription = await stripeClient.subscriptions.update(subscriptionId, {
      items: [{
        id: currentItemId,
        price: priceId, // Applichiamo il nuovo prezzo (mensile o annuale)
      }],
      proration_behavior: 'always_invoice',
      billing_cycle_anchor: 'now',
    });

    user.subscription.plan = newPlan;
    await logAction(user._id, 'subscription_updated', `From ${currentPlan} (${currentInterval}) to ${newPlan} (${interval})`);
    await user.save();

    res.status(200).json({ success: true, message: t('subscription_successfully'), subscription: updatedSubscription });

  } catch (error) {
    console.error("Error while changing subscription:", error);
    res.status(500).json({ error: t('server_error') });
  }
};
/**
* Cancel a subscription at the end of the current billing period.
 */
export const cancelSubscription = async (req, res) => {
  const userId = req.user.userid;

  if (!userId) {
    return res.status(400).json({ error: 'user_notFound' });
  }

  try {
    const user = await User.findById(userId);
    const t = i18next.getFixedT(user.language || 'it');

    if (!user || !user.subscription?.stripeSubscriptionId) {
      return res.status(404).json({ error: t('invalid_value') });
    }

    const subscriptionId = user.subscription.stripeSubscriptionId;
    const canceledSubscription = await stripeClient.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    user.subscription.status = 'pending_cancellation';
    await logAction(user._id, 'subscription_cancellation_requested', `ID sub: ${user.subscription.stripeSubscriptionId}`);

    await user.save();

    res.status(200).json({ success: true, message: t('subscription_delete'), subscription: canceledSubscription });

  } catch (error) {
    console.error("Error while canceling subscription:", error);
    res.status(500).json({ error: t('server_error') });
  }
};

export const getSessionDetails = async (req, res) => {
  const { sessionId } = req.params;
  const user = await User.findById(req.user.userid);
  const t = i18next.getFixedT(user.language || 'it');

  if (!sessionId) return res.status(400).json({ error: t('invalid_value') });

  try {
    // Retrieve the checkout session from Stripe
    const session = await stripeClient.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'line_items.data.price'],
    });

    if (!session) return res.status(404).json({ error: t('session-invalid') });

    const planPriceId = session.line_items?.data[0]?.price?.id || null;
    const amount_total = session.amount_total || 0;
    const planName = getPlanNameByPriceId(planPriceId);

    res.json({
      sessionId: session.id,
      planName,
      amount_total,
      payment_status: session.payment_status,
      subscriptionId: session.subscription,
      customerId: session.customer,
    });
  } catch (error) {
    console.error('Stripe session recovery error:', error);
    res.status(500).json({ error: t('server_error') });
  }
};
/**
* Create a Stripe customer portal session.
 */
export const createCustomerPortalSession = async (req, res) => {
  const userId = req.user.userid;
  let t = (key) => key;
  try {
    const user = await User.findById(userId);
    const t = i18next.getFixedT(user.language || 'it');

    if (!user || !user.subscription?.stripeCustomerId) {
      return res.status(404).json({ error: t('user_notFound') });
    }

    const portalSession = await stripeClient.billingPortal.sessions.create({
      customer: user.subscription.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });
    await logAction(user._id, 'stripe_portal_opened');

    res.status(200).json({ url: portalSession.url });

  } catch (error) {
    console.error("Error creating customer portal session:", error);
    res.status(500).json({ error: t('server_error') });
  }
};


/**
* Handles incoming webhooks from Stripe.
 */
export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripeClient.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Error verifying webhook signature: ${err.message}`);
    return res.status(400).send('Webhook signature verification failed.', { message: err.message });
  }

  const dataObject = event.data.object;

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const { userId, plan } = dataObject.metadata;
        const user = await User.findById(userId);
        if (user) {
          const t = i18next.getFixedT(user.language || 'it');
          user.subscription.stripeSubscriptionId = dataObject.subscription;
          user.subscription.stripeCustomerId = dataObject.customer;
          user.subscription.plan = plan;
          user.subscription.status = 'processing';
          const address = dataObject.customer_details.address;
          const name = dataObject.customer_details.name;
          const email = dataObject.customer_details.email;

          user.billingDetails = {
            name,
            email,
            address
          };
          await user.save();
          await logAction(user._id, 'stripe_checkout_completed', `Status: ${user.subscription.status}, Plan: ${plan}`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const stripeCustomerId = dataObject.customer;
        const stripeSubscriptionId = dataObject.subscription;
        const user = await User.findOne({
          'subscription.stripeCustomerId': stripeCustomerId
        });

        if (!user) {
          console.warn(`Invoice paid but user not found. customer=${stripeCustomerId} subscription=${stripeSubscriptionId}`);
          break;
        }
        const t = i18next.getFixedT(user.language || 'it');

        const isSubscriptionCreation = dataObject.billing_reason === 'subscription_create';

        const lineItem = dataObject.lines?.data?.[0];
        const periodEndTimestamp = lineItem?.period?.end;
const paymentInterval = lineItem?.price?.recurring?.interval === 'year' ? 'ANNUALE' : 'MENSILE';
        if (!periodEndTimestamp) {
          console.error(`Webhook 'invoice.payment_succeeded' (id: ${dataObject.id}) does not have a valid period.end in the line item.`);
          break;
        }

        const periodEnd = new Date(periodEndTimestamp * 1000);
        const priceId = lineItem?.price?.id;
        const planName = getPlanNameByPriceId(priceId);
        console.log('Processing invoice.payment_succeeded', {
          customer: dataObject.customer,
          subscription: dataObject.subscription,
          periodEnd: dataObject.lines?.data?.[0]?.period?.end
        });
        user.subscription.status = 'active';
        user.subscription.currentPeriodEnd = periodEnd;
        if (planName) {
          user.subscription.plan = planName;
        }
        if (stripeSubscriptionId) {
          user.subscription.stripeSubscriptionId = stripeSubscriptionId;
        }

        try {
          await user.save();
          console.log('User updated to active');
        } catch (e) {
          console.error('Failed to save user subscription:', e);
        }

        if (isSubscriptionCreation) {
          await logAction(user._id, 'stripe_invoice_paid', `Piano: ${user.subscription.plan}, Period end: ${periodEnd}`);

          await Notification.create({
            user: user._id,
            type: 'billing',
            message: t('notification.activeStripe_subscription', { subscription: user.subscription.plan }),
            date: new Date(),
          });

          await sendStripeNotificationEmail(
            user.email,
            user.language,
            t('emails.activeStripe_subscription.subject'),
            t('emails.activeStripe_subscription.html', { name: user.name, subscription: user.subscription.plan })
          );
        }
        try {
            // Definisci l'email admin qui o nel .env
            const adminEmail = 'simonevaira8@gmail.com'; 

            const discountMap = {
                'APPRENTICE': '1€',
                'PRACTITIONER': '3€',
                'BREEDER': '5€'
            };
            
            const currentPlan = user.subscription.plan || 'UNKNOWN';
            const discountValue = discountMap[currentPlan] || '0€';
            const eventType = isSubscriptionCreation ? "NUOVO ABBONAMENTO" : "RINNOVO MENSILE";

            // Non inviare se il piano non prevede sconti (es. NEOPHYTE)
            if (discountValue !== '0€') {
const adminSubject = `[ADMIN - MARKET] Generare Coupon ${discountValue} - ${user.name} (${paymentInterval})`;

const adminBody = `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2 style="color: #d97706;">🔔 ${eventType} ${paymentInterval} Rilevato</h2>
                        <p>È stato effettuato con successo un pagamento da parte di un utente.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <p><strong>Utente:</strong> ${user.name}</p>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Piano:</strong> ${currentPlan}</p>
                        <p><strong>Fatturazione:</strong> ${paymentInterval}</p>
                        <p><strong>Data Scadenza Periodo:</strong> ${periodEnd.toLocaleDateString('it-IT')}</p>
                        
                        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin-top: 20px;">
                            <h3 style="margin-top: 0; color: #92400e;">⚠️ Azione Richiesta</h3>
                            <p style="margin-bottom: 0;">Genera un codice coupon da <strong>${discountValue}</strong> valido per questo periodo e invialo all'utente.</p>
                        </div>
                    </div>
                `;

                await sendStripeNotificationEmail(
                    adminEmail,
                    'it', // Lingua email admin
                    adminSubject,
                    adminBody
                );
                console.log(`Admin notification email sent for user ${user.email}`);
            }
        } catch (adminErr) {
            console.error("Error sending admin notification:", adminErr);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const user = await User.findOne({ 'subscription.stripeSubscriptionId': dataObject.subscription });
        if (user) {
          const t = i18next.getFixedT(user.language || 'it');
          user.subscription.status = 'past_due';
          await user.save();
          await logAction(user._id, 'stripe_payment_failed', `Sub ID: ${dataObject.subscription}`);

          await sendStripeNotificationEmail(
            user.email,
            user.language,
            t('emails.errorStripe_subscription.subject'),
            t('emails.errorStripe_subscription.html', { name: user.name }))
        }
        break;
      }

      case 'customer.subscription.updated': {
        console.log("DEBUG: Webhook updated ricevuto. PriceID:", dataObject.items.data[0].price.id);
        const user = await User.findOne({ 'subscription.stripeSubscriptionId': dataObject.id });
        if (user) {
          const t = i18next.getFixedT(user.language || 'it');

          const newPlanId = dataObject.items.data[0].price.id;
          const newPlanName = getPlanNameByPriceId(newPlanId);
console.log("DEBUG: PlanName calcolato:", newPlanName);
          user.subscription.status = dataObject.status;
          if (newPlanName) user.subscription.plan = newPlanName;

          const periodEndDate = parsePeriodEnd(dataObject);
          if (periodEndDate) {
            const changed = setPeriodEndIfLater(user, periodEndDate);
            console.log(`customer.subscription.updated -> setPeriodEndIfLater: ${changed}`);
          } else {
            console.warn(` Unable to parse currentPeriodEnd for ${dataObject.id}`);
          }

          if (dataObject.cancel_at_period_end) {
            user.subscription.status = 'pending_cancellation';
          }

          await user.save();
          await logAction(user._id, 'subscription_updated_webhook', `Status: ${dataObject.status}, Nuovo piano: ${newPlanName}`);

          const subject = t('emails.updateStripe_subscription.subject');
          const body = t('emails.updateStripe_subscription.html', { name: user.name, Plan: newPlanName });
          await sendStripeNotificationEmail(user.email, user.language, subject, body);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const user = await User.findOne({ 'subscription.stripeSubscriptionId': dataObject.id });
        const newPlanId = dataObject.items.data[0].price.id;

        const newPlanName = getPlanNameByPriceId(newPlanId);

        if (user) {
          const t = i18next.getFixedT(user.language || 'it');
          user.subscription.status = 'canceled';
          user.subscription.plan = 'NEOPHYTE';
          user.subscription.stripeSubscriptionId = null;
          user.subscription.currentPeriodEnd = null;
          await user.save();
          await logAction(user._id, 'subscription_cancelled', `Subscription ended`);

          const subject = t('emails.cancelStripe_subscription.subject');;
          const body = t('emails.cancelStripe_subscription.html', { name: user.name, Plan: newPlanName });
          await sendStripeNotificationEmail(user.email, user.language, subject, body);
        }
        break;
      }

      default:
        console.log(`Unmanaged event: ${event.type}`);
    }

    res.status(200).json({ received: true });

  } catch (error) {
    await logAction(null, 'webhook_unhandled', `Event type: ${event.type}`);

    console.error("Error handling webhook:", error);
    res.status(500).json({ error: 'server_error' });
  }
};
