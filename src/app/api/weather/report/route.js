import { getOrGeneratePdfReport, slugifyCity, getReportDateStr } from '@/lib/pdfCache';
import { getFullWeatherData } from '@/lib/weather';
import { getWeatherTip } from '@/lib/alertTemplates';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || 'Rajkot';
    const dateParam = searchParams.get('date');
    const format = searchParams.get('format') || 'pdf';

    const citySlug = slugifyCity(city);
    const dateStr = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : getReportDateStr(new Date());

    // JSON Format: returns structured report data for in-app preview modal & public pages
    if (format === 'json') {
      const weatherBundle = await getFullWeatherData(city);
      const current = weatherBundle?.current || {};
      const forecast = weatherBundle?.forecast || [];
      const hourly = weatherBundle?.hourly || [];
      const airPollution = weatherBundle?.airPollution || null;
      const state = weatherBundle?.state || current.sys?.state || '';

      const temp = Math.round(current.main?.temp || 30);
      const feelsLike = Math.round(current.main?.feels_like || 33);
      const condition = current.weather?.[0]?.main || 'Clear';
      const conditionDesc = current.weather?.[0]?.description || 'clear sky';

      let dayForecast = forecast.find(f => f.date === dateStr) || forecast[0];
      let high = dayForecast?.max;
      let low = dayForecast?.min;
      let pop = dayForecast?.pop;

      if (high === undefined || high === null) high = temp + 4;
      if (low === undefined || low === null) low = Math.max(15, temp - 3);
      if (pop === undefined || pop === null) pop = hourly[0]?.pop || 0;

      const isCurrentlyRaining = ['rain', 'drizzle', 'thunderstorm', 'squall'].includes(condition.toLowerCase()) || (current.rain && (current.rain['1h'] > 0 || current.rain['3h'] > 0));
      if (isCurrentlyRaining) pop = Math.max(pop || 0, 80);

      high = Math.max(temp, Math.round(high));
      low = Math.min(temp, Math.round(low));
      pop = Math.min(100, Math.max(0, Math.round(pop)));

      const summaryTip = getWeatherTip({
        temp,
        condition,
        conditionDesc,
        pop,
        humidity: current.main?.humidity || 63,
        windSpeed: current.wind?.speed || 4.19,
        aqi: airPollution?.aqi || 1,
        visibility: current.visibility ? (current.visibility / 1000).toFixed(1) : '10.0',
      }).replace(/^Tip:\s*/i, '');

      const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');

      return Response.json({
        success: true,
        data: {
          city: current.name || city,
          state,
          citySlug,
          dateStr,
          temp,
          feelsLike,
          high,
          low,
          condition,
          conditionDesc,
          pop,
          humidity: current.main?.humidity || 63,
          windKmh: Math.round((current.wind?.speed || 4.19) * 3.6),
          visibilityKm: current.visibility ? (current.visibility / 1000).toFixed(1) : '10.0',
          aqi: airPollution?.aqi || 1,
          sunrise: current.sys?.sunrise,
          sunset: current.sys?.sunset,
          summary: summaryTip,
          hourly: hourly.slice(0, 6),
          forecast: forecast.slice(0, 5).map(f => ({
            day: f.day || 'Day',
            date: f.date || '',
            min: f.min,
            max: f.max,
            condition: f.condition || 'Clear',
            pop: f.pop !== undefined ? f.pop : 0,
          })),
          pdfUrl: `${baseUrl}/api/weather/report?city=${encodeURIComponent(city)}&date=${dateStr}&format=pdf`,
          publicUrl: `${baseUrl}/reports/${citySlug}/${dateStr}`,
        },
      });
    }

    // PDF Format: returns 1-page A4 PDF file buffer
    const { buffer } = await getOrGeneratePdfReport(city, dateStr);

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Weather-Report-${citySlug}-${dateStr}.pdf"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Error serving weather report PDF:', error);
    return Response.json(
      { success: false, message: 'Could not generate weather report PDF.' },
      { status: 500 }
    );
  }
}
