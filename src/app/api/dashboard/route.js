import connectToDatabase from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';
import { getWeather } from '@/lib/weather';

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
    await connectToDatabase();

    const weatherData = await getWeather(hasCoords ? { lat, lon } : { city });
    const resolvedCity = city || weatherData?.name;

    const [totalSubscribers, recentSubscriptions, citySubscribers] = await Promise.all([
      Subscriber.countDocuments({}),
      Subscriber.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name city createdAt'),
      resolvedCity ? Subscriber.countDocuments({ city: resolvedCity }) : Promise.resolve(0),
    ]);

    const isHeatAlert = weatherData?.main?.temp > 40;
    const isRainAlert = weatherData?.weather?.[0]?.main === 'Rain';
    const activeAlerts = isHeatAlert || isRainAlert ? citySubscribers : 0;

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          subscribers: totalSubscribers,
          weather: weatherData,
          alerts: activeAlerts,
          city: resolvedCity,
          recentSubscriptions,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/dashboard:', error);
    return new Response(JSON.stringify({ success: false, message: 'Server Error' }), { status: 500 });
  }
}
