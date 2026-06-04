import express from 'express';
import { authenticateJWT } from '../middlewares/Auth.js';
import { createBreedingPair, addBreedingEvent, registerHatching, getBreedingByYear, updateBreedingOutcome, deleteBreeding, deleteBreedingEvent, updateBreedingEvent, getSuccessRate, getIncubationStats } from '../controllers/BreedingController.js';
import { calculateBreedingOutputs, getGeneticOptions } from '../controllers/GeneticCalculatorController.js';

const breedingRouter = express.Router();

breedingRouter.use(authenticateJWT);
breedingRouter.post('/', createBreedingPair);
breedingRouter.post('/:breedingId/event', addBreedingEvent);
breedingRouter.get('/', getBreedingByYear);
breedingRouter.patch('/:breedingId/outcome', updateBreedingOutcome);
breedingRouter.delete('/:breedingId/event/:eventId', deleteBreedingEvent);
breedingRouter.patch('/:breedingId/event/:eventId', updateBreedingEvent);
breedingRouter.get('/analytics/success-rate', getSuccessRate);
breedingRouter.get('/analytics/incubation', getIncubationStats);
 breedingRouter.get('/genetic/options', getGeneticOptions);
breedingRouter.post('/genetic', calculateBreedingOutputs);
breedingRouter.delete('/:breedingId', deleteBreeding);
breedingRouter.post('/:breedingId/hatch', registerHatching);
export default breedingRouter;
