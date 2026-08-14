import connectToDatabase from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';
import { toTitleCase } from '@/lib/format';
import { sendWelcomeEmail } from '@/lib/mailer';

const DEFAULT_JOIN_MESSAGE = 'join stand-exclaimed';
const DEFAULT_SANDBOX_NUMBER = '+1 415 523 8886';
const DEFAULT_CONFIRMATION_MESSAGE = '✅ You are all set! The sandbox can now send/receive messages.';

const formatSandboxNumber = (value) => {
  if (!value) {
    return DEFAULT_SANDBOX_NUMBER;
  }

  const normalized = value.replace(/^whatsapp:/i, '').trim();
  if (!normalized) {
    return DEFAULT_SANDBOX_NUMBER;
  }

  if (normalized.includes(' ')) {
    return normalized;
  }

  const digits = normalized.replace(/[^\d+]/g, '');
  if (!digits.startsWith('+')) {
    return normalized;
  }

  const phoneDigits = digits.slice(1);
  if (phoneDigits.length === 11 && phoneDigits.startsWith('1')) {
    return `+1 ${phoneDigits.slice(1, 4)} ${phoneDigits.slice(4, 7)} ${phoneDigits.slice(7)}`;
  }

  return normalized;
};

const buildWhatsAppSetup = () => ({
  title: 'Connect Your WhatsApp',
  intro: 'To receive weather updates and alerts on WhatsApp:',
  joinMessage: process.env.TWILIO_WHATSAPP_JOIN_MESSAGE || DEFAULT_JOIN_MESSAGE,
  sandboxNumber: formatSandboxNumber(process.env.TWILIO_WHATSAPP_SANDBOX_NUMBER),
  confirmationMessage: process.env.TWILIO_WHATSAPP_CONFIRMATION_MESSAGE || DEFAULT_CONFIRMATION_MESSAGE,
  returnLabel: 'I have connected WhatsApp',
});

export async function POST(request) {
  try {
    await connectToDatabase();
    const { name, city, phone, email } = await request.json();

    if (!name || !city || !phone || !email) {
      return new Response(JSON.stringify({ success: false, message: 'Missing required fields' }), { status: 400 });
    }

    if (!/^\+\d{10,15}$/.test(phone)) {
      return new Response(JSON.stringify({ success: false, message: 'Phone number must be in E.164 format' }), { status: 400 });
    }

    const newSubscriber = new Subscriber({
      name: toTitleCase(name),
      city: toTitleCase(city),
      phone,
      email,
      isActive: true,
      createdBy: 'User',
      updatedBy: 'User',
    });
    await newSubscriber.save();

    const joinMessage = process.env.TWILIO_WHATSAPP_JOIN_MESSAGE || DEFAULT_JOIN_MESSAGE;
    const sandboxNumber = formatSandboxNumber(process.env.TWILIO_WHATSAPP_SANDBOX_NUMBER);
    const rawDigits = sandboxNumber.replace(/[^\d]/g, '');
    const whatsappLink = `https://wa.me/${rawDigits || '14155238886'}?text=${encodeURIComponent(joinMessage)}`;

    try {
      await sendWelcomeEmail(newSubscriber.email, newSubscriber.name, whatsappLink, joinMessage, sandboxNumber);
    } catch (err) {
      console.error('Failed to send welcome email:', err);
    }

    return new Response(JSON.stringify({
      success: true,
      data: newSubscriber,
      whatsappSetup: buildWhatsAppSetup(),
    }), { status: 201 });
  } catch (error) {
    console.error('Error in /api/subscribe:', error);
    if (error.code === 11000) {
      return new Response(JSON.stringify({ success: false, message: 'This phone number is already subscribed.' }), { status: 409 });
    }
    return new Response(JSON.stringify({ success: false, message: 'Server Error' }), { status: 500 });
  }
}
