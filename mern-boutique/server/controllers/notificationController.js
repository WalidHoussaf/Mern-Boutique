import asyncHandler from 'express-async-handler';
import Notification from '../models/notificationModel.js';

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ userId: req.user._id })
        .sort({ createdAt: -1 }); // Most recent first
    
    res.json(notifications);
});

// @desc    Create a new notification
// @route   POST /api/notifications
// @access  Private/Admin
const createNotification = asyncHandler(async (req, res) => {
    const { userId, type, title, message } = req.body;

    // Validate required fields
    if (!userId || !type || !title || !message) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    const notification = await Notification.create({
        userId,
        type,
        title,
        message
    });

    res.status(201).json(notification);
});

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markNotificationAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findOne({
        _id: req.params.id,
        userId: req.user._id
    });

    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
});

export {
    getUserNotifications,
    createNotification,
    markNotificationAsRead
}; 