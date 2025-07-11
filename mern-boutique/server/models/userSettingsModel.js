import mongoose from 'mongoose';

const userSettingsSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    currency: {
      type: String,
      default: '$',
    },
    theme: {
      type: String,
      default: 'light',
    },
    notifications: {
      orderUpdates: {
        type: Boolean,
        default: true,
      },
      promotions: {
        type: Boolean,
        default: true,
      },
      newArrivals: {
        type: Boolean,
        default: false,
      },
      priceDrops: {
        type: Boolean,
        default: true,
      },
    },
    privacy: {
      shareActivity: {
        type: Boolean,
        default: false,
      },
      saveSearchHistory: {
        type: Boolean,
        default: true,
      },
      allowCookies: {
        type: Boolean,
        default: true,
      },
    },
    language: {
      type: String,
      default: 'en',
    },
  },
  {
    timestamps: true,
  }
);

const UserSettings = mongoose.model('UserSettings', userSettingsSchema);

export default UserSettings; 