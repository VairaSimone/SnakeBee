/**
 * storeApi.js
 * Tutte le chiamate API relative allo store kit SnakeBee.
 * Importa l'istanza `api` (axios) già configurata con interceptors JWT.
 */
import api from './api';

// ─── Kit ─────────────────────────────────────────────────────────────────────

/** Lista kit attivi (pubblica, con paginazione e ricerca) */
export const getKits = (params = {}) =>
  api.get('/store/kits', { params });

/** Dettaglio singolo kit */
export const getKitById = (id) =>
  api.get(`/store/kits/${id}`);

// ─── Kit Admin ────────────────────────────────────────────────────────────────

/** Lista tutti i kit (anche inattivi) – solo admin */
export const getKitsAdmin = (params = {}) =>
  api.get('/store/kits/admin/all', { params });

/** Crea un kit con immagini (multipart/form-data) */
export const createKit = (formData) =>
  api.post('/store/kits', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

/** Aggiorna un kit */
export const updateKit = (id, formData) =>
  api.put(`/store/kits/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

/** Elimina un kit */
export const deleteKit = (id) =>
  api.delete(`/store/kits/${id}`);

/** Attiva/Disattiva un kit */
export const toggleKitStatus = (id) =>
  api.patch(`/store/kits/${id}/toggle`);

// ─── Carrello ─────────────────────────────────────────────────────────────────

/** Recupera il carrello (utente o guest) */
export const getCart = () =>
  api.get('/store/cart');

/** Aggiunge un item al carrello */
export const addToCart = (kitId, quantity = 1) =>
  api.post('/store/cart/items', { kitId, quantity });

/** Aggiorna quantità di un item */
export const updateCartItem = (itemId, quantity) =>
  api.patch(`/store/cart/items/${itemId}`, { quantity });

/** Rimuove un item */
export const removeCartItem = (itemId) =>
  api.delete(`/store/cart/items/${itemId}`);

/** Svuota il carrello */
export const clearCart = () =>
  api.delete('/store/cart');

/** Unisce carrello guest → utente loggato (chiamare subito dopo il login) */
export const mergeCart = () =>
  api.post('/store/cart/merge');

// ─── Checkout ─────────────────────────────────────────────────────────────────

/** Crea sessione Stripe checkout per lo store */
export const createStoreCheckout = (shippingAddress) =>
  api.post('/store/checkout', { shippingAddress });

/** Recupera dettagli ordine post-pagamento */
export const getStoreSessionDetails = (sessionId) =>
  api.get(`/store/checkout/success/${sessionId}`);

// ─── Ordini utente ────────────────────────────────────────────────────────────

/** Storico ordini dell'utente loggato */
export const getUserOrders = (params = {}) =>
  api.get('/store/orders', { params });

/** Dettaglio singolo ordine */
export const getOrderById = (id) =>
  api.get(`/store/orders/${id}`);

// ─── Ordini admin ─────────────────────────────────────────────────────────────

/** Tutti gli ordini (admin) */
export const getAllOrders = (params = {}) =>
  api.get('/store/admin/orders', { params });

/** Cambia stato ordine (admin) */
export const updateOrderStatus = (id, status, trackingCode) =>
  api.patch(`/store/admin/orders/${id}/status`, { status, trackingCode });

/** Aggiunge codice tracking (admin) */
export const updateOrderTracking = (id, trackingCode) =>
  api.patch(`/store/admin/orders/${id}/tracking`, { trackingCode });