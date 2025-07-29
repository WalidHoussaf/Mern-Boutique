import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createCheckoutSession, handleWebhook } from '../controllers/paypalController.js';

const router = express.Router();

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/webhook', handleWebhook);

export default router; 