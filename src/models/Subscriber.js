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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Subscriber || mongoose.model('Subscriber', SubscriberSchema);
