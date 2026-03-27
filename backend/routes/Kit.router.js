import express from 'express';
import * as kitController from '../controllers/Kit_controller.js';
import { authenticateJWT } from '../middlewares/Auth.js';
import { isAdmin } from '../middlewares/Authorization.js';
import upload from '../config/MulterConfig.js';

const kitRouter = express.Router();

// ─── Route pubbliche ──────────────────────────────────────────────────────────
// GET /api/store/kits – lista kit attivi (paginata)
kitRouter.get('/', kitController.getKits);

// GET /api/store/kits/:id – dettaglio kit
kitRouter.get('/:id', kitController.getKitById);

// ─── Route admin ──────────────────────────────────────────────────────────────
// GET /api/store/kits/admin/all – tutti i kit (anche disattivi)
kitRouter.get('/admin/all', authenticateJWT, isAdmin, kitController.getKitsAdmin);

// POST /api/store/kits – crea kit (max 5 immagini)
kitRouter.post(
  '/',
  authenticateJWT,
  isAdmin,
  upload.array('images', 5),
  kitController.createKit
);

// PUT /api/store/kits/:id – aggiorna kit
kitRouter.put(
  '/:id',
  authenticateJWT,
  isAdmin,
  upload.array('images', 5),
  kitController.updateKit
);

// DELETE /api/store/kits/:id – elimina kit
kitRouter.delete('/:id', authenticateJWT, isAdmin, kitController.deleteKit);

// PATCH /api/store/kits/:id/toggle – attiva/disattiva
kitRouter.patch('/:id/toggle', authenticateJWT, isAdmin, kitController.toggleKitStatus);

export default kitRouter;