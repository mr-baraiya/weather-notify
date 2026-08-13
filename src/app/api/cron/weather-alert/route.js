import connectToDatabase from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';
import { getFullWeatherData } from '@/lib/weather';
import { sendWhatsAppMessage } from '@/lib/twilio';
import { evaluateWeatherAlerts } from '@/lib/alertTemplates';

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response(
      JSON.stringify({ success: false, message: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    await connectToDatabase();
    const subscribers = await Subscriber.find({ isActive: { $ne: false } });
    let sentCount = 0;

    for (const subscriber of subscribers) {
      try {
        const weatherBundle = await getFullWeatherData(subscriber.city);
        const alerts = evaluateWeatherAlerts(subscriber, weatherBundle);

        for (const alert of alerts) {
          await sendWhatsAppMessage(subscriber.phone, alert.text);
          subscriber[alert.type] = new Date();
          await subscriber.save();
          sentCount++;
        }
      } catch (subErr) {
        console.error(`Error processing subscriber ${subscriber.phone}:`, subErr.message || subErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Alerts processed successfully. Dispatched ${sentCount} notifications.`,
        sentCount,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in /api/cron/weather-alert:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response(
      JSON.stringify({ success: false, message: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const { phone, alertType } = body;

    await connectToDatabase();
    const query = phone ? { phone, isActive: { $ne: false } } : { isActive: { $ne: false } };
    const subscribers = await Subscriber.find(query);

    let sentCount = 0;
    for (const subscriber of subscribers) {
      try {
        const weatherBundle = await getFullWeatherData(subscriber.city);
        const alerts = evaluateWeatherAlerts(subscriber, weatherBundle, alertType);

        for (const alert of alerts) {
          await sendWhatsAppMessage(subscriber.phone, alert.text);
          subscriber[alert.type] = new Date();
          await subscriber.save();
          sentCount++;
        }
      } catch (subErr) {
        console.error(`Error processing subscriber ${subscriber.phone}:`, subErr.message || subErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Dispatched ${sentCount} alerts using templates.`,
        sentCount,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in POST /api/cron/weather-alert:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
