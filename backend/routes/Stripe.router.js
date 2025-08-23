import express from 'express';
import * as stripeController from '../controllers/Stripe_controller.js';
import { authenticateJWT } from '../middlewares/Auth.js';

const stripeRouter = express.Router();

stripeRouter.post('/create-checkout-session', authenticateJWT, stripeController.createCheckoutSession);
stripeRouter.post('/manage-subscription', authenticateJWT, stripeController.manageSubscription);
stripeRouter.post('/cancel-subscription', authenticateJWT, stripeController.cancelSubscription);
stripeRouter.post('/create-portal-session', authenticateJWT, stripeController.createCustomerPortalSession);
stripeRouter.get('/session/:sessionId', authenticateJWT, stripeController.getSessionDetails);

export default stripeRouter;
