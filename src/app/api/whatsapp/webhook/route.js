import connectToDatabase from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';
import { getWeather } from '@/lib/weather';
import { sendWhatsAppMenu } from '@/lib/twilio';
import { toTitleCase } from '@/lib/format';
import { buildDailyMorningAlert, formatTime } from '@/lib/alertTemplates';

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

const buildWeatherMessage = (cityName, weatherData) => {
  const current = weatherData.current || weatherData;
  const main = current.main || {};
  const sys = current.sys || {};
  const weatherArr = current.weather || [{}];
  const hourly = weatherData.hourly || [];

  const temp = main.temp !== undefined ? main.temp : 30;
  const feelsLike = main.feels_like !== undefined ? main.feels_like : 34;
  const condition = weatherArr[0]?.main || 'Clear';
  const high = main.temp_max !== undefined ? main.temp_max : temp + 3;
  const low = main.temp_min !== undefined ? main.temp_min : temp - 4;
  const pop = hourly[0]?.pop !== undefined ? hourly[0].pop : 0;
  const humidity = main.humidity !== undefined ? main.humidity : 69;
  const windSpeed = current.wind?.speed !== undefined ? current.wind.speed : 7.2;

  const sunrise = formatTime(sys.sunrise);
  const sunset = formatTime(sys.sunset);

  return buildDailyMorningAlert({
    city: cityName,
    state: 'Gujarat',
    temp,
    feelsLike,
    condition,
    high,
    low,
    pop,
    humidity,
    windSpeed,
    sunrise,
    sunset,
  });
};

const buildTwiml = (message) => {
  const safeMessage = message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${safeMessage}</Message></Response>`;
};

const buildEmptyTwiml = () => '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

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

    if (!body) {
      try {
        await sendWhatsAppMenu(from);
        return new Response(buildEmptyTwiml(), {
          status: 200,
          headers: { 'Content-Type': 'text/xml' },
        });
      } catch (error) {
        return new Response(buildTwiml(helpMessage), {
          status: 200,
          headers: { 'Content-Type': 'text/xml' },
        });
      }
    }

    await connectToDatabase();

    const subscriber = await Subscriber.findOne({ phone: from });
    if (!subscriber) {
      return new Response(buildTwiml('Number not subscribed. Please subscribe first on the website.\n\n' + helpMessage), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    const upper = body.toUpperCase();
    const normalized = body.replace(/\s+/g, ' ').trim().toUpperCase();

    if (['WEATHER CITY', 'WEATHER <CITY>', 'WEATHER_CITY'].includes(normalized)) {
      return new Response(buildTwiml('To get weather for another city, send:\nWEATHER <city>\nExample: WEATHER Rajkot'), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    if (['UPDATE NAME', 'UPDATE_NAME'].includes(normalized)) {
      return new Response(buildTwiml('To update your name, send:\nUPDATE NAME <name>\nExample: UPDATE NAME Vishal'), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    if (['UPDATE CITY', 'UPDATE_CITY'].includes(normalized)) {
      return new Response(buildTwiml('To update your city, send:\nUPDATE CITY <city>\nExample: UPDATE CITY Botad'), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    if (['UPDATE NAME | CITY', 'UPDATE_BOTH'].includes(normalized)) {
      return new Response(buildTwiml('To update both, send:\nUPDATE <name> | <city>\nExample: UPDATE Vishal Baraiya | Rajkot'), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    if (upper === 'WEATHER' || upper.startsWith('WEATHER ')) {
      const city = body.replace(/^WEATHER\s*/i, '').trim();
      const targetCity = city || subscriber.city;

      if (!targetCity) {
        return new Response(buildTwiml('City not found. Please update your city first.'), {
          status: 200,
          headers: { 'Content-Type': 'text/xml' },
        });
      }

      const weatherData = await getWeather(targetCity);
      const message = buildWeatherMessage(targetCity, weatherData);

      return new Response(buildTwiml(message), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    if (upper === 'STOP') {
      await Subscriber.deleteOne({ phone: from });

      return new Response(buildTwiml('Your subscription has been deleted. If this was a mistake, please subscribe again on the website.'), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
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
        return new Response(buildTwiml('Invalid update format.\n' + helpMessage), {
          status: 200,
          headers: { 'Content-Type': 'text/xml' },
        });
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

      return new Response(buildTwiml(updatedMessage), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    try {
      await sendWhatsAppMenu(from);
      return new Response(buildEmptyTwiml(), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    } catch (error) {
      return new Response(buildTwiml('Unknown command.\n' + helpMessage), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }
  } catch (error) {
    console.error('Error in /api/whatsapp/webhook:', error);
    return new Response(buildTwiml('Server error. Please try again later.'), {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
