import express from 'express';
import {
    getUserNotifications,
    createNotification,
    markNotificationAsRead
} from '../controllers/notificationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Base route: /api/notifications
router.route('/')
    .get(protect, getUserNotifications)
    .post(protect, admin, createNotification);

router.route('/:id/read')
    .patch(protect, markNotificationAsRead);

export default router; 