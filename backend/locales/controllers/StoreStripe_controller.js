import Stripe from 'stripe';
import Cart from '../models/Cart.js';
import Kit from '../models/Kit.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { sendStripeNotificationEmail } from '../config/mailer.config.js';
import i18next from 'i18next';

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);

// ─── Configurazione spedizione ────────────────────────────────────────────────
const SHIPPING = {
  STANDARD: 5.99,
  FREE_THRESHOLD: 60.00, // spedizione gratuita sopra 60€
};

// Costo spedizione in centesimi per Stripe
const SHIPPING_AMOUNT_CENTS = Math.round(SHIPPING.STANDARD * 100);

const CART_SESSION_COOKIE = 'snakebee_cart_sid';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@snakebee.it';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function roundEuros(n) {
  return Math.round(n * 100) / 100;
}

function calcShipping(subtotal) {
  return subtotal >= SHIPPING.FREE_THRESHOLD ? 0 : SHIPPING.STANDARD;
}

/**
 * Ricostruisce il carrello dal DB e ne valida prezzi e disponibilità lato server.
 * Torna { items, subtotal, shippingCost, total, stripeLineItems }
 */
async function validateAndBuildOrderData(cartFilter) {
  const cart = await Cart.findOne(cartFilter).populate('items.kit');
  if (!cart || cart.items.length === 0) {
    throw Object.assign(new Error('Carrello vuoto'), { statusCode: 400 });
  }

  const stripeLineItems = [];
  const validatedItems = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const kit = item.kit;
    if (!kit || !kit.active) {
      throw Object.assign(new Error(`Kit "${kit?.name || item.kit}" non disponibile`), { statusCode: 409 });
    }
    if (kit.quantity < item.quantity) {
      throw Object.assign(
        new Error(`Disponibili solo ${kit.quantity} unità per "${kit.name}"`),
        { statusCode: 409 }
      );
    }

    // PREZZO SEMPRE DAL DATABASE, mai dal frontend
    const unitPrice = kit.price;
    subtotal += unitPrice * item.quantity;

    validatedItems.push({
      kit: kit._id,
      name: kit.name,
      unitPrice,
      quantity: item.quantity,
    });

    stripeLineItems.push({
      price_data: {
        currency: 'eur',
        unit_amount: Math.round(unitPrice * 100), // centesimi
        product_data: {
          name: kit.name,
          description: `IVA ${kit.vatRate}% inclusa`,
          images: kit.images.length > 0
            ? [`${process.env.BACKEND_URL}${kit.images[0]}`]
            : [],
        },
      },
      quantity: item.quantity,
    });
  }

  subtotal = roundEuros(subtotal);
  const shippingCost = roundEuros(calcShipping(subtotal));
  const total = roundEuros(subtotal + shippingCost);

  return { validatedItems, subtotal, shippingCost, total, stripeLineItems, cart };
}

