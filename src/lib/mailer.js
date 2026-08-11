import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false, // 587 uses STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(toEmail, resetUrl) {
  const mailOptions = {
    from: `"Weather Notify Admin" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Reset Your Weather Notify Admin Password',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #f8fafc; color: #1e293b; max-width: 600px; margin: 0 auto; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #4f46e5; font-size: 24px; margin: 0;">Weather Notify</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Admin Portal</p>
        </div>
        <div style="background-color: #ffffff; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h2 style="font-size: 18px; font-weight: 600; margin-top: 0; color: #0f172a;">Password Reset Request</h2>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">You requested a password reset for your admin account. Click the button below to reset your password. This link is valid for <strong>1 hour</strong>.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">Reset Password</a>
          </div>
          <p style="font-size: 12px; color: #64748b; line-height: 1.5;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="font-size: 12px; color: #4f46e5; word-break: break-all; margin-top: 4px;">${resetUrl}</p>
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #94a3b8;">
          <p>If you did not request a password reset, please ignore this email.</p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}
