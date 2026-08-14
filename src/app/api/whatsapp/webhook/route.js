import connectToDatabase from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';
import { getFullWeatherData } from '@/lib/weather';
import { sendWhatsAppMenu } from '@/lib/twilio';
import { toTitleCase } from '@/lib/format';
import { buildOnDemandWeatherAlert, formatTime } from '@/lib/alertTemplates';
import { trackAndCheckTwilioLimit } from '@/lib/twilioLimit';

const toE164 = (value) => {
  if (!value) {
    return '';
  }
  const normalized = value.replace(/^whatsapp:/i, '').trim();
  if (normalized.startsWith('+')) {
    return normalized;
  }
  return `+${normalized}`;
};

const buildWeatherMessage = (cityName, weatherBundle) => {
  const current = weatherBundle?.current || {};
  const forecast = weatherBundle?.forecast || [];
  const hourly = weatherBundle?.hourly || [];
  const airPollution = weatherBundle?.airPollution || null;

  const main = current.main || {};
  const sys = current.sys || {};
  const weatherArr = current.weather || [{}];
  const tzOffset = current.timezone !== undefined ? current.timezone : 19800;

  const temp = main.temp !== undefined ? main.temp : 30;
  const feelsLike = main.feels_like !== undefined ? main.feels_like : 33;
  const condition = weatherArr[0]?.main || 'Clear';

  // Real today high & low from 5-day forecast
  let high = forecast[0]?.max;
  let low = forecast[0]?.min;
  let pop = forecast[0]?.pop;

  if (high === undefined || high === null) {
    high = Math.round(temp + 4);
  }
  if (low === undefined || low === null) {
    low = Math.max(15, Math.round(temp - 3));
  }
  if (pop === undefined || pop === null) {
    pop = hourly[0]?.pop || 0;
  }

  const humidity = main.humidity !== undefined ? main.humidity : 63;
  const windSpeed = current.wind?.speed !== undefined ? current.wind.speed : 4.19;

  // Accurate sunrise and sunset using city timezone offset
  const sunrise = formatTime(sys.sunrise, tzOffset);
  const sunset = formatTime(sys.sunset, tzOffset);
  const conditionDesc = weatherArr[0]?.description || 'clear sky';
  const visibilityKm = current.visibility ? (current.visibility / 1000).toFixed(1) : 10.0;

  const state = weatherBundle?.state || current.sys?.state || '';

  // Manual command response without "Good Morning!" or "Have a great day!"
  return buildOnDemandWeatherAlert({
    city: current.name || cityName,
    state,
    temp,
    feelsLike,
    condition,
    conditionDesc,
    high,
    low,
    pop,
    humidity,
    windSpeed,
    sunrise,
    sunset,
    aqi: airPollution?.aqi ?? null,
    aqiStatus: airPollution?.status ?? null,
    pm25: airPollution?.pm25 ?? undefined,
    pm10: airPollution?.pm10 ?? undefined,
    visibility: visibilityKm,
  });
};


