import asyncHandler from 'express-async-handler';
import ContactMessage from '../models/contactMessageModel.js';

// @desc    Create a new contact message
// @route   POST /api/contact
// @access  Public
const createContactMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    res.status(400);
    throw new Error('Please fill in all fields');
  }

  const contactMessage = await ContactMessage.create({
    name,
    email,
    subject,
    message,
  });

  if (contactMessage) {
    res.status(201).json({
      message: 'Message sent successfully',
    });
  } else {
    res.status(400);
    throw new Error('Invalid message data');
  }
});

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
const getContactMessages = asyncHandler(async (req, res) => {
  const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
  res.json(messages);
});

// @desc    Mark message as read
// @route   PUT /api/contact/:id
// @access  Private/Admin
const markMessageAsRead = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findById(req.params.id);

  if (message) {
    message.isRead = true;
    const updatedMessage = await message.save();
    res.json(updatedMessage);
  } else {
    res.status(404);
    throw new Error('Message not found');
  }
});

// @desc    Delete a message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
const deleteMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findById(req.params.id);

  if (message) {
    await message.deleteOne();
    res.json({ message: 'Message removed' });
  } else {
    res.status(404);
    throw new Error('Message not found');
  }
});

export {
  createContactMessage,
  getContactMessages,
  markMessageAsRead,
  deleteMessage,
}; 