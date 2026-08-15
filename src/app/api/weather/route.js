import { getWeather, getForecast, getAirPollution } from '@/lib/weather';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const hasCoords = lat !== null && lon !== null;

  if (!city && !hasCoords) {
    return new Response(
      JSON.stringify({ success: false, message: 'City or coordinates are required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const query = hasCoords ? { lat, lon } : { city };

    const current = await getWeather(query);
    const targetLat = current?.coord?.lat || lat;
    const targetLon = current?.coord?.lon || lon;

    const [forecastData, airPollution] = await Promise.all([
      getForecast(query),
      getAirPollution(targetLat, targetLon),
    ]);

    const forecast = Array.isArray(forecastData) ? forecastData : forecastData.forecast || [];
    const hourly = forecastData.hourly || [];

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          current,
          forecast,
          hourly,
          airPollution,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const label = hasCoords ? `${lat}, ${lon}` : city;
    console.error(`Error fetching weather for ${label}:`, error?.message || error);
    const isNetworkError = !error.response || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ERR_NETWORK' || error.message?.includes('Network');
    return new Response(
      JSON.stringify({
        success: false,
        offline: isNetworkError,
        message: isNetworkError
          ? 'No internet connection or weather service unavailable.'
          : 'Error fetching weather data',
      }),
      { status: isNetworkError ? 503 : 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
