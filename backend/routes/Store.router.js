import express from 'express';
import * as orderController from '../controllers/Order_controller.js';
import * as storeStripe from '../controllers/StoreStripe_controller.js';
import { authenticateJWT } from '../middlewares/Auth.js';
import { isAdmin } from '../middlewares/Authorization.js';

const storeRouter = express.Router();

// ── Checkout ──────────────────────────────────────────────────────────────────

// Middleware opzionale (checkout disponibile anche per guest)
const optionalAuth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return next();
  return authenticateJWT(req, res, next);
};

// POST /api/store/checkout – crea sessione Stripe per lo store
storeRouter.post('/checkout', optionalAuth, storeStripe.createStoreCheckoutSession);

// GET /api/store/checkout/success/:sessionId – dettagli ordine post-pagamento
storeRouter.get('/checkout/success/:sessionId', optionalAuth, storeStripe.getStoreSessionDetails);

// ── Ordini utente ─────────────────────────────────────────────────────────────

// GET /api/store/orders – storico ordini utente loggato
storeRouter.get('/orders', authenticateJWT, orderController.getUserOrders);

// GET /api/store/orders/:id – dettaglio singolo ordine
storeRouter.get('/orders/:id', authenticateJWT, orderController.getOrderById);

// ── Admin ordini ──────────────────────────────────────────────────────────────

// GET /api/store/admin/orders – tutti gli ordini
storeRouter.get('/admin/orders', authenticateJWT, isAdmin, orderController.getAllOrders);

// PATCH /api/store/admin/orders/:id/status – cambia stato ordine
storeRouter.patch('/admin/orders/:id/status', authenticateJWT, isAdmin, orderController.updateOrderStatus);

// PATCH /api/store/admin/orders/:id/tracking – aggiunge tracking
storeRouter.patch('/admin/orders/:id/tracking', authenticateJWT, isAdmin, orderController.updateTracking);

export default storeRouter;