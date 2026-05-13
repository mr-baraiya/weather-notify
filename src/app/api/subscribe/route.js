import connectToDatabase from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';
import { toTitleCase } from '@/lib/format';

export async function POST(request) {
  try {
    await connectToDatabase();
    const { name, city, phone } = await request.json();

    if (!name || !city || !phone) {
      return new Response(JSON.stringify({ success: false, message: 'Missing required fields' }), { status: 400 });
    }

    if (!/^\+\d{10,15}$/.test(phone)) {
      return new Response(JSON.stringify({ success: false, message: 'Phone number must be in E.164 format' }), { status: 400 });
    }

    const newSubscriber = new Subscriber({
      name: toTitleCase(name),
      city: toTitleCase(city),
      phone,
    });
    await newSubscriber.save();

    return new Response(JSON.stringify({ success: true, data: newSubscriber }), { status: 201 });
  } catch (error) {
    console.error('Error in /api/subscribe:', error);
    if (error.code === 11000) {
      return new Response(JSON.stringify({ success: false, message: 'This phone number is already subscribed.' }), { status: 409 });
    }
    return new Response(JSON.stringify({ success: false, message: 'Server Error' }), { status: 500 });
  }
}
