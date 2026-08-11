import crypto from 'crypto';
import connectToDatabase from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';
import { sendPasswordResetEmail } from '@/lib/mailer';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

/**
 * POST /api/admin/forgot-password
 * Body: { email: string }
 */
export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !email.trim()) {
      return json({ success: false, message: 'Email address is required.' }, 400);
    }

    const cleanEmail = email.trim().toLowerCase();

    await connectToDatabase();

    const admin = await AdminUser.findOne({ email: cleanEmail });
    if (!admin) {
      return json({ success: false, message: 'No admin account found with this email address.' }, 444 ? 404 : 404);
    }

    // Generate random 64-char reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    admin.resetToken = token;
    admin.resetTokenExpires = expires;
    await admin.save();

    // Determine domain dynamically from request headers or environment variable
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '') : `${protocol}://${host}`;
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // Send email via nodemailer SMTP
    await sendPasswordResetEmail(admin.email, resetUrl);

    return json({
      success: true,
      message: 'A password reset link has been sent to your email address.',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return json({ success: false, message: 'Failed to send reset email. Please check server configuration.' }, 500);
  }
}
