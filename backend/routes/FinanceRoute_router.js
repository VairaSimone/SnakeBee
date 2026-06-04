import express from 'express';
import { authenticateJWT } from '../middlewares/Auth.js';
import { 
  createTransaction, 
  getTransactions, 
  deleteTransaction, 
  getFinancialSummary 
} from '../controllers/FinanceController.js';

const router = express.Router();

// Proteggiamo tutte le rotte con il middleware di autenticazione
router.use(authenticateJWT);

router.get('/summary', getFinancialSummary);

router.post('/transactions', createTransaction);
router.get('/transactions', getTransactions);
router.delete('/transactions/:id', deleteTransaction);

export default router;