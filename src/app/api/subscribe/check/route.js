import connectToDatabase from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return new Response(JSON.stringify({ exists: false, message: 'Phone number is required' }), { status: 400 });
    }

    if (!/^\+\d{10,15}$/.test(phone)) {
      return new Response(JSON.stringify({ exists: false, message: 'Phone number must be in E.164 format' }), { status: 400 });
    }

    const existingSubscriber = await Subscriber.findOne({ phone });

    if (existingSubscriber) {
      return new Response(JSON.stringify({ exists: true }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ exists: false }), { status: 200 });
    }
  } catch (error) {
    console.error('Error in /api/subscribe/check:', error);
    return new Response(JSON.stringify({ success: false, message: 'Server Error' }), { status: 500 });
  }
}
