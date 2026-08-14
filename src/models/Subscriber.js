import mongoose from 'mongoose';

const SubscriberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name.'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  city: {
    type: String,
    required: [true, 'Please provide a city.'],
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number.'],
    unique: true,
  },
  // Anti-Spam & Alert Cooldown Timestamps
  lastDailyWeatherSent: { type: Date, default: null },
  lastDailyEveningSent: { type: Date, default: null },
  lastRainAlertSent: { type: Date, default: null },
  lastHeatAlertSent: { type: Date, default: null },
  lastAQIAlertSent: { type: Date, default: null },
  lastSevereWeatherAlertSent: { type: Date, default: null },
  lastThunderstormAlertSent: { type: Date, default: null },
  lastStrongWindAlertSent: { type: Date, default: null },
  lastColdWeatherAlertSent: { type: Date, default: null },
  lastUVAlertSent: { type: Date, default: null },
  lastVisibilityAlertSent: { type: Date, default: null },
  lastSandboxReminderSent: { type: Date, default: null },
  // WhatsApp Command Quota Tracking
  dailyCommandCount: { type: Number, default: 0 },
  lastCommandDate: { type: Date, default: null },
  // Status & Audit Fields
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: String,
    default: 'User',
  },
  updatedBy: {
    type: String,
    default: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.models.Subscriber || mongoose.model('Subscriber', SubscriberSchema);
