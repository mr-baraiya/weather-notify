import mongoose from 'mongoose';

const AdminUserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    passwordHash: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      default: 'system',
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.AdminUser ||
  mongoose.model('AdminUser', AdminUserSchema);
