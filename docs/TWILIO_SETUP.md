# Twilio WhatsApp Credentials

Prerequisites
- A Twilio account: https://www.twilio.com/

Steps
1. In Twilio Console, note your Account SID and Auth Token.
2. Go to Messaging > Try it out > Send a WhatsApp message.
3. Follow the sandbox join instructions for your phone number.
4. Copy the sandbox WhatsApp number.

Add to .env.local
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
ADMIN_WHATSAPP_NUMBER=+911234567890

Notes
- For production, you must request WhatsApp approval in Twilio.
- The admin number is used for contact form notifications.
