# Twilio WhatsApp Setup

This guide shows how to create a Twilio account, find the credentials this app needs, and configure WhatsApp messaging for local development.

## Prerequisites

- A Twilio account: https://www.twilio.com/
- A phone number that can join the WhatsApp sandbox

## Get Your Twilio Credentials

1. Sign in to the [Twilio Console](https://console.twilio.com/).
2. On the dashboard, copy your **Account SID** and **Auth Token**.
3. Keep these values private. They are the credentials used by the server to send WhatsApp messages.

## Enable WhatsApp Messaging

1. In the Twilio Console, open **Messaging**.
2. Go to **Try it out** or **Send a WhatsApp message**.
3. Follow the sandbox instructions shown by Twilio.
4. Send the join code from your WhatsApp number to the Twilio sandbox number.
5. Once joined, note the WhatsApp-enabled Twilio sender number.

If you want the app to display the onboarding steps after a successful registration, set these values in `.env`:

```env
TWILIO_WHATSAPP_JOIN_MESSAGE=join stand-exclaimed
TWILIO_WHATSAPP_SANDBOX_NUMBER=+1 415 523 8886
TWILIO_WHATSAPP_CONFIRMATION_MESSAGE=✅ You are all set! The sandbox can now send/receive messages.
```

## Add the Values to `.env.local`

```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
ADMIN_WHATSAPP_NUMBER=+911234567890
```

## What Each Value Means

- `TWILIO_ACCOUNT_SID`: Your Twilio account identifier.
- `TWILIO_AUTH_TOKEN`: Your Twilio secret token.
- `TWILIO_WHATSAPP_NUMBER`: The WhatsApp sender number provided by Twilio.
- `ADMIN_WHATSAPP_NUMBER`: The number that receives contact form notifications.

## Notes

- For production, you must request WhatsApp approval from Twilio.
- The sandbox number is fine for development, but production deployments should use an approved sender.
- Never commit real Twilio credentials to the repository.
