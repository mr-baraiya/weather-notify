import connectToDatabase from '@/lib/mongodb';
import ContactMessage from '@/models/ContactMessage';
import { sendWhatsAppMessage } from '@/lib/twilio';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeAdminPhone = (value) => {
  if (!value) {
    return null;
  }
  if (value.startsWith('+')) {
    return value;
  }
  return `+${value}`;
};

export async function POST(request) {
  try {
    await connectToDatabase();
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ success: false, message: 'All fields are required.' }), { status: 400 });
    }

    if (name.trim().length < 2) {
      return new Response(JSON.stringify({ success: false, message: 'Name must be at least 2 characters.' }), { status: 400 });
    }

    if (!EMAIL_REGEX.test(email)) {
      return new Response(JSON.stringify({ success: false, message: 'Please provide a valid email address.' }), { status: 400 });
    }

    if (message.trim().length < 10) {
      return new Response(JSON.stringify({ success: false, message: 'Message must be at least 10 characters.' }), { status: 400 });
    }

    const contactMessage = new ContactMessage({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    });

    await contactMessage.save();

    const adminPhone = normalizeAdminPhone(process.env.ADMIN_WHATSAPP_NUMBER);
    if (adminPhone) {
      const alertMessage = `New contact request\nName: ${contactMessage.name}\nEmail: ${contactMessage.email}\nMessage: ${contactMessage.message}`;
      await sendWhatsAppMessage(adminPhone, alertMessage);
    }

    return new Response(JSON.stringify({ success: true, message: 'Message sent successfully.' }), { status: 201 });
  } catch (error) {
    console.error('Error in /api/contact:', error);
    return new Response(JSON.stringify({ success: false, message: 'Server Error' }), { status: 500 });
  }
}
