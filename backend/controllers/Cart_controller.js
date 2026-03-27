import Cart from '../models/Cart.js';
import Kit from '../models/Kit.js';
import crypto from 'crypto';

const CART_SESSION_COOKIE = 'snakebee_cart_sid';
const CART_SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 giorni
const LOGGED_CART_TTL_DAYS = 30;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getOrCreateSessionId(req, res) {
  let sid = req.cookies?.[CART_SESSION_COOKIE];
  if (!sid) {
    sid = crypto.randomBytes(24).toString('hex');
    res.cookie(CART_SESSION_COOKIE, sid, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: CART_SESSION_MAX_AGE,
    });
  }
  return sid;
}

function buildCartFilter(req, sid) {
  if (req.user?.userid) return { user: req.user.userid };
  return { sessionId: sid };
}

async function getOrCreateCart(filter, isLoggedIn) {
  let cart = await Cart.findOne(filter);
  if (!cart) {
    const ttlDays = isLoggedIn ? LOGGED_CART_TTL_DAYS : 7;
    cart = new Cart({
      ...filter,
      items: [],
      expiresAt: new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000),
    });
  }
  return cart;
}

function calcTotal(items) {
  return items.reduce((sum, i) => sum + i.priceSnapshot * i.quantity, 0);
}

// ─── GET /api/store/cart ─────────────────────────────────────────────────────
export const getCart = async (req, res) => {
  try {
    const sid = getOrCreateSessionId(req, res);
    const filter = buildCartFilter(req, sid);

    const cart = await Cart.findOne(filter).populate('items.kit', 'name images active price quantity');
    if (!cart || cart.items.length === 0) {
      return res.json({ items: [], subtotal: 0 });
    }

    // Filtra item il cui kit è stato disattivato o eliminato
    const validItems = cart.items.filter(i => i.kit && i.kit.active);

    res.json({
      _id: cart._id,
      items: validItems.map(i => ({
        _id: i._id,
        kit: i.kit,
        quantity: i.quantity,
        priceSnapshot: i.priceSnapshot,
        lineTotal: Math.round(i.priceSnapshot * i.quantity * 100) / 100,
      })),
      subtotal: Math.round(calcTotal(validItems) * 100) / 100,
    });
  } catch (err) {
    console.error('getCart error:', err);
    res.status(500).json({ message: req.t('server_error') });
  }
};

// ─── POST /api/store/cart/items ──────────────────────────────────────────────
export const addToCart = async (req, res) => {
  try {
    const { kitId, quantity = 1 } = req.body;
    const qty = parseInt(quantity, 10);

    if (!kitId || isNaN(qty) || qty < 1) {
      return res.status(400).json({ message: 'kitId e quantity >= 1 sono obbligatori' });
    }

    // Validazione kit lato server
    const kit = await Kit.findById(kitId);
    if (!kit || !kit.active) {
      return res.status(404).json({ message: 'Kit non disponibile' });
    }
    if (kit.quantity < qty) {
      return res.status(409).json({ message: `Disponibili solo ${kit.quantity} unità` });
    }

    const sid = getOrCreateSessionId(req, res);
    const filter = buildCartFilter(req, sid);
    const isLoggedIn = !!req.user?.userid;
    const cart = await getOrCreateCart(filter, isLoggedIn);

    const existingIdx = cart.items.findIndex(i => i.kit.toString() === kitId);

    if (existingIdx > -1) {
      const newQty = cart.items[existingIdx].quantity + qty;
      if (newQty > kit.quantity) {
        return res.status(409).json({ message: `Disponibili solo ${kit.quantity} unità` });
      }
      cart.items[existingIdx].quantity = newQty;
    } else {
      cart.items.push({
        kit: kit._id,
        quantity: qty,
        priceSnapshot: kit.price,
      });
    }

    // Proroga TTL
    const ttlDays = isLoggedIn ? LOGGED_CART_TTL_DAYS : 7;
    cart.expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
    await cart.save();

    res.status(200).json({ message: 'Aggiunto al carrello', cartItemsCount: cart.items.length });
  } catch (err) {
    console.error('addToCart error:', err);
    res.status(500).json({ message: req.t('server_error') });
  }
};

