/* ─── Weather Notify — WhatsApp Message Templates & Notification Rules ────── */

/**
 * Format Time with City Timezone (e.g. 6:12 AM)
 * OpenWeather timezone is in seconds (e.g. 19800 for India IST +5:30)
 */
export const formatTime = (timestamp, timezoneOffsetSeconds = 19800) => {
  if (!timestamp) return '--:--';
  const tzOffset = (timezoneOffsetSeconds !== undefined && timezoneOffsetSeconds !== null) ? timezoneOffsetSeconds : 19800;
  const date = new Date((timestamp + tzOffset) * 1000);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

/**
 * Wind Direction Degrees to Cardinal (NW, SE, etc.)
 */
export const getWindDirection = (deg) => {
  if (deg === undefined || deg === null) return 'N/A';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(deg / 45) % 8];
};

/**
 * AQI Rating Text Calculator
 */
export const getAQIStatus = (aqi) => {
  switch (Number(aqi)) {
    case 1: return '1 — Good';
    case 2: return '2 — Fair';
    case 3: return '3 — Moderate';
    case 4: return '4 — Poor';
    case 5: return '5 — Very Poor';
    default: return `${aqi} — Moderate`;
  }
};

/**
 * UV Rating Text Calculator
 */
export const getUVStatus = (uv) => {
  if (uv <= 2) return `${uv} — Low`;
  if (uv <= 5) return `${uv} — Moderate`;
  if (uv <= 7) return `${uv} — High`;
  if (uv <= 10) return `${uv} — Very High`;
  return `${uv} — Extreme`;
};

/* ─── 11 EXACT WHATSAPP MESSAGE TEMPLATE BUILDERS ───────────────────────── */

// 1. Daily Morning Weather Alert
export function buildDailyMorningAlert(data) {
  const { city, state = 'Gujarat', temp, feelsLike, condition, high, low, pop, humidity, windSpeed, sunrise, sunset } = data;
  return `Good Morning!

Weather Update for ${city}, ${state}

Temperature: ${Math.round(temp)}°C
Feels Like: ${Math.round(feelsLike)}°C
Condition: ${condition}

Today's Forecast
High: ${Math.round(high)}°C
Low: ${Math.round(low)}°C
Rain Probability: ${Math.round(pop)}%
Humidity: ${humidity}%
Wind: ${windSpeed} m/s

Sunrise: ${sunrise}
Sunset: ${sunset}

Have a great day!
— Weather Notify`;
}

// 2. Rain Alert
export function buildRainAlert(data) {
  const { city, state = 'Gujarat', pop, expectedTime = '1:00 PM – 3:00 PM', temp } = data;
  return `RAIN ALERT

Weather Update for ${city}, ${state}

Rain is likely in your area.

Rain Probability: ${Math.round(pop)}%
Expected Time: ${expectedTime}
Temperature: ${Math.round(temp)}°C

Please carry an umbrella and plan accordingly.

— Weather Notify`;
}

// 3. Heat Alert
export function buildHeatAlert(data) {
  const { city, state = 'Gujarat', temp, feelsLike, humidity } = data;
  return `HEAT ALERT

Weather Update for ${city}, ${state}

High temperatures are expected today.

Temperature: ${Math.round(temp)}°C
Feels Like: ${Math.round(feelsLike)}°C
Humidity: ${humidity}%

Please stay hydrated and avoid prolonged outdoor activity during peak afternoon hours.

— Weather Notify`;
}

// 4. Air Quality Alert
export function buildAQIAlert(data) {
  const { city, state = 'Gujarat', aqi, status, pm25, pm10 } = data;
  return `AIR QUALITY ALERT

Air Quality Update for ${city}, ${state}

Air quality has deteriorated.

AQI: ${aqi} — ${status}
PM2.5: ${pm25} µg/m³
PM10: ${pm10} µg/m³

Consider reducing prolonged outdoor activity and take appropriate precautions.

— Weather Notify`;
}

