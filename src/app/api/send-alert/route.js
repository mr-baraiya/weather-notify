// This route is triggered by Vercel Cron at 6 AM IST daily
import connectToDatabase from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';
import { getWeather } from '@/lib/weather';
import { sendWhatsAppMessage } from '@/lib/twilio';

export async function GET(request) {
  // Verify cron secret so only Vercel (or authorized caller) can trigger this
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 });
  }

  try {
    await connectToDatabase();
    const subscribers = await Subscriber.find({});

    for (const subscriber of subscribers) {
      const weatherData = await getWeather(subscriber.city);
      const temp = weatherData.main.temp;
      const weatherCondition = weatherData.weather[0].main;

      if (temp > 40) {
        const message = [
          `Hi ${subscriber.name},`,
          '🔥 Heat Alert',
          `Temperature: ${Math.round(temp)}°C (feels like ${Math.round(weatherData.main.feels_like)}°C)`,
          `Condition: ${weatherData.weather[0].main} - ${weatherData.weather[0].description}`,
          `Humidity: ${weatherData.main.humidity}% | Wind: ${weatherData.wind.speed} m/s`,
          `City: ${subscriber.city}`,
          `Stay hydrated and avoid direct sun during peak hours.`,
        ].join('\n');
        await sendWhatsAppMessage(subscriber.phone, message);
      }

      if (temp <= 10) {
        const message = [
          `Hi ${subscriber.name},`,
          '❄️ Cold Alert',
          `Temperature: ${Math.round(temp)}°C (feels like ${Math.round(weatherData.main.feels_like)}°C)`,
          `Condition: ${weatherData.weather[0].main} - ${weatherData.weather[0].description}`,
          `Humidity: ${weatherData.main.humidity}% | Wind: ${weatherData.wind.speed} m/s`,
          `City: ${subscriber.city}`,
          'Wear warm layers and limit exposure to cold winds.',
        ].join('\n');
        await sendWhatsAppMessage(subscriber.phone, message);
      }

      if (weatherCondition === 'Rain') {
        const message = [
          `Hi ${subscriber.name},`,
          '🌧️ Rain Alert',
          `Condition: ${weatherData.weather[0].main} - ${weatherData.weather[0].description}`,
          `Temperature: ${Math.round(temp)}°C (feels like ${Math.round(weatherData.main.feels_like)}°C)`,
          `Humidity: ${weatherData.main.humidity}% | Wind: ${weatherData.wind.speed} m/s`,
          `City: ${subscriber.city}`,
          'Carry an umbrella and drive safely.',
        ].join('\n');
        await sendWhatsAppMessage(subscriber.phone, message);
      }
    }

    return new Response(JSON.stringify({ success: true, message: 'Alerts sent successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error in /api/send-alert:', error);
    return new Response(JSON.stringify({ success: false, message: 'Server Error' }), { status: 500 });
  }
}