// ─── PATCH /api/store/cart/items/:itemId ─────────────────────────────────────
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const qty = parseInt(quantity, 10);

    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({ message: 'Quantità non valida' });
    }

    const sid = req.cookies?.[CART_SESSION_COOKIE];
    const filter = buildCartFilter(req, sid);
    const cart = await Cart.findOne(filter);
    if (!cart) return res.status(404).json({ message: 'Carrello non trovato' });

    const itemIdx = cart.items.findIndex(i => i._id.toString() === req.params.itemId);
    if (itemIdx === -1) return res.status(404).json({ message: 'Item non trovato nel carrello' });

    if (qty === 0) {
      // Rimuovi l'item
      cart.items.splice(itemIdx, 1);
    } else {
      // Controlla disponibilità
      const kit = await Kit.findById(cart.items[itemIdx].kit);
      if (!kit || !kit.active) {
        cart.items.splice(itemIdx, 1);
        await cart.save();
        return res.status(409).json({ message: 'Kit non più disponibile, rimosso dal carrello' });
      }
      if (qty > kit.quantity) {
        return res.status(409).json({ message: `Disponibili solo ${kit.quantity} unità` });
      }
      cart.items[itemIdx].quantity = qty;
    }

    await cart.save();
    res.json({ message: 'Carrello aggiornato', cartItemsCount: cart.items.length });
  } catch (err) {
    console.error('updateCartItem error:', err);
    res.status(500).json({ message: req.t('server_error') });
  }
};

// ─── DELETE /api/store/cart/items/:itemId ────────────────────────────────────
export const removeCartItem = async (req, res) => {
  try {
    const sid = req.cookies?.[CART_SESSION_COOKIE];
    const filter = buildCartFilter(req, sid);
    const cart = await Cart.findOne(filter);
    if (!cart) return res.status(404).json({ message: 'Carrello non trovato' });

    const before = cart.items.length;
    cart.items = cart.items.filter(i => i._id.toString() !== req.params.itemId);

    if (cart.items.length === before) {
      return res.status(404).json({ message: 'Item non trovato' });
    }

    await cart.save();
    res.json({ message: 'Item rimosso' });
  } catch (err) {
    res.status(500).json({ message: req.t('server_error') });
  }
};

// ─── DELETE /api/store/cart ──────────────────────────────────────────────────
export const clearCart = async (req, res) => {
  try {
    const sid = req.cookies?.[CART_SESSION_COOKIE];
    const filter = buildCartFilter(req, sid);
    await Cart.findOneAndDelete(filter);
    res.json({ message: 'Carrello svuotato' });
  } catch (err) {
    res.status(500).json({ message: req.t('server_error') });
  }
};

// ─── POST /api/store/cart/merge ──────────────────────────────────────────────
// Chiamata dopo il login per unire carrello guest → carrello utente
export const mergeCart = async (req, res) => {
  try {
    if (!req.user?.userid) return res.status(401).json({ message: 'Non autenticato' });
    const sid = req.cookies?.[CART_SESSION_COOKIE];
    if (!sid) return res.json({ message: 'Nessun carrello guest da unire' });

    const guestCart = await Cart.findOne({ sessionId: sid });
    if (!guestCart || guestCart.items.length === 0) {
      return res.json({ message: 'Carrello guest vuoto' });
    }

    let userCart = await Cart.findOne({ user: req.user.userid });
    if (!userCart) {
      userCart = new Cart({
        user: req.user.userid,
        items: [],
        expiresAt: new Date(Date.now() + LOGGED_CART_TTL_DAYS * 24 * 60 * 60 * 1000),
      });
    }

    for (const guestItem of guestCart.items) {
      const idx = userCart.items.findIndex(i => i.kit.toString() === guestItem.kit.toString());
      if (idx > -1) {
        userCart.items[idx].quantity += guestItem.quantity;
      } else {
        userCart.items.push(guestItem);
      }
    }

    await userCart.save();
    await Cart.findByIdAndDelete(guestCart._id);

    // Cancella cookie sessione guest
    res.clearCookie(CART_SESSION_COOKIE, { httpOnly: true, secure: true, sameSite: 'None' });
    res.json({ message: 'Carrello unito con successo', cartItemsCount: userCart.items.length });
  } catch (err) {
    console.error('mergeCart error:', err);
    res.status(500).json({ message: req.t('server_error') });
  }
};