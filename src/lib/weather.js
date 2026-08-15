import axios from 'axios';

const API_KEY = process.env.OPENWEATHER_API_KEY;
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const cleanCityQuery = (cityStr = '') => {
  if (!cityStr) return '';
  let cleaned = cityStr.toString().trim();
  cleaned = cleaned.replace(/^(Bashkia|Municipality of|City of|District of|County of|Town of|Village of|Komuna|Opština|Gemeinde|Prefecture of|District|Municipality)\s+/i, '');
  cleaned = cleaned.replace(/\s+(Municipality|District|County|Prefecture|Division|Province)$/i, '');
  return cleaned.trim() || cityStr;
};

export const getWeather = async (query) => {
  const params = {
    appid: API_KEY,
    units: 'metric',
  };

  let label = 'unknown location';
  let primaryQuery = '';
  let fallbackQuery = '';

  if (typeof query === 'string') {
    primaryQuery = cleanCityQuery(query);
    fallbackQuery = query;
    label = primaryQuery;
  } else if (query && typeof query === 'object') {
    const { city, country, lat, lon } = query;
    if (lat !== undefined && lon !== undefined) {
      params.lat = lat;
      params.lon = lon;
      label = `${lat}, ${lon}`;
    } else if (city) {
      const cleaned = cleanCityQuery(city);
      primaryQuery = country ? `${cleaned},${country}` : cleaned;
      fallbackQuery = city;
      label = primaryQuery;
    }
  }

  if (!primaryQuery && !params.q && (params.lat === undefined || params.lon === undefined)) {
    throw new Error('City or coordinates are required');
  }

  if (primaryQuery) {
    try {
      const response = await axios.get(API_URL, { params: { ...params, q: primaryQuery } });
      return response.data;
    } catch (primaryErr) {
      if (fallbackQuery && fallbackQuery !== primaryQuery) {
        try {
          const fallbackRes = await axios.get(API_URL, { params: { ...params, q: fallbackQuery } });
          return fallbackRes.data;
        } catch { }
      }
      console.error(`Could not fetch weather for ${label}:`, primaryErr.message);
      throw new Error(`Failed to fetch weather data for ${label}`);
    }
  }

  try {
    const response = await axios.get(API_URL, { params });
    return response.data;
  } catch (error) {
    console.error(`Could not fetch weather for ${label}:`, error);
    throw new Error('Failed to fetch weather data');
  }
};

export function processForecastData(data) {
  const list = data?.list || [];
  const cityData = data?.city || {};
  const tzOffset = cityData.timezone !== undefined ? cityData.timezone : 19800;

  const dailyData = {};
  list.forEach((item) => {
    const localDateObj = new Date((item.dt + tzOffset) * 1000);
    const date = localDateObj.toISOString().split('T')[0];
    const popVal = Math.round((item.pop || 0) * 100);

    if (!dailyData[date]) {
      dailyData[date] = {
        min: item.main.temp_min,
        max: item.main.temp_max,
        conditions: [item.weather[0]?.main || 'Clear'],
        maxPop: popVal,
      };
    } else {
      dailyData[date].min = Math.min(dailyData[date].min, item.main.temp_min);
      dailyData[date].max = Math.max(dailyData[date].max, item.main.temp_max);
      dailyData[date].conditions.push(item.weather[0]?.main || 'Clear');
      dailyData[date].maxPop = Math.max(dailyData[date].maxPop, popVal);
    }
  });

  return Object.keys(dailyData)
    .slice(0, 5)
    .map((date, idx) => {
      const dayData = dailyData[date];
      const conditionCounts = dayData.conditions.reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
      }, {});

      let mainCondition = Object.keys(conditionCounts)[0] || 'Clear';
      let maxCount = conditionCounts[mainCondition] || 0;
      for (const cond in conditionCounts) {
        if (conditionCounts[cond] > maxCount) {
          mainCondition = cond;
          maxCount = conditionCounts[cond];
        }
      }

      const dateObj = new Date(`${date}T00:00:00`);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      let dayName = days[dateObj.getDay()];
      if (idx === 0) dayName = 'Today';
      if (idx === 1) dayName = 'Tomorrow';

      return {
        day: dayName,
        date,
        min: Math.round(dayData.min),
        max: Math.round(dayData.max),
        condition: mainCondition,
        pop: dayData.maxPop,
      };
    });
};

