import express from 'express';
import { getInventory, updateInventoryItem, getInventoryForecast, getPurchaseRecommendations, getFeedingSuggestions ,addInventoryItem, deleteFeeding } from '../controllers/FoodInventoryController.js';
import { authenticateJWT } from '../middlewares/Auth.js';

const router = express.Router();

router.use(authenticateJWT);

router.get('/', getInventory);
router.post('/', addInventoryItem);
router.put('/:id', updateInventoryItem);
router.delete('/:id', deleteFeeding);
router.get('/feeding-suggestions', getFeedingSuggestions)
router.get('/forecast', getInventoryForecast);
router.get('/recommendations', getPurchaseRecommendations);
export default router;
