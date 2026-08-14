import mongoose from 'mongoose';

const SystemUsageSchema = new mongoose.Schema({
  key: {
    type: String,
    default: 'global',
    unique: true,
  },
  dailyTwilioCount: {
    type: Number,
    default: 0,
  },
  lastTwilioResetDate: {
    type: Date,
    default: null,
  },
  twilioLimitEmailSentToday: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.models.SystemUsage || mongoose.model('SystemUsage', SystemUsageSchema);
