// This route is triggered by GitHub Actions / Vercel Cron at 6 AM IST daily
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
      try {
        const weatherData = await getWeather(subscriber.city);
        const temp = weatherData.main.temp;
        const feelsLike = weatherData.main.feels_like;
        const weatherCondition = weatherData.weather[0].main;
        const description = weatherData.weather[0].description;
        const humidity = weatherData.main.humidity;
        const windSpeed = weatherData.wind.speed;

        // Choose an emoji based on condition
        let conditionEmoji = '🌤️';
        if (weatherCondition === 'Rain' || weatherCondition === 'Drizzle') conditionEmoji = '🌧️';
        else if (weatherCondition === 'Thunderstorm') conditionEmoji = '⛈️';
        else if (weatherCondition === 'Snow') conditionEmoji = '❄️';
        else if (weatherCondition === 'Clear') conditionEmoji = '☀️';
        else if (weatherCondition === 'Clouds') conditionEmoji = '☁️';
        else if (weatherCondition === 'Mist' || weatherCondition === 'Fog' || weatherCondition === 'Haze') conditionEmoji = '🌫️';

        // Build the base daily weather update (always sent)
        const lines = [
          `🌅 Good Morning, ${subscriber.name}!`,
          `Here's your daily weather update for *${subscriber.city}*:`,
          ``,
          `${conditionEmoji} *${weatherCondition}* — ${description}`,
          `🌡️ Temperature: *${Math.round(temp)}°C* (feels like ${Math.round(feelsLike)}°C)`,
          `💧 Humidity: ${humidity}%`,
          `💨 Wind: ${windSpeed} m/s`,
        ];

        // Append extreme condition alerts as extra lines
        if (temp > 40) {
          lines.push('');
          lines.push('🔥 *Heat Alert:* Stay hydrated and avoid direct sun during peak hours.');
        }

        if (temp <= 10) {
          lines.push('');
          lines.push('❄️ *Cold Alert:* Wear warm layers and limit exposure to cold winds.');
        }

        if (weatherCondition === 'Rain' || weatherCondition === 'Drizzle') {
          lines.push('');
          lines.push('🌧️ *Rain Alert:* Carry an umbrella and drive safely.');
        }

        if (weatherCondition === 'Thunderstorm') {
          lines.push('');
          lines.push('⛈️ *Storm Alert:* Stay indoors if possible and avoid open areas.');
        }

        lines.push('');
        lines.push('_Reply WEATHER to get an update anytime._');

        await sendWhatsAppMessage(subscriber.phone, lines.join('\n'));
      } catch (subErr) {
        // Log and continue — don't let one subscriber's failure stop others
        console.error(`Error processing subscriber ${subscriber.phone}:`, subErr.message || subErr);
      }
    }

    return new Response(JSON.stringify({ success: true, message: 'Alerts sent successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error in /api/send-alert:', error);
    return new Response(JSON.stringify({ success: false, message: 'Server Error' }), { status: 500 });
  }
}
