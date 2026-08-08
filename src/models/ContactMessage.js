import mongoose from 'mongoose';

const ContactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name.'],
    minlength: 2,
    maxlength: 100,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    maxlength: 200,
  },
  category: {
    type: String,
    required: [true, 'Please select a category.'],
    maxlength: 100,
  },
  message: {
    type: String,
    required: [true, 'Please provide a message.'],
    minlength: 10,
    maxlength: 2000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.ContactMessage || mongoose.model('ContactMessage', ContactMessageSchema);