// 5. Severe Weather Alert
export function buildSevereWeatherAlert(data) {
  const { city, state = 'Gujarat', rainfall = 35, windSpeed = 42, expectedTime = '2:00 PM – 5:00 PM' } = data;
  return `SEVERE WEATHER ALERT

Weather Update for ${city}, ${state}

Heavy rainfall is expected in your area.

Expected Rainfall: ${rainfall} mm
Wind Speed: ${Math.round(windSpeed)} km/h
Expected Time: ${expectedTime}

Please take appropriate precautions and avoid unnecessary travel if conditions become severe.

— Weather Notify`;
}

// 6. Thunderstorm Alert
export function buildThunderstormAlert(data) {
  const { city, state = 'Gujarat', expectedTime = '3:00 PM – 5:00 PM', temp, pop, windSpeed = 35 } = data;
  return `THUNDERSTORM ALERT

Weather Update for ${city}, ${state}

Thunderstorms are expected in your area.

Expected Time: ${expectedTime}
Temperature: ${Math.round(temp)}°C
Rain Probability: ${Math.round(pop)}%
Wind Speed: ${Math.round(windSpeed)} km/h

Avoid open areas and take appropriate precautions.

— Weather Notify`;
}

// 7. Strong Wind Alert
export function buildStrongWindAlert(data) {
  const { city, state = 'Gujarat', windSpeed, windDir = 'NW', expectedTime = '4:00 PM – 7:00 PM' } = data;
  return `STRONG WIND ALERT

Weather Update for ${city}, ${state}

Strong winds are expected in your area.

Wind Speed: ${Math.round(windSpeed)} km/h
Wind Direction: ${windDir}
Expected Time: ${expectedTime}

Secure loose outdoor objects and take appropriate precautions.

— Weather Notify`;
}

// 8. Cold Weather Alert
export function buildColdWeatherAlert(data) {
  const { city, state = 'Gujarat', temp, feelsLike, minTemp } = data;
  return `COLD WEATHER ALERT

Weather Update for ${city}, ${state}

Low temperatures are expected today.

Temperature: ${Math.round(temp)}°C
Feels Like: ${Math.round(feelsLike)}°C
Minimum Temperature: ${Math.round(minTemp)}°C

Keep warm and take appropriate precautions, especially during the early morning and night.

— Weather Notify`;
}

// 9. High UV Alert
export function buildUVAlert(data) {
  const { city, state = 'Gujarat', uvIndex, status = 'Very High', peakTime = '11:00 AM – 3:00 PM' } = data;
  return `HIGH UV ALERT

Sun and UV Update for ${city}, ${state}

UV levels are high today.

UV Index: ${uvIndex} — ${status}
Peak UV Time: ${peakTime}

Use sun protection and avoid prolonged exposure during peak hours.

— Weather Notify`;
}

// 10. Visibility Alert
export function buildVisibilityAlert(data) {
  const { city, state = 'Gujarat', visibility, condition = 'Foggy' } = data;
  return `LOW VISIBILITY ALERT

Weather Update for ${city}, ${state}

Visibility is currently low.

Visibility: ${visibility} km
Current Condition: ${condition}

Drive carefully, maintain a safe distance, and use appropriate vehicle lights.

— Weather Notify`;
}

// 11. Daily Evening Summary
export function buildDailyEveningAlert(data) {
  const {
    city,
    state = 'Gujarat',
    high,
    low,
    rainfall = 12,
    maxPop,
    humidity,
    windSpeed,
    sunrise,
    sunset,
    tomorrowHigh,
    tomorrowLow,
    tomorrowPop,
    tomorrowCondition = 'Partly Cloudy',
  } = data;

  return `Good Evening!

Weather Summary for ${city}, ${state}

Today's High: ${Math.round(high)}°C
Today's Low: ${Math.round(low)}°C
Rainfall: ${rainfall} mm
Maximum Rain Probability: ${Math.round(maxPop)}%
Humidity: ${humidity}%
Wind: ${windSpeed} m/s

Sunrise: ${sunrise}
Sunset: ${sunset}

Tomorrow's Forecast
High: ${Math.round(tomorrowHigh)}°C
Low: ${Math.round(tomorrowLow)}°C
Rain Probability: ${Math.round(tomorrowPop)}%
Condition: ${tomorrowCondition}

— Weather Notify`;
}

