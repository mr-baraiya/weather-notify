import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const emailStyles = {
  wrapper: `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: #f8fafc;
    padding: 32px 16px;
    color: #1e293b;
    width: 100%;
    box-sizing: border-box;
  `,
  container: `
    max-width: 560px;
    width: 100%;
    margin: 0 auto;
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    overflow: hidden;
    box-sizing: border-box;
  `,
  header: `
    padding: 22px 24px;
    border-bottom: 1px solid #e2e8f0;
  `,
  logo: `
    margin: 0;
    color: #2563eb;
    font-size: 21px;
    font-weight: 700;
  `,
  content: `
    padding: 24px;
    box-sizing: border-box;
  `,
  title: `
    margin: 0 0 12px;
    color: #0f172a;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.35;
  `,
  text: `
    margin: 0 0 16px;
    color: #475569;
    font-size: 14px;
    line-height: 1.6;
  `,
  button: `
    display: inline-block;
    background-color: #2563eb;
    color: #ffffff;
    padding: 12px 22px;
    border-radius: 6px;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    text-align: center;
    box-sizing: border-box;
  `,
  footer: `
    padding: 18px 24px;
    border-top: 1px solid #e2e8f0;
    color: #94a3b8;
    font-size: 12px;
    line-height: 1.5;
  `,
};

