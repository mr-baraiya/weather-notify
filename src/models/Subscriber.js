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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Subscriber || mongoose.model('Subscriber', SubscriberSchema);
