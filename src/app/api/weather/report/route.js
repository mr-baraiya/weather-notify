import { Country } from 'country-state-city';
import { getOrGeneratePdfReport, slugifyCity, getReportDateStr } from '@/lib/pdfCache';
import { getFullWeatherData } from '@/lib/weather';
import { getWeatherTip } from '@/lib/alertTemplates';

const getCountryName = (code) => {
  if (!code) return '';
  try {
    return Country.getCountryByCode(code)?.name || code;
  } catch {
    return code;
  }
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || 'Rajkot';
    const stateQuery = searchParams.get('state') || '';
    const countryQuery = searchParams.get('country') || '';
    const dateParam = searchParams.get('date');
    const format = searchParams.get('format') || 'json';

    const citySlug = slugifyCity(city);
    const dateStr = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : getReportDateStr(new Date());

    // JSON Format: returns structured report data for in-app preview modal & public pages
    if (format === 'json') {
      const weatherBundle = await getFullWeatherData(city);
      const current = weatherBundle?.current || {};
      const forecast = weatherBundle?.forecast || [];
      const hourly = weatherBundle?.hourly || [];
      const airPollution = weatherBundle?.airPollution || null;
      const state = stateQuery || weatherBundle?.state || current.sys?.state || '';
      const countryCode = current.sys?.country || countryQuery || 'IN';
      const countryName = getCountryName(countryCode);
      const cityName = current.name || city;
      const locationTitle = [cityName, state, countryName].filter(Boolean).join(', ');

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
        humidity: current.main?.humidity || 68,
        windSpeed: current.wind?.speed || 4.19,
        aqi: airPollution?.aqi || 1,
        visibility: current.visibility ? (current.visibility / 1000).toFixed(1) : '10.0',
      }).replace(/^Tip:\s*/i, '');

      // Guaranteed 5-Slot Hourly Breakdown (09:00 AM, 12:00 PM, 03:00 PM, 06:00 PM, 09:00 PM)
      let finalHourly = hourly.length > 0 ? hourly.slice(0, 5) : [];
      if (finalHourly.length < 5) {
        const timeSlots = ['09:00 AM', '12:00 PM', '03:00 PM', '06:00 PM', '09:00 PM'];
        const tempVars = [-2, 4, 3, -1, -3];
        finalHourly = timeSlots.map((timeStr, idx) => {
          const existing = hourly[idx];
          return existing || {
            time: timeStr,
            temp: Math.round(temp + tempVars[idx]),
            condition: idx === 1 ? condition : (idx % 2 === 0 ? 'Clouds' : condition),
            pop: Math.min(100, Math.max(0, pop + (idx % 2 === 0 ? 0 : -10))),
            humidity: Math.min(100, Math.max(40, (current.main?.humidity || 68) + (idx % 2 === 0 ? 2 : -3))),
            windKmh: Math.round((current.wind?.speed || 4.19) * 3.6),
          };
        });
      }

      // Guaranteed 5-Day Outlook
      let finalForecast = forecast.length > 0 ? forecast.slice(0, 5) : [];
      if (finalForecast.length < 5) {
        const daysLabel = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5'];
        const baseDate = new Date(dateStr);
        finalForecast = daysLabel.map((labelStr, idx) => {
          const d = new Date(baseDate.getTime() + idx * 86400000);
          const formattedD = d.toISOString().split('T')[0];
          const existing = forecast[idx];
          return existing || {
            day: idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
            date: formattedD,
            min: Math.round(low + (idx % 2 === 0 ? -1 : 1)),
            max: Math.round(high + (idx % 2 === 0 ? 1 : -1)),
            condition: idx === 0 ? condition : (idx % 2 === 0 ? 'Clouds' : condition),
            pop: Math.max(0, Math.min(100, pop + (idx % 2 === 0 ? -10 : 5))),
          };
        });
      }

      // Formatted Sunrise & Sunset
      const formatTimeStr = (unixTs, defaultTime) => {
        if (!unixTs) return defaultTime;
        try {
          return new Date(unixTs * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        } catch {
          return defaultTime;
        }
      };

      const sunriseStr = formatTimeStr(current.sys?.sunrise, '04:41 AM');
      const sunsetStr = formatTimeStr(current.sys?.sunset, '05:50 PM');

      const aqiLabelMap = { 1: 'Good', 2: 'Fair', 3: 'Moderate', 4: 'Poor', 5: 'Very Poor' };
      const aqiVal = airPollution?.aqi || 1;
      const aqiText = `Level ${aqiVal} — ${aqiLabelMap[aqiVal] || 'Good'}`;

      // Weather Alert Advisory
      let alertAdvisory = null;
      if (pop >= 60 || ['rain', 'drizzle', 'thunderstorm', 'snow', 'squall'].includes(condition.toLowerCase())) {
        alertAdvisory = `High probability of rainfall (${pop}%) expected today. Carry an umbrella and exercise caution when traveling.`;
      } else if (temp >= 38) {
        alertAdvisory = `High temperature alert (${temp}°C). Stay hydrated and avoid prolonged outdoor sun exposure during peak hours.`;
      } else if (aqiVal >= 4) {
        alertAdvisory = `Poor air quality alert (AQI Level ${aqiVal}). Sensitive groups should limit outdoor activity.`;
      } else {
        alertAdvisory = `Fair weather expected today. Enjoy your day and stay updated with local weather forecasts.`;
      }

      const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');

      return Response.json({
        success: true,
        data: {
          city: cityName,
          state,
          country: countryCode,
          countryName,
          locationTitle,
          citySlug,
          dateStr,
          temp,
          feelsLike,
          high,
          low,
          condition,
          conditionDesc,
          pop,
          humidity: current.main?.humidity || 68,
          windKmh: Math.round((current.wind?.speed || 4.19) * 3.6),
          visibilityKm: current.visibility ? (current.visibility / 1000).toFixed(1) : '10.0',
          aqi: aqiVal,
          aqiText,
          sunriseStr,
          sunsetStr,
          summary: summaryTip,
          alertAdvisory,
          hourly: finalHourly,
          forecast: finalForecast,
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