const buildTwiml = (message) => {
  const safeMessage = message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${safeMessage}</Message></Response>`;
};

const buildEmptyTwiml = () => '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

const isSameDay = (d1, d2) => {
  if (!d1 || !d2) return false;
  try {
    return new Date(d1).toISOString().slice(0, 10) === new Date(d2).toISOString().slice(0, 10);
  } catch {
    return false;
  }
};

const replyWithQuotaNotice = (message, isQuotaReached) => {
  const quotaText = 'Your daily quota reached. Try next day now.';
  const finalMessage = isQuotaReached ? `${message}\n\n${quotaText}` : message;
  return new Response(buildTwiml(finalMessage), {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
};

const helpMessage = [
  'Get instant weather updates, rain alerts, and temperature information directly on WhatsApp.',
  'Use the commands below exactly as shown to interact with the bot.',
  '',
  'WEATHER - weather for your saved city',
  'WEATHER <city> - weather for a specific city',
  'UPDATE <name> | <city> - update name and city together',
  'UPDATE NAME <name> - update only your name',
  'UPDATE CITY <city> - update only your city',
  'STOP - delete your subscription',
].join('\n');

const parseWebhookBody = async (request) => {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const raw = await request.text();
    const params = new URLSearchParams(raw);
    return {
      from: params.get('From'),
      body: params.get('Body'),
      listId: params.get('ListId'),
      listTitle: params.get('ListTitle'),
      buttonPayload: params.get('ButtonPayload'),
    };
  }

  const form = await request.formData();
  return {
    from: form.get('From'),
    body: form.get('Body'),
    listId: form.get('ListId'),
    listTitle: form.get('ListTitle'),
    buttonPayload: form.get('ButtonPayload'),
  };
};

export async function GET() {
  return new Response(buildTwiml(helpMessage), {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}

export async function POST(request) {
  try {
    const payload = await parseWebhookBody(request);
    const from = toE164(payload.from);
    const listValue = payload.listId || payload.listTitle || payload.buttonPayload || '';
    const body = (payload.body || listValue || '').toString().trim();

    if (!from) {
      return new Response(buildTwiml('Missing sender number.'), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    await connectToDatabase();

    const subscriber = await Subscriber.findOne({ phone: from });
    if (!subscriber) {
      return new Response(buildTwiml('Number not subscribed. Please subscribe first on the website.\n\n' + helpMessage), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    if (subscriber.isActive === false) {
      const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
      const contactUrl = `${baseUrl}/contact`;
      const deactivationMessage = `Your subscription is currently deactivated. You cannot use Weather Notify WhatsApp services.\n\nPlease contact the administrator to reactivate your account:\n${contactUrl}`;
      return new Response(buildTwiml(deactivationMessage), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // System-wide Twilio 50 daily message limit check
    const systemLimitStatus = await trackAndCheckTwilioLimit();
    if (systemLimitStatus.limitReached) {
      console.warn(`Twilio system-wide daily message limit reached (50/50). Suppressing reply for ${from}.`);
      return new Response(buildEmptyTwiml(), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Daily Quota Rate-Limiting Logic
    const now = new Date();
    if (!isSameDay(subscriber.lastCommandDate, now)) {
      subscriber.dailyCommandCount = 0;
    }

    if (subscriber.dailyCommandCount >= 10) {
      return new Response(buildEmptyTwiml(), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    subscriber.dailyCommandCount = (subscriber.dailyCommandCount || 0) + 1;
    subscriber.lastCommandDate = now;
    await subscriber.save();

    const isQuotaReached = subscriber.dailyCommandCount === 10;

    if (!body) {
      if (isQuotaReached) {
        return replyWithQuotaNotice(helpMessage, true);
      }
      try {
        await sendWhatsAppMenu(from);
        return new Response(buildEmptyTwiml(), {
          status: 200,
          headers: { 'Content-Type': 'text/xml' },
        });
      } catch (error) {
        return replyWithQuotaNotice(helpMessage, false);
      }
    }

    const upper = body.toUpperCase();
    const normalized = body.replace(/\s+/g, ' ').trim().toUpperCase();

    if (['WEATHER CITY', 'WEATHER <CITY>', 'WEATHER_CITY'].includes(normalized)) {
      return replyWithQuotaNotice('To get weather for another city, send:\nWEATHER <city>\nExample: WEATHER Rajkot', isQuotaReached);
    }

    if (['UPDATE NAME', 'UPDATE_NAME'].includes(normalized)) {
      return replyWithQuotaNotice('To update your name, send:\nUPDATE NAME <name>\nExample: UPDATE NAME Vishal', isQuotaReached);
    }

    if (['UPDATE CITY', 'UPDATE_CITY'].includes(normalized)) {
      return replyWithQuotaNotice('To update your city, send:\nUPDATE CITY <city>\nExample: UPDATE CITY Botad', isQuotaReached);
    }

    if (['UPDATE NAME | CITY', 'UPDATE_BOTH'].includes(normalized)) {
      return replyWithQuotaNotice('To update both, send:\nUPDATE <name> | <city>\nExample: UPDATE Vishal Baraiya | Rajkot', isQuotaReached);
    }

    if (upper === 'WEATHER' || upper.startsWith('WEATHER ')) {
      const city = body.replace(/^WEATHER\s*/i, '').trim();
      const targetCity = city || subscriber.city;

      if (!targetCity) {
        return replyWithQuotaNotice('City not found. Please update your city first.', isQuotaReached);
      }

      const weatherBundle = await getFullWeatherData(targetCity);
      const message = buildWeatherMessage(targetCity, weatherBundle);

      return replyWithQuotaNotice(message, isQuotaReached);
    }

    if (upper === 'STOP') {
      await Subscriber.deleteOne({ phone: from });

      return replyWithQuotaNotice('Your subscription has been deleted. If this was a mistake, please subscribe again on the website.', isQuotaReached);
    }

    if (upper.startsWith('UPDATE ')) {
      const rest = body.replace(/^UPDATE\s*/i, '').trim();
      let nextName = '';
      let nextCity = '';

      if (rest.includes('|')) {
        const [namePart, cityPart] = rest.split('|');
        nextName = (namePart || '').trim();
        nextCity = (cityPart || '').trim();
      } else if (rest.toUpperCase().startsWith('NAME ')) {
        nextName = rest.replace(/^NAME\s*/i, '').trim();
      } else if (rest.toUpperCase().startsWith('CITY ')) {
        nextCity = rest.replace(/^CITY\s*/i, '').trim();
      }

      if (!nextName && !nextCity) {
        return replyWithQuotaNotice('Invalid update format.\n' + helpMessage, isQuotaReached);
      }

      if (nextName) {
        subscriber.name = toTitleCase(nextName);
      }
      if (nextCity) {
        subscriber.city = toTitleCase(nextCity);
      }

      await subscriber.save();

      const updatedMessage = [
        'Profile updated.',
        `Name: ${subscriber.name}`,
        `City: ${subscriber.city}`,
      ].join('\n');

      return replyWithQuotaNotice(updatedMessage, isQuotaReached);
    }

    if (isQuotaReached) {
      return replyWithQuotaNotice('Unknown command.\n' + helpMessage, true);
    }

    try {
      await sendWhatsAppMenu(from);
      return new Response(buildEmptyTwiml(), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    } catch (error) {
      return replyWithQuotaNotice('Unknown command.\n' + helpMessage, false);
    }
  } catch (error) {
    console.error('Error in /api/whatsapp/webhook:', error);
    return new Response(buildTwiml('Server error. Please try again later.'), {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
