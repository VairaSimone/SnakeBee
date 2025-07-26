import express from 'express';
import * as breedingController from '../controllers/BreedingController.js';
import { authenticateJWT } from '../middlewares/Auth.js';
import { isOwnerOrAdmin } from '../middlewares/Authorization.js';
import Breeding from '../models/Breeding.js';
import { checkSeasonOpen } from '../middlewares/checkSeasonOpen.js';
import { validationResult } from 'express-validator';
import { createBreedingRules, breedingIdParamRule } from '../validate/validateBreeding.js';

const breedingRouter = express.Router();

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // ritorna sempre 400 con array di errori
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

breedingRouter.post('/', authenticateJWT, createBreedingRules, checkValidation, breedingController.createBreeding);
breedingRouter.get('/reptile/:reptileId', authenticateJWT, breedingController.getBreedingForReptile);
breedingRouter.put('/:breedingId', authenticateJWT, breedingIdParamRule,
  checkValidation, checkSeasonOpen(req => Breeding.findById(req.params.breedingId)), isOwnerOrAdmin(Breeding, 'breedingId'), breedingController.updateBreeding);

breedingRouter.delete('/:breedingId', authenticateJWT, breedingIdParamRule,
  checkValidation, checkSeasonOpen(req => Breeding.findById(req.params.breedingId)), isOwnerOrAdmin(Breeding, 'breedingId'), breedingController.deleteBreeding);

breedingRouter.post('/:breedingId/events',
  authenticateJWT, breedingIdParamRule,
  checkValidation, checkSeasonOpen(req => Breeding.findById(req.params.breedingId)),
  isOwnerOrAdmin(Breeding, 'breedingId'),
  breedingController.addEventToBreeding
);

/** ➋ Aggiunge un nuovo hatchling alla deposizione */
breedingRouter.post('/:breedingId/hatchlings',
  authenticateJWT, checkSeasonOpen(req => Breeding.findById(req.params.breedingId)),
  isOwnerOrAdmin(Breeding, 'breedingId'), breedingIdParamRule,
  checkValidation,
  breedingController.addHatchlingToBreeding
);

/** ➌ Riepilogo di una stagione: tutti i breeding di quell’anno (read‑only) */
breedingRouter.get('/season/:year',
  authenticateJWT,
  breedingController.getSeasonRecap
);
breedingRouter.get('/', authenticateJWT, breedingController.getBreedingByUser);

breedingRouter.get('/reptile/:reptileId/summary', authenticateJWT, breedingController.getReptileBreedingSummary);

export default breedingRouter;