export const getForecast = async (query) => {
  const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
  const params = {
    appid: API_KEY,
    units: 'metric',
  };

  let label = 'unknown location';
  let primaryQuery = '';
  let fallbackQuery = '';

  if (typeof query === 'string') {
    primaryQuery = cleanCityQuery(query);
    fallbackQuery = query;
    label = primaryQuery;
  } else if (query && typeof query === 'object') {
    const { city, country, lat, lon } = query;
    if (lat !== undefined && lon !== undefined) {
      params.lat = lat;
      params.lon = lon;
      label = `${lat}, ${lon}`;
    } else if (city) {
      const cleaned = cleanCityQuery(city);
      primaryQuery = country ? `${cleaned},${country}` : cleaned;
      fallbackQuery = city;
      label = primaryQuery;
    }
  }

  if (primaryQuery) {
    try {
      const response = await axios.get(FORECAST_URL, { params: { ...params, q: primaryQuery } });
      return processForecastData(response.data);
    } catch (primaryErr) {
      if (fallbackQuery && fallbackQuery !== primaryQuery) {
        try {
          const fallbackRes = await axios.get(FORECAST_URL, { params: { ...params, q: fallbackQuery } });
          return processForecastData(fallbackRes.data);
        } catch { }
      }
      console.error(`Could not fetch forecast for ${label}:`, primaryErr.message);
      return [];
    }
  }

  if (!params.q && (params.lat === undefined || params.lon === undefined)) {
    throw new Error('City or coordinates are required');
  }

  try {
    const response = await axios.get(FORECAST_URL, { params });
    const list = response.data.list || [];
    const cityData = response.data.city || {};
    const tzOffset = cityData.timezone !== undefined ? cityData.timezone : 19800;

    // Extract Hourly Forecast (Next 8 slots)
    const hourly = list.slice(0, 8).map((item) => {
      const dateObj = new Date((item.dt + tzOffset) * 1000);
      const hours = dateObj.getUTCHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const timeStr = `${formattedHours} ${ampm}`;

      return {
        time: timeStr,
        temp: Math.round(item.main.temp),
        condition: item.weather[0]?.main || 'Clear',
        pop: Math.round((item.pop || 0) * 100),
      };
    });

    // Group by day for 5-Day Forecast using city local timezone date
    const dailyData = {};
    list.forEach((item) => {
      const localDateObj = new Date((item.dt + tzOffset) * 1000);
      const date = localDateObj.toISOString().split('T')[0];
      const popVal = Math.round((item.pop || 0) * 100);

      if (!dailyData[date]) {
        dailyData[date] = {
          min: item.main.temp_min,
          max: item.main.temp_max,
          conditions: [item.weather[0]?.main || 'Clear'],
          maxPop: popVal,
        };
      } else {
        dailyData[date].min = Math.min(dailyData[date].min, item.main.temp_min);
        dailyData[date].max = Math.max(dailyData[date].max, item.main.temp_max);
        dailyData[date].conditions.push(item.weather[0]?.main || 'Clear');
        dailyData[date].maxPop = Math.max(dailyData[date].maxPop, popVal);
      }
    });

    const forecast = Object.keys(dailyData)
      .slice(0, 5)
      .map((date, idx) => {
        const dayData = dailyData[date];
        const conditionCounts = dayData.conditions.reduce((acc, curr) => {
          acc[curr] = (acc[curr] || 0) + 1;
          return acc;
        }, {});

        let mainCondition = Object.keys(conditionCounts)[0];
        let maxCount = conditionCounts[mainCondition];
        for (const cond in conditionCounts) {
          if (conditionCounts[cond] > maxCount) {
            maxCount = conditionCounts[cond];
            mainCondition = cond;
          }
        }

        const dateObj = new Date(date);
        const dayName =
          idx === 0
            ? 'Today'
            : idx === 1
              ? 'Tomorrow'
              : dateObj.toLocaleDateString('en-US', { weekday: 'short' });

        const formattedDate = new Date(date + 'T00:00:00Z').toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          timeZone: 'UTC',
        });

        return {
          day: dayName,
          date: formattedDate,
          min: Math.round(dayData.min),
          max: Math.round(dayData.max),
          condition: mainCondition,
          pop: dayData.maxPop,
        };
      });

    return { forecast, hourly };
  } catch (error) {
    console.error(`Could not fetch forecast for ${label}:`, error);
    return { forecast: [], hourly: [] };
  }
};

export const getAirPollution = async (lat, lon) => {
  if (!lat || !lon) return null;
  const POLLUTION_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';
  try {
    const response = await axios.get(POLLUTION_URL, {
      params: { lat, lon, appid: API_KEY },
    });
    const data = response.data?.list?.[0];
    if (!data) return null;

    const aqiMap = {
      1: { label: 'Good' },
      2: { label: 'Fair' },
      3: { label: 'Moderate' },
      4: { label: 'Poor' },
      5: { label: 'Very Poor' },
    };

    const aqi = data.main?.aqi || 1;
    return {
      aqi,
      status: aqiMap[aqi]?.label || 'Fair',
      pm25: Math.round(data.components?.pm2_5 || 0),
      pm10: Math.round(data.components?.pm10 || 0),
      no2: Math.round(data.components?.no2 || 0),
      o3: Math.round(data.components?.o3 || 0),
    };
  } catch (error) {
    console.error(`Air pollution fetch error for ${lat}, ${lon}:`, error.message);
    return null;
  }
};

export const getStateByCoords = async (lat, lon) => {
  if (!lat || !lon || !API_KEY) return '';
  try {
    const response = await axios.get('http://api.openweathermap.org/geo/1.0/reverse', {
      params: { lat, lon, limit: 1, appid: API_KEY },
      timeout: 3000,
    });
    const match = response.data?.[0];
    return match?.state || '';
  } catch (error) {
    return '';
  }
};

/**
 * Unified Helper to fetch complete weather data bundle (Current, Forecast, Air Quality, State)
 */
export const getFullWeatherData = async (query) => {
  const current = await getWeather(query);
  const { lat, lon } = current.coord || {};
  const [forecastData, airPollution, geoState] = await Promise.all([
    getForecast(query),
    lat && lon ? getAirPollution(lat, lon) : Promise.resolve(null),
    lat && lon ? getStateByCoords(lat, lon) : Promise.resolve(''),
  ]);

  const forecast = Array.isArray(forecastData) ? forecastData : forecastData.forecast || [];
  const hourly = forecastData.hourly || [];

  if (geoState) {
    current.sys = current.sys || {};
    current.sys.state = geoState;
  }

  return {
    current,
    forecast,
    hourly,
    airPollution,
    state: geoState,
  };
};
