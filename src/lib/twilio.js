const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const client = twilio(accountSid, authToken);

/**
 * Format any phone number input into clean Twilio WhatsApp E.164 format
 * e.g. "9876543210" -> "whatsapp:+919876543210"
 * e.g. "+919876543210" -> "whatsapp:+919876543210"
 * e.g. "whatsapp:+919876543210" -> "whatsapp:+919876543210"
 */
export const formatWhatsAppNumber = (phone) => {
  if (!phone) return '';
  let clean = phone.toString().replace(/^whatsapp:/i, '').trim();
  if (!clean.startsWith('+')) {
    // If 10 digits without country code, default to +91 (India)
    if (clean.length === 10) {
      clean = `+91${clean}`;
    } else {
      clean = `+${clean}`;
    }
  }
  return `whatsapp:${clean}`;
};

export const sendWhatsAppMessage = async (to, body) => {
  try {
    const formattedTo = formatWhatsAppNumber(to);
    const res = await client.messages.create({
      body: body,
      from: twilioWhatsAppNumber,
      to: formattedTo,
    });
    console.log(`WhatsApp message sent to ${formattedTo} (SID: ${res.sid})`);
    return res;
  } catch (error) {
    console.error(`Failed to send WhatsApp message to ${to}:`, error.message || error);
    throw error;
  }
};

export const sendWhatsAppMenu = async (to) => {
  try {
    const formattedTo = formatWhatsAppNumber(to);
    const res = await client.messages.create({
      from: twilioWhatsAppNumber,
      to: formattedTo,
      interactive: {
        type: 'list',
        body: {
          text: 'Menu: choose a command',
        },
        action: {
          button: 'Open menu',
          sections: [
            {
              title: 'Commands',
              rows: [
                { id: 'WEATHER', title: 'WEATHER', description: 'Get weather for your saved city' },
                { id: 'WEATHER_CITY', title: 'WEATHER CITY', description: 'Get weather for a specific city' },
                { id: 'UPDATE_BOTH', title: 'UPDATE NAME | CITY', description: 'Update name and city together' },
                { id: 'UPDATE_NAME', title: 'UPDATE NAME', description: 'Update only your name' },
                { id: 'UPDATE_CITY', title: 'UPDATE CITY', description: 'Update only your city' },
                { id: 'STOP', title: 'STOP', description: 'Delete your subscription' },
              ],
            },
          ],
        },
      },
    });
    console.log(`WhatsApp menu sent to ${formattedTo} (SID: ${res.sid})`);
    return res;
  } catch (error) {
    console.error(`Failed to send WhatsApp menu to ${to}:`, error.message || error);
    throw error;
  }
};
