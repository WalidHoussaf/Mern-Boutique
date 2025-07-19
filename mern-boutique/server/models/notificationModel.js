import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true 
  },
  type: {
    type: String,
    required: true,
    enum: ['success', 'error', 'info', 'warning'], 
    default: 'info'
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100 
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxLength: 500 
  },
  read: {
    type: Boolean,
    default: false,
    index: true 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add compound index for efficient querying of unread notifications for a user
notificationSchema.index({ userId: 1, read: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification; 