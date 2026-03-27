import express from 'express';
import * as cartController from '../controllers/Cart_controller.js';
import { authenticateJWT } from '../middlewares/Auth.js';

const cartRouter = express.Router();

// Middleware opzionale: tenta autenticazione JWT ma non blocca se assente
// Permette sia utenti loggati che guest
const optionalAuth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return next(); // guest → procede senza req.user
  return authenticateJWT(req, res, next);
};

// GET /api/store/cart – recupera il carrello (loggato o guest)
cartRouter.get('/', optionalAuth, cartController.getCart);

// POST /api/store/cart/items – aggiunge un item
cartRouter.post('/items', optionalAuth, cartController.addToCart);

// PATCH /api/store/cart/items/:itemId – aggiorna quantità
cartRouter.patch('/items/:itemId', optionalAuth, cartController.updateCartItem);

// DELETE /api/store/cart/items/:itemId – rimuove un item
cartRouter.delete('/items/:itemId', optionalAuth, cartController.removeCartItem);

// DELETE /api/store/cart – svuota il carrello
cartRouter.delete('/', optionalAuth, cartController.clearCart);

// POST /api/store/cart/merge – unisce carrello guest in quello utente (chiamata dopo login)
cartRouter.post('/merge', authenticateJWT, cartController.mergeCart);

export default cartRouter;