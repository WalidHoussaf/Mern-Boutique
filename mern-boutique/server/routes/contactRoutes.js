import express from 'express';
import {
  createContactMessage,
  getContactMessages,
  markMessageAsRead,
  deleteMessage,
} from '../controllers/contactController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(createContactMessage)
  .get(protect, admin, getContactMessages);

router.route('/:id')
  .put(protect, admin, markMessageAsRead)
  .delete(protect, admin, deleteMessage);

export default router; 