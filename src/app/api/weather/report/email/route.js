import nodemailer from 'nodemailer';
import { getOrGeneratePdfReport, slugifyCity, getReportDateStr } from '@/lib/pdfCache';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request) {
  try {
    const { email, city = 'Rajkot', date } = await request.json();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return Response.json({ success: false, message: 'Please provide a valid email address.' }, { status: 400 });
    }

    const citySlug = slugifyCity(city);
    const dateStr = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : getReportDateStr(new Date());

    const { buffer } = await getOrGeneratePdfReport(city, dateStr);

    const mailOptions = {
      from: `"Weather Notify" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: `Today's Weather Report — ${city}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; color: #1e293b; }
            .container { max-width: 560px; margin: 24px auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 24px; }
            .header { border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px; }
            .title { color: #2563eb; font-size: 20px; font-weight: bold; margin: 0; }
            .btn { display: inline-block; background-color: #2563eb; color: #ffffff; padding: 11px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px; margin-top: 16px; }
            .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="title">Weather Notify</h1>
            </div>
            <h2>Daily Weather Report for ${city}</h2>
            <p>Hi,</p>
            <p>Please find attached today's official 1-page Daily Weather Report PDF for <strong>${city}</strong> (${dateStr}).</p>
            <p>You can also view the live report anytime online:</p>
            <a href="${(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')}/reports/${citySlug}/${dateStr}" style="display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center;"><span style="color: #ffffff !important; text-decoration: none;">View Report Online</span></a>
            <div class="footer">
              Weather Notify Support · © ${new Date().getFullYear()} Weather Notify
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `Weather-Report-${citySlug}-${dateStr}.pdf`,
          content: buffer,
          contentType: 'application/pdf',
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return Response.json({ success: true, message: `Weather report sent to ${email}!` });
  } catch (error) {
    console.error('Error sending report email:', error);
    return Response.json({ success: false, message: 'Failed to send report email.' }, { status: 500 });
  }
}