// ─── POST /api/store/checkout ────────────────────────────────────────────────
export const createStoreCheckoutSession = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // Validazione indirizzo spedizione
    const required = ['fullName', 'address', 'city', 'postalCode', 'province'];
    for (const f of required) {
      if (!shippingAddress?.[f]?.trim()) {
        return res.status(400).json({ message: `Campo obbligatorio mancante: ${f}` });
      }
    }
    const cap = shippingAddress.postalCode.trim();
    if (!/^\d{5}$/.test(cap)) {
      return res.status(400).json({ message: 'CAP non valido (5 cifre)' });
    }

    // Identifica carrello
    const isLoggedIn = !!req.user?.userid;
    const sid = req.cookies?.[CART_SESSION_COOKIE];
    const cartFilter = isLoggedIn ? { user: req.user.userid } : { sessionId: sid };

    if (!isLoggedIn && !sid) {
      return res.status(400).json({ message: 'Sessione carrello non trovata' });
    }

    const { validatedItems, subtotal, shippingCost, total, stripeLineItems, cart } =
      await validateAndBuildOrderData(cartFilter);

    // Aggiungi spedizione come line item Stripe se non è gratuita
    const allLineItems = [...stripeLineItems];
    if (shippingCost > 0) {
      allLineItems.push({
        price_data: {
          currency: 'eur',
          unit_amount: SHIPPING_AMOUNT_CENTS,
          product_data: { name: 'Spedizione Standard (Italia)' },
        },
        quantity: 1,
      });
    }

    // Customer Stripe per utenti loggati
    let stripeCustomerEmail;
    if (isLoggedIn) {
      const user = await User.findById(req.user.userid).select('email subscription');
      stripeCustomerEmail = user?.email;
    }

    // Serializza dati da recuperare nel webhook
    const metadata = {
      orderType: 'store',             // distingue dai pagamenti abbonamento
      cartId: cart._id.toString(),
      userId: req.user?.userid || '',
      shippingAddressJson: JSON.stringify({
        ...shippingAddress,
        country: 'IT',
      }),
      subtotal: subtotal.toFixed(2),
      shippingCost: shippingCost.toFixed(2),
      total: total.toFixed(2),
      itemsJson: JSON.stringify(validatedItems.map(i => ({
        kit: i.kit.toString(),
        name: i.name,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
      }))),
    };

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card', 'paypal'],
      mode: 'payment',
      line_items: allLineItems,
      customer_email: stripeCustomerEmail,
      locale: 'it',
      billing_address_collection: 'required',
      allow_promotion_codes: true,
      metadata,
      success_url: `${process.env.FRONTEND_URL}/store/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/store/cart`,
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error('createStoreCheckoutSession error:', err);
    res.status(status).json({ message: err.message || req.t('server_error') });
  }
};

// ─── GET /api/store/checkout/success/:sessionId ──────────────────────────────
export const getStoreSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const order = await Order.findOne({ stripeSessionId: sessionId })
      .populate('items.kit', 'name images')
      .lean();

    if (!order) {
      return res.status(404).json({ message: 'Ordine non trovato' });
    }

    // Sicurezza: solo l'utente proprietario o admin
    if (
      order.user &&
      req.user?.userid &&
      order.user.toString() !== req.user.userid &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Non autorizzato' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: req.t('server_error') });
  }
};

