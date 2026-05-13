import connectToDatabase from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';
import { getWeather } from '@/lib/weather';
import { sendWhatsAppMenu } from '@/lib/twilio';

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

const buildWeatherMessage = (label, weatherData) => {
  const temp = Math.round(weatherData.main.temp);
  const feelsLike = Math.round(weatherData.main.feels_like);
  const condition = `${weatherData.weather[0].main} - ${weatherData.weather[0].description}`;
  const humidity = weatherData.main.humidity;
  const wind = weatherData.wind.speed;

  return [
    `Weather update for ${label}`,
    `Temperature: ${temp}°C (feels like ${feelsLike}°C)`,
    `Condition: ${condition}`,
    `Humidity: ${humidity}% | Wind: ${wind} m/s`,
  ].join('\n');
};

const buildTwiml = (message) => {
  const safeMessage = message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${safeMessage}</Message></Response>`;
};

const buildEmptyTwiml = () => '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

const helpMessage = [
  'Menu:',
  '1) WEATHER - get weather for your saved city',
  '2) WEATHER <city> - get weather for a specific city',
  '3) UPDATE <name> | <city> - update name and city together',
  '4) UPDATE NAME <name> - update only your name',
  '5) UPDATE CITY <city> - update only your city',
  '6) STOP - delete your subscription',
].join('\n');

const parseWebhookBody = async (request) => {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const raw = await request.text();
    const params = new URLSearchParams(raw);
    return {
      from: params.get('From'),
      body: params.get('Body'),
    };
  }

  const form = await request.formData();
  return {
    from: form.get('From'),
    body: form.get('Body'),
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
    const body = (payload.body || '').toString().trim();

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

    if (normalized === 'WEATHER CITY' || normalized === 'WEATHER <CITY>') {
      return new Response(buildTwiml('Send: WEATHER <city>'), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    if (normalized === 'UPDATE NAME') {
      return new Response(buildTwiml('Send: UPDATE NAME <name>'), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    if (normalized === 'UPDATE CITY') {
      return new Response(buildTwiml('Send: UPDATE CITY <city>'), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    if (normalized === 'UPDATE NAME | CITY') {
      return new Response(buildTwiml('Send: UPDATE <name> | <city>'), {
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
        subscriber.name = nextName;
      }
      if (nextCity) {
        subscriber.city = nextCity;
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
