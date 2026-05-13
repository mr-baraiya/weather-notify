const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const client = twilio(accountSid, authToken);

export const sendWhatsAppMessage = async (to, body) => {
  try {
    await client.messages.create({
      body: body,
      from: twilioWhatsAppNumber,
      to: `whatsapp:${to}`,
    });
    console.log(`Message sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send message to ${to}:`, error);
  }
};
