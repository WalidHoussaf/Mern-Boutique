import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createCheckoutSession,
  handleWebhook,
} from '../controllers/stripeController.js';

const router = express.Router();

// Create a Stripe checkout session
router.post('/create-checkout-session', protect, createCheckoutSession);

export default router; 