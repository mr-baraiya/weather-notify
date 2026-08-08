import { getWeather, getForecast } from '@/lib/weather';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const hasCoords = lat !== null && lon !== null;

  if (!city && !hasCoords) {
    return new Response(JSON.stringify({ success: false, message: 'City or coordinates are required' }), { status: 400 });
  }

  try {
    const query = hasCoords ? { lat, lon } : { city };
    
    // Fetch both concurrently
    const [current, forecast] = await Promise.all([
      getWeather(query),
      getForecast(query)
    ]);

    return new Response(JSON.stringify({ success: true, data: { current, forecast } }), { status: 200 });
  } catch (error) {
    const label = hasCoords ? `${lat}, ${lon}` : city;
    console.error(`Error fetching weather for ${label}:`, error);
    return new Response(JSON.stringify({ success: false, message: 'Error fetching weather data' }), { status: 500 });
  }
}
