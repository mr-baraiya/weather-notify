import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

/**
 * POST /api/admin/reset-password
 * Body: { token: string, password: string }
 */
export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token) {
      return json({ success: false, message: 'Reset token is required.' }, 400);
    }
    if (!password || password.length < 6) {
      return json({ success: false, message: 'Password must be at least 6 characters.' }, 400);
    }

    await connectToDatabase();

    const admin = await AdminUser.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() },
    });

    if (!admin) {
      return json({ success: false, message: 'Invalid or expired password reset link.' }, 400);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    admin.passwordHash = passwordHash;
    admin.resetToken = null;
    admin.resetTokenExpires = null;
    await admin.save();

    return json({
      success: true,
      message: 'Your password has been reset successfully! You can now log in.',
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return json({ success: false, message: 'Server error. Please try again later.' }, 500);
  }
}
