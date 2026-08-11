import connectToDatabase from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';
import { sendWhatsAppMessage } from '@/lib/twilio';

function authError() {
  return new Response(
    JSON.stringify({ success: false, message: 'Unauthorized' }),
    { status: 401, headers: { 'Content-Type': 'application/json' } }
  );
}

/**
 * POST /api/admin/broadcast
 * Body: { message: string, target: 'all' | 'specific', subscriberId?: string }
 */
export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) return authError();

  try {
    const body = await request.json();
    const { message, target, subscriberId } = body;

    if (!message || !message.trim()) {
      return new Response(
        JSON.stringify({ success: false, message: 'Message is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!target || !['all', 'specific'].includes(target)) {
      return new Response(
        JSON.stringify({ success: false, message: 'target must be "all" or "specific".' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await connectToDatabase();

    let subscribers = [];

    if (target === 'all') {
      subscribers = await Subscriber.find({});
    } else {
      if (!subscriberId) {
        return new Response(
          JSON.stringify({ success: false, message: 'subscriberId is required for specific target.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      const sub = await Subscriber.findById(subscriberId);
      if (!sub) {
        return new Response(
          JSON.stringify({ success: false, message: 'Subscriber not found.' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
      subscribers = [sub];
    }

    let sent = 0;
    let failed = 0;
    const errors = [];

    for (const subscriber of subscribers) {
      try {
        const personalizedMessage = message.replace(/\{name\}/gi, subscriber.name);
        await sendWhatsAppMessage(subscriber.phone, personalizedMessage);
        sent++;
      } catch (err) {
        failed++;
        errors.push({ phone: subscriber.phone, error: err.message });
      }
    }

    const allFailed = sent === 0 && failed > 0;

    return new Response(
      JSON.stringify({
        success: !allFailed,
        message: allFailed
          ? `Failed to send message. ${errors[0]?.error || 'Check server logs for details.'}`
          : `Message sent to ${sent} subscriber(s).${failed > 0 ? ` Failed: ${failed}.` : ''}`,
        data: { sent, failed, errors },
      }),
      { status: allFailed ? 502 : 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in /api/admin/broadcast:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Server error.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