/* ─── ANTI-SPAM COOLDOWN CHECKER ───────────────────────────────────────── */
export function canSendAlert(lastSentDate, cooldownHours = 12) {
  if (!lastSentDate) return true;
  const now = new Date();
  const diffMs = now - new Date(lastSentDate);
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours >= cooldownHours;
}

/* ─── AUTOMATED ALERT EVALUATOR ────────────────────────────────────────── */
export function evaluateWeatherAlerts(subscriber, weatherData, alertTypeOverride = null) {
  if (!weatherData || (!weatherData.current && !weatherData.main)) return [];

  const alertsToSend = [];
  const current = weatherData.current || weatherData;
  const main = current.main || {};
  const sys = current.sys || {};
  const weatherArr = current.weather || [{}];
  const forecast = weatherData.forecast || [];
  const hourly = weatherData.hourly || [];
  const airPollution = weatherData.airPollution || { aqi: 2, status: 'Fair', pm25: 7, pm10: 26 };
  const tzOffset = current.timezone !== undefined ? current.timezone : 19800; // India IST default 19800 (+5:30)

  const city = current.name || subscriber.city || 'Rajkot';
  const temp = main.temp !== undefined ? main.temp : 30;
  const feelsLike = main.feels_like !== undefined ? main.feels_like : 33;
  const humidity = main.humidity !== undefined ? main.humidity : 63;
  const windMps = current.wind?.speed !== undefined ? current.wind.speed : 4.19;
  const windKmh = Math.round(windMps * 3.6);
  const windDir = getWindDirection(current.wind?.deg);
  const conditionMain = weatherArr[0]?.main || 'Clear';
  const conditionDesc = weatherArr[0]?.description || 'clear sky';
  const visibilityKm = current.visibility ? (current.visibility / 1000).toFixed(1) : 10.0;

  // Accurate sunrise and sunset using city timezone offset
  const sunrise = formatTime(sys.sunrise, tzOffset);
  const sunset = formatTime(sys.sunset, tzOffset);

  // Extract real today high/low and rain probability from 5-day forecast
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

  const uvIndex = Math.min(11, Math.max(1, Math.round(temp / 4.5)));
  const uvStatus = getUVStatus(uvIndex);

  // Payload context passed to builders
  const ctx = {
    city,
    state: 'Gujarat',
    temp,
    feelsLike,
    condition: conditionMain,
    high,
    low,
    minTemp: low,
    pop,
    humidity,
    windSpeed: windMps,
    windKmh,
    windDir,
    sunrise,
    sunset,
    aqi: airPollution.aqi,
    status: airPollution.status,
    pm25: airPollution.pm25,
    pm10: airPollution.pm10,
    visibility: visibilityKm,
    uvIndex,
    uvStatus,
    maxPop: pop,
    tomorrowHigh: forecast[1]?.max || high - 1,
    tomorrowLow: forecast[1]?.min || low - 1,
    tomorrowPop: forecast[1]?.pop || Math.max(0, pop - 20),
    tomorrowCondition: forecast[1]?.condition || 'Partly Cloudy',
  };

  // If specific alert type override requested (e.g. from manual test trigger)
  if (alertTypeOverride) {
    switch (alertTypeOverride.toLowerCase()) {
      case 'daily_morning':
      case 'daily':
        return [{ type: 'lastDailyWeatherSent', text: buildDailyMorningAlert(ctx) }];
      case 'rain':
        return [{ type: 'lastRainAlertSent', text: buildRainAlert(ctx) }];
      case 'heat':
        return [{ type: 'lastHeatAlertSent', text: buildHeatAlert(ctx) }];
      case 'aqi':
      case 'air_quality':
        return [{ type: 'lastAQIAlertSent', text: buildAQIAlert(ctx) }];
      case 'severe':
        return [{ type: 'lastSevereWeatherAlertSent', text: buildSevereWeatherAlert(ctx) }];
      case 'thunderstorm':
        return [{ type: 'lastThunderstormAlertSent', text: buildThunderstormAlert(ctx) }];
      case 'strong_wind':
      case 'wind':
        return [{ type: 'lastStrongWindAlertSent', text: buildStrongWindAlert(ctx) }];
      case 'cold':
        return [{ type: 'lastColdWeatherAlertSent', text: buildColdWeatherAlert(ctx) }];
      case 'uv':
        return [{ type: 'lastUVAlertSent', text: buildUVAlert(ctx) }];
      case 'visibility':
        return [{ type: 'lastVisibilityAlertSent', text: buildVisibilityAlert(ctx) }];
      case 'daily_evening':
      case 'evening':
        return [{ type: 'lastDailyEveningSent', text: buildDailyEveningAlert(ctx) }];
      default:
        break;
    }
  }

  // ─── AUTOMATED RULES WITH ANTI-SPAM COOLDOWN CHECKS ─────────────────

  const currentHour = new Date().getHours();

  // Rule 1: Daily Morning Weather Alert (Send once in morning 6 AM - 11 AM if cooldown passed)
  if (currentHour >= 6 && currentHour < 12) {
    if (canSendAlert(subscriber.lastDailyWeatherSent, 20)) {
      alertsToSend.push({ type: 'lastDailyWeatherSent', text: buildDailyMorningAlert(ctx) });
    }
  }

  // Rule 2: Daily Evening Summary (Send once in evening 6 PM - 10 PM if cooldown passed)
  if (currentHour >= 18 && currentHour <= 22) {
    if (canSendAlert(subscriber.lastDailyEveningSent, 20)) {
      alertsToSend.push({ type: 'lastDailyEveningSent', text: buildDailyEveningAlert(ctx) });
    }
  }

  // Rule 3: Rain Alert (Rain prob >= 60%)
  if (pop >= 60 || conditionMain.toLowerCase().includes('rain')) {
    if (canSendAlert(subscriber.lastRainAlertSent, 6)) {
      alertsToSend.push({ type: 'lastRainAlertSent', text: buildRainAlert(ctx) });
    }
  }

  // Rule 4: Heat Alert (Temp >= 38°C or FeelsLike >= 42°C)
  if (temp >= 38 || feelsLike >= 42) {
    if (canSendAlert(subscriber.lastHeatAlertSent, 12)) {
      alertsToSend.push({ type: 'lastHeatAlertSent', text: buildHeatAlert(ctx) });
    }
  }

  // Rule 5: AQI Alert (AQI >= 4)
  if (airPollution.aqi >= 4) {
    if (canSendAlert(subscriber.lastAQIAlertSent, 12)) {
      alertsToSend.push({ type: 'lastAQIAlertSent', text: buildAQIAlert(ctx) });
    }
  }

  // Rule 6: Thunderstorm Alert (Condition contains thunderstorm)
  if (conditionMain.toLowerCase().includes('thunderstorm') || conditionDesc.toLowerCase().includes('thunder')) {
    if (canSendAlert(subscriber.lastThunderstormAlertSent, 6)) {
      alertsToSend.push({ type: 'lastThunderstormAlertSent', text: buildThunderstormAlert(ctx) });
    }
  }

  // Rule 7: Strong Wind Alert (Wind speed >= 35 km/h)
  if (windKmh >= 35) {
    if (canSendAlert(subscriber.lastStrongWindAlertSent, 8)) {
      alertsToSend.push({ type: 'lastStrongWindAlertSent', text: buildStrongWindAlert(ctx) });
    }
  }

  // Rule 8: Cold Weather Alert (Temp <= 12°C)
  if (temp <= 12) {
    if (canSendAlert(subscriber.lastColdWeatherAlertSent, 12)) {
      alertsToSend.push({ type: 'lastColdWeatherAlertSent', text: buildColdWeatherAlert(ctx) });
    }
  }

  // Rule 9: High UV Alert (UV Index >= 8)
  if (uvIndex >= 8) {
    if (canSendAlert(subscriber.lastUVAlertSent, 12)) {
      alertsToSend.push({ type: 'lastUVAlertSent', text: buildUVAlert(ctx) });
    }
  }

  // Rule 10: Visibility Alert (Visibility <= 2.0 km)
  if (Number(visibilityKm) <= 2.0) {
    if (canSendAlert(subscriber.lastVisibilityAlertSent, 8)) {
      alertsToSend.push({ type: 'lastVisibilityAlertSent', text: buildVisibilityAlert(ctx) });
    }
  }

  return alertsToSend;
}