const mobileStyleHeader = `
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #f8fafc; }
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 12px 8px !important; }
      .email-container { width: 100% !important; max-width: 100% !important; border-radius: 8px !important; }
      .email-header { padding: 16px !important; }
      .email-content { padding: 16px !important; }
      .email-button { display: block !important; width: 100% !important; text-align: center !important; box-sizing: border-box !important; padding: 14px 16px !important; }
      .email-footer { padding: 14px 16px !important; }
      .email-card { padding: 16px 12px !important; }
    }
  </style>
`;

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export async function sendPasswordResetEmail(toEmail, resetUrl) {
  const safeResetUrl = escapeHtml(resetUrl);

  const mailOptions = {
    from: `"Weather Notify" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Reset Your Weather Notify Password',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        ${mobileStyleHeader}
        <title>Reset Your Password</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc;">
        <div class="email-wrapper" style="${emailStyles.wrapper}">
          <div class="email-container" style="${emailStyles.container}">

            <div class="email-header" style="${emailStyles.header}">
              <h1 style="${emailStyles.logo}">Weather Notify</h1>
            </div>

            <div class="email-content" style="${emailStyles.content}">
              <h2 style="${emailStyles.title}">Reset your password</h2>

              <p style="${emailStyles.text}">
                We received a request to reset your Weather Notify admin password.
                This link will expire in 1 hour.
              </p>

              <div style="margin: 24px 0;">
                <a href="${safeResetUrl}" class="email-button" style="${emailStyles.button}">
                  Reset Password
                </a>
              </div>

              <p style="${emailStyles.text}">
                If the button doesn't work, copy and paste this link into your browser:
              </p>

              <p style="
                margin: 0;
                color: #2563eb;
                font-size: 12px;
                line-height: 1.5;
                word-break: break-all;
              ">
                ${safeResetUrl}
              </p>
            </div>

            <div class="email-footer" style="${emailStyles.footer}">
              If you did not request a password reset, you can safely ignore this email.
            </div>

          </div>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
}

export async function sendWelcomeEmail(
  toEmail,
  recipientName,
  whatsappLink,
  joinMessage,
  sandboxNumber
) {
  const safeName = escapeHtml(recipientName || 'Subscriber');
  const safeLink = escapeHtml(whatsappLink || 'https://wa.me/14155238886?text=join%20stand-exclaimed');
  const safeMessage = escapeHtml(joinMessage || 'join stand-exclaimed');
  const safeNumber = escapeHtml(sandboxNumber || '+1 415 523 8886');

  const mailOptions = {
    from: `"Weather Notify" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Welcome to Weather Notify - Account Successfully Created!',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        ${mobileStyleHeader}
        <title>Welcome to Weather Notify</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc;">
        <div class="email-wrapper" style="${emailStyles.wrapper}">
          <div class="email-container" style="${emailStyles.container}">

            <div class="email-header" style="${emailStyles.header}">
              <h1 style="${emailStyles.logo}">Weather Notify</h1>
            </div>

            <div class="email-content" style="${emailStyles.content}">
              <h2 style="${emailStyles.title}">Account Successfully Created</h2>

              <p style="${emailStyles.text}">
                Hi <strong>${safeName}</strong>,<br>
                Your account has been successfully created in <strong>Weather Notify</strong>. You are now set up to receive daily weather updates and severe weather alerts.
              </p>

              <div class="email-card" style="margin: 20px 0; padding: 20px; background-color: #f1f5f9; border-radius: 8px; text-align: center; box-sizing: border-box;">
                <h3 style="margin: 0 0 10px; color: #0f172a; font-size: 16px;">Connect with Weather Notify on WhatsApp</h3>
                <p style="${emailStyles.text}">
                  Click the button below to join our WhatsApp notification service:
                </p>

                <div style="margin: 18px 0;">
                  <a href="${safeLink}" target="_blank" class="email-button" style="${emailStyles.button}">
                    Join Weather Notify on WhatsApp
                  </a>
                </div>

                <div style="margin-top: 16px; padding: 12px; background-color: #ffffff; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 13px; color: #334155; text-align: left; word-break: break-word;">
                  <strong>Manual Join Instructions:</strong><br>
                  Send <code>${safeMessage}</code> to <strong>${safeNumber}</strong> on WhatsApp.
                </div>
              </div>

              <div style="margin: 20px 0; padding: 14px; background-color: #eff6ff; border-left: 4px solid #2563eb; border-radius: 4px;">
                <p style="margin: 0; color: #1e40af; font-size: 13px; line-height: 1.5;">
                  <strong>Note:</strong> If you have already joined Weather Notify on WhatsApp, please ignore this link and setup step.
                </p>
              </div>
            </div>

            <div class="email-footer" style="${emailStyles.footer}">
              Weather Notify Team<br>
              © ${new Date().getFullYear()} Weather Notify
            </div>

          </div>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
}

export async function sendContactReplyEmail(
  toEmail,
  recipientName,
  category,
  originalMessage,
  replyMessage
) {
  const safeName = escapeHtml(recipientName || 'there');
  const safeCategory = escapeHtml(category || 'Inquiry');
  const safeReplyMessage = escapeHtml(replyMessage || '').replace(/\n/g, '<br>');
  const safeOriginalMessage = escapeHtml(originalMessage || '').replace(
    /\n/g,
    '<br>'
  );

  const mailOptions = {
    from: `"Weather Notify" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Re: [${safeCategory}] Weather Notify Support Response`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        ${mobileStyleHeader}
        <title>Weather Notify Support Response</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc;">
        <div class="email-wrapper" style="${emailStyles.wrapper}">
          <div class="email-container" style="${emailStyles.container}">

            <div class="email-header" style="${emailStyles.header}">
              <h1 style="${emailStyles.logo}">Weather Notify</h1>
            </div>

            <div class="email-content" style="${emailStyles.content}">
              <h2 style="${emailStyles.title}">Support response</h2>

              <p style="${emailStyles.text}">
                Hi <strong>${safeName}</strong>,
              </p>

              <div style="
                margin: 20px 0;
                padding: 16px;
                background-color: #f8fafc;
                border-left: 3px solid #2563eb;
                color: #334155;
                font-size: 14px;
                line-height: 1.6;
                word-break: break-word;
              ">
                ${safeReplyMessage}
              </div>

              ${originalMessage
          ? `
                    <div style="
                      margin-top: 24px;
                      padding-top: 18px;
                      border-top: 1px solid #e2e8f0;
                    ">
                      <p style="
                        margin: 0 0 8px;
                        color: #64748b;
                        font-size: 12px;
                        font-weight: 600;
                      ">
                        Your original message · ${safeCategory}
                      </p>

                      <div style="
                        padding: 12px;
                        background-color: #f8fafc;
                        color: #64748b;
                        font-size: 12px;
                        line-height: 1.5;
                        border-radius: 6px;
                        word-break: break-word;
                      ">
                        ${safeOriginalMessage}
                      </div>
                    </div>
                  `
          : ''
        }
            </div>

            <div class="email-footer" style="${emailStyles.footer}">
              Weather Notify Support<br>
              © ${new Date().getFullYear()} Weather Notify
            </div>

          </div>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
}

export async function sendTwilioLimitEmail(toEmail, dailyCount = 50) {
  const recipient = toEmail || process.env.SMTP_USER || process.env.SMTP_FROM;
  if (!recipient) {
    console.error('Cannot send Twilio limit email: No recipient email configured.');
    return;
  }

  const mailOptions = {
    from: `"Weather Notify Alert" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: recipient,
    subject: `Alert: Daily Twilio Message Limit Reached (${dailyCount}/50)`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        ${mobileStyleHeader}
        <title>Twilio Daily Limit Reached Alert</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc;">
        <div class="email-wrapper" style="${emailStyles.wrapper}">
          <div class="email-container" style="${emailStyles.container}">

            <div class="email-header" style="${emailStyles.header}">
              <h1 style="${emailStyles.logo}">Weather Notify</h1>
            </div>

            <div class="email-content" style="${emailStyles.content}">
              <h2 style="${emailStyles.title}">Daily Twilio Limit Reached</h2>

              <p style="${emailStyles.text}">
                Our system-wide daily Twilio WhatsApp message limit of <strong>${dailyCount} messages</strong> has been reached for today.
              </p>

              <div class="email-card" style="margin: 20px 0; padding: 16px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 6px; box-sizing: border-box;">
                <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
                  <strong>Action Notice:</strong> Our daily Twilio limit is reached. Outbound WhatsApp messages and interactive menu responses are paused for the remainder of today.
                </p>
              </div>

              <p style="${emailStyles.text}">
                The daily system counter will reset automatically on the next calendar day.
              </p>
            </div>

            <div class="email-footer" style="${emailStyles.footer}">
              Weather Notify System Alerts<br>
              © ${new Date().getFullYear()} Weather Notify
            </div>

          </div>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
}

export async function sendSandboxReminderEmail(
  toEmail,
  recipientName,
  whatsappLink,
  joinMessage,
  sandboxNumber
) {
  const safeName = escapeHtml(recipientName || 'Subscriber');
  const safeLink = escapeHtml(whatsappLink || 'https://wa.me/14155238886?text=join%20stand-exclaimed');
  const safeMessage = escapeHtml(joinMessage || 'join stand-exclaimed');
  const safeNumber = escapeHtml(sandboxNumber || '+1 415 523 8886');

  const mailOptions = {
    from: `"Weather Notify" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Renew Your WhatsApp Weather Alerts Sandbox Session',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        ${mobileStyleHeader}
        <title>Renew Your WhatsApp Sandbox Session</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc;">
        <div class="email-wrapper" style="${emailStyles.wrapper}">
          <div class="email-container" style="${emailStyles.container}">

            <div class="email-header" style="${emailStyles.header}">
              <h1 style="${emailStyles.logo}">Weather Notify</h1>
            </div>

            <div class="email-content" style="${emailStyles.content}">
              <h2 style="${emailStyles.title}">WhatsApp Sandbox Session Expired</h2>

              <p style="${emailStyles.text}">
                Hi <strong>${safeName}</strong>,<br>
                It has been 72 hours since you last joined or interacted with Weather Notify on WhatsApp. Because we are currently operating in <strong>Twilio Sandbox Mode</strong>, Twilio requires Sandbox sessions to be renewed once every 72 hours (3 days).
              </p>

              <div class="email-card" style="margin: 20px 0; padding: 20px; background-color: #fffbeb; border-radius: 8px; text-align: center; box-sizing: border-box; border: 1px solid #fef3c7;">
                <h3 style="margin: 0 0 10px; color: #78350f; font-size: 16px;">Quick Sandbox Session Renewal</h3>
                <p style="${emailStyles.text}">
                  Click the button below to send the sandbox join keyword again:
                </p>

                <div style="margin: 18px 0;">
                  <a href="${safeLink}" target="_blank" class="email-button" style="${emailStyles.button}">
                    Renew WhatsApp Session
                  </a>
                </div>

                <div style="margin-top: 16px; padding: 12px; background-color: #ffffff; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 13px; color: #334155; text-align: left; word-break: break-word;">
                  <strong>Manual Opt-In:</strong><br>
                  Send <code>${safeMessage}</code> to <strong>${safeNumber}</strong> on WhatsApp.
                </div>
              </div>

              <p style="${emailStyles.text}">
                If you do not renew your sandbox session, Twilio will block daily morning weather notifications and severe alerts. Renewing takes only 2 seconds!
              </p>
            </div>

            <div class="email-footer" style="${emailStyles.footer}">
              Weather Notify Team<br>
              © ${new Date().getFullYear()} Weather Notify
            </div>

          </div>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
}


