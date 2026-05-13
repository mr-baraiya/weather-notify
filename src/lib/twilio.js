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

export const sendWhatsAppMenu = async (to) => {
  try {
    await client.messages.create({
      from: twilioWhatsAppNumber,
      to: `whatsapp:${to}`,
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
    console.log(`Menu sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send menu to ${to}:`, error);
    throw error;
  }
};
