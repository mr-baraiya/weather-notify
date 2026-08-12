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
    font-family: Arial, Helvetica, sans-serif;
    background-color: #f8fafc;
    padding: 32px 16px;
    color: #1e293b;
  `,
  container: `
    max-width: 560px;
    margin: 0 auto;
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    overflow: hidden;
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
  `,
  title: `
    margin: 0 0 12px;
    color: #0f172a;
    font-size: 18px;
    font-weight: 600;
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
    padding: 11px 20px;
    border-radius: 6px;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
  `,
  footer: `
    padding: 18px 24px;
    border-top: 1px solid #e2e8f0;
    color: #94a3b8;
    font-size: 12px;
    line-height: 1.5;
  `,
};

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
      <div style="${emailStyles.wrapper}">
        <div style="${emailStyles.container}">

          <div style="${emailStyles.header}">
            <h1 style="${emailStyles.logo}">Weather Notify</h1>
          </div>

          <div style="${emailStyles.content}">
            <h2 style="${emailStyles.title}">Reset your password</h2>

            <p style="${emailStyles.text}">
              We received a request to reset your Weather Notify admin password.
              This link will expire in 1 hour.
            </p>

            <div style="margin: 24px 0;">
              <a href="${safeResetUrl}" style="${emailStyles.button}">
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

          <div style="${emailStyles.footer}">
            If you did not request a password reset, you can safely ignore this email.
          </div>

        </div>
      </div>
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
      <div style="${emailStyles.wrapper}">
        <div style="${emailStyles.container}">

          <div style="${emailStyles.header}">
            <h1 style="${emailStyles.logo}">Weather Notify</h1>
          </div>

          <div style="${emailStyles.content}">
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
                    ">
                      ${safeOriginalMessage}
                    </div>
                  </div>
                `
        : ''
      }
          </div>

          <div style="${emailStyles.footer}">
            Weather Notify Support<br>
            © ${new Date().getFullYear()} Weather Notify
          </div>

        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}
