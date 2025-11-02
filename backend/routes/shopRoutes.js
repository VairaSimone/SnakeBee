// routes/shopRoutes.js

import express from 'express';
import * as shopController from '../controllers/Shop_controller.js';

const shopRouter = express.Router();

// Rotta per la lista pubblica dei rettili (lo shop)
// Filtri: ?species=...&morph=...&zona=...
shopRouter.get('/reptiles', shopController.getPublicShopReptiles);

// Rotta per la lista pubblica degli allevatori
shopRouter.get('/breeders', shopController.getPublicBreeders);

// Rotta per il profilo pubblico di un singolo allevatore e i suoi rettili
shopRouter.get('/breeders/:userId', shopController.getPublicBreederProfile);

export default shopRouter;