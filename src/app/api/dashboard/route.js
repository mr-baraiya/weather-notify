import connectToDatabase from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';
import { getWeather } from '@/lib/weather';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const hasCoords = lat !== null && lon !== null;

  const targetCity = city || 'Rajkot';

  try {
    await connectToDatabase();

    let weatherData = null;
    try {
      weatherData = await getWeather(hasCoords ? { lat, lon } : { city: targetCity });
    } catch (weatherErr) {
      console.warn('Weather fetch warning in /api/dashboard:', weatherErr.message);
    }

    const resolvedCity = city || weatherData?.name || targetCity;

    let totalSubscribers = 0;
    let recentSubscriptions = [];
    let citySubscribers = 0;

    try {
      const [total, recents, cityCount] = await Promise.all([
        Subscriber.countDocuments({}),
        Subscriber.find({})
          .sort({ createdAt: -1 })
          .limit(5)
          .select('name city createdAt')
          .lean(),
        resolvedCity
          ? Subscriber.countDocuments({ city: { $regex: new RegExp(`^${resolvedCity}$`, 'i') } })
          : Promise.resolve(0),
      ]);
      totalSubscribers = total;
      recentSubscriptions = recents;
      citySubscribers = cityCount;
    } catch (dbErr) {
      console.error('Database query error in /api/dashboard:', dbErr.message);
    }

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
    return new Response(JSON.stringify({ success: false, message: error.message || 'Server Error' }), { status: 500 });
  }
}
