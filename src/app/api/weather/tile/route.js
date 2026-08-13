import axios from 'axios';

const ALLOWED_LAYERS = {
  rain: 'precipitation_new',
  precipitation: 'precipitation_new',
  precipitation_new: 'precipitation_new',
  clouds: 'clouds_new',
  clouds_new: 'clouds_new',
  temp: 'temp_new',
  temperature: 'temp_new',
  temp_new: 'temp_new',
  wind: 'wind_new',
  wind_new: 'wind_new',
};

// Fallback 1x1 transparent PNG pixel if tile fetch fails
const TRANSPARENT_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSU5EUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const layerQuery = searchParams.get('layer') || 'precipitation_new';
  const z = searchParams.get('z');
  const x = searchParams.get('x');
  const y = searchParams.get('y');

  if (!z || !x || !y) {
    return new Response(JSON.stringify({ error: 'Missing coordinates (z, x, y)' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const layerKey = ALLOWED_LAYERS[layerQuery] || 'precipitation_new';
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return new Response(TRANSPARENT_PNG, {
      status: 500,
      headers: { 'Content-Type': 'image/png' },
    });
  }

  const tileUrl = `https://tile.openweathermap.org/map/${layerKey}/${z}/${x}/${y}.png?appid=${apiKey}`;

  try {
    const tileResponse = await axios.get(tileUrl, {
      responseType: 'arraybuffer',
      timeout: 8000,
    });

    return new Response(tileResponse.data, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  } catch (error) {
    // If precipitation_new failed, attempt fallback to rain_new layer
    if (layerKey === 'precipitation_new') {
      try {
        const fallbackUrl = `https://tile.openweathermap.org/map/rain_new/${z}/${x}/${y}.png?appid=${apiKey}`;
        const fallbackResponse = await axios.get(fallbackUrl, {
          responseType: 'arraybuffer',
          timeout: 8000,
        });

        return new Response(fallbackResponse.data, {
          status: 200,
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=3600, s-maxage=86400',
          },
        });
      } catch (fallbackError) {
        console.error(`Fallback tile fetch error for rain_new z=${z} x=${x} y=${y}:`, fallbackError.message);
      }
    }

    console.error(`Tile fetch error for layer=${layerKey} z=${z} x=${x} y=${y}:`, error.message);
    // Return transparent tile fallback to prevent broken map graphics
    return new Response(TRANSPARENT_PNG, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache',
      },
    });
  }
}