// ─── POST /api/store/webhook  (raw body, Stripe signature) ───────────────────
export const storeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_STORE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripeClient.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    console.error('Store webhook signature error:', err.message);
    return res.status(400).json({ message: 'Webhook signature non valida' });
  }

  const obj = event.data.object;

  try {
    switch (event.type) {
      // ── checkout.session.completed ──────────────────────────────────────────
      case 'checkout.session.completed': {
        // Ignora sessioni non-store (es. abbonamenti)
        if (obj.metadata?.orderType !== 'store') break;

        // Idempotenza: l'ordine potrebbe già esistere se il webhook arriva due volte
        const existing = await Order.findOne({ stripeSessionId: obj.id });
        if (existing) {
          console.log(`Store webhook: ordine già creato per sessione ${obj.id}`);
          break;
        }

        const {
          cartId,
          userId,
          shippingAddressJson,
          subtotal,
          shippingCost,
          total,
          itemsJson,
        } = obj.metadata;

        const shippingAddress = JSON.parse(shippingAddressJson);
        const items = JSON.parse(itemsJson);

        // ── Decremento atomico inventario con controllo overselling ────────────
        const inventoryErrors = [];
        for (const item of items) {
          const updated = await Kit.findOneAndUpdate(
            { _id: item.kit, quantity: { $gte: item.quantity } },
            { $inc: { quantity: -item.quantity } },
            { new: true }
          );
          if (!updated) {
            inventoryErrors.push(item.name);
          }
        }

        if (inventoryErrors.length > 0) {
          // Rimborso automatico – stock esaurito dopo il pagamento
          if (obj.payment_intent) {
            await stripeClient.refunds.create({
              payment_intent: obj.payment_intent,
              reason: 'fraudulent', // usa 'duplicate' o 'requested_by_customer' in prod
            });
          }
          console.error(`Overselling rilevato. Rimborso avviato per sessione ${obj.id}. Items: ${inventoryErrors.join(', ')}`);

          // Notifica admin
          await sendStripeNotificationEmail(
            ADMIN_EMAIL,
            'it',
            `[ERRORE STORE] Overselling – rimborso automatico`,
            `<p>Sessione: ${obj.id}</p><p>Kit esauriti: ${inventoryErrors.join(', ')}</p>`
          );
          break;
        }

        // ── Creazione ordine ───────────────────────────────────────────────────
        const order = await Order.create({
          user: userId || null,
          guestEmail: obj.customer_details?.email || null,
          items,
          subtotal: parseFloat(subtotal),
          shippingCost: parseFloat(shippingCost),
          total: parseFloat(total),
          status: 'PAID',
          shippingAddress,
          stripeSessionId: obj.id,
          stripePaymentIntentId: obj.payment_intent || null,
        });

        // ── Svuota carrello ────────────────────────────────────────────────────
        if (cartId) {
          await Cart.findByIdAndDelete(cartId).catch(() => {});
        }

        // ── Email cliente ──────────────────────────────────────────────────────
        const customerEmail = obj.customer_details?.email;
        if (customerEmail) {
          const lang = userId
            ? (await User.findById(userId).select('language').lean())?.language || 'it'
            : 'it';

          const itemRows = items
            .map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>${i.unitPrice.toFixed(2)}€</td></tr>`)
            .join('');

          await sendStripeNotificationEmail(
            customerEmail,
            lang,
            `Conferma ordine SnakeBee – ${order.orderNumber}`,
            `
              <h2 style="color:#228B22;">Ordine confermato! 🎉</h2>
              <p>Grazie per il tuo acquisto. Il tuo ordine <strong>${order.orderNumber}</strong> è stato ricevuto.</p>
              <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%">
                <thead><tr><th>Kit</th><th>Qtà</th><th>Prezzo</th></tr></thead>
                <tbody>${itemRows}</tbody>
              </table>
              <p><strong>Subtotale:</strong> ${parseFloat(subtotal).toFixed(2)}€</p>
              <p><strong>Spedizione:</strong> ${parseFloat(shippingCost) === 0 ? 'Gratuita' : parseFloat(shippingCost).toFixed(2) + '€'}</p>
              <p><strong>Totale:</strong> ${parseFloat(total).toFixed(2)}€</p>
              <h3>Indirizzo di spedizione</h3>
              <p>${shippingAddress.fullName}<br>${shippingAddress.address}<br>${shippingAddress.postalCode} ${shippingAddress.city} (${shippingAddress.province})</p>
              <p style="color:#777;font-size:13px;">Riceverai un'email con il codice di tracciamento non appena il pacco sarà spedito.</p>
            `
          );
        }

        // ── Email admin ────────────────────────────────────────────────────────
        await sendStripeNotificationEmail(
          ADMIN_EMAIL,
          'it',
          `[STORE] Nuovo ordine ${order.orderNumber} – ${parseFloat(total).toFixed(2)}€`,
          `
            <h2>🛒 Nuovo ordine ricevuto</h2>
            <p><strong>Ordine:</strong> ${order.orderNumber}</p>
            <p><strong>Totale:</strong> ${parseFloat(total).toFixed(2)}€</p>
            <p><strong>Cliente:</strong> ${customerEmail || 'Guest'}</p>
            <p><strong>Spedire a:</strong> ${shippingAddress.fullName}, ${shippingAddress.address}, ${shippingAddress.postalCode} ${shippingAddress.city} (${shippingAddress.province})</p>
            <p><a href="${process.env.FRONTEND_URL}/admin/store/orders/${order._id}">Vedi ordine →</a></p>
          `
        );

        console.log(`Ordine store creato: ${order.orderNumber}`);
        break;
      }

      // ── payment_intent.payment_failed ─────────────────────────────────────
      case 'payment_intent.payment_failed': {
        // Solo per sessioni store – rileva metadata via session se presente
        // In questo caso non c'è molto da fare: il carrello rimane e l'utente riprova
        console.log(`Payment intent failed: ${obj.id}`);
        break;
      }

      default:
        // Ignora eventi non gestiti
        break;
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Store webhook handler error:', err);
    res.status(500).json({ error: 'Errore interno webhook' });
  }
};