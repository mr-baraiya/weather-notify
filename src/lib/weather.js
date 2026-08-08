import axios from 'axios';

const API_KEY = process.env.OPENWEATHER_API_KEY;
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const getWeather = async (query) => {
  const params = {
    appid: API_KEY,
    units: 'metric',
  };

  let label = 'unknown location';

  if (typeof query === 'string') {
    params.q = query;
    label = query;
  } else if (query && typeof query === 'object') {
    const { city, lat, lon } = query;
    if (lat !== undefined && lon !== undefined) {
      params.lat = lat;
      params.lon = lon;
      label = `${lat}, ${lon}`;
    } else if (city) {
      params.q = city;
      label = city;
    }
  }

  if (!params.q && (params.lat === undefined || params.lon === undefined)) {
    throw new Error('City or coordinates are required');
  }

  try {
    const response = await axios.get(API_URL, { params });
    return response.data;
  } catch (error) {
    console.error(`Could not fetch weather for ${label}:`, error);
    throw new Error('Failed to fetch weather data');
  }
};

export const getForecast = async (query) => {
  const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
  const params = {
    appid: API_KEY,
    units: 'metric',
  };

  let label = 'unknown location';

  if (typeof query === 'string') {
    params.q = query;
    label = query;
  } else if (query && typeof query === 'object') {
    const { city, lat, lon } = query;
    if (lat !== undefined && lon !== undefined) {
      params.lat = lat;
      params.lon = lon;
      label = `${lat}, ${lon}`;
    } else if (city) {
      params.q = city;
      label = city;
    }
  }

  if (!params.q && (params.lat === undefined || params.lon === undefined)) {
    throw new Error('City or coordinates are required');
  }

  try {
    const response = await axios.get(FORECAST_URL, { params });
    const list = response.data.list;
    
    // Group by day
    const dailyData = {};
    list.forEach(item => {
      // The API returns dt_txt like "2024-03-24 15:00:00"
      const date = item.dt_txt.split(' ')[0];
      if (!dailyData[date]) {
        dailyData[date] = {
          min: item.main.temp_min,
          max: item.main.temp_max,
          conditions: [item.weather[0].main], // keep track to find most common
        };
      } else {
        dailyData[date].min = Math.min(dailyData[date].min, item.main.temp_min);
        dailyData[date].max = Math.max(dailyData[date].max, item.main.temp_max);
        dailyData[date].conditions.push(item.weather[0].main);
      }
    });

    // Format into an array of 5 days
    const forecast = Object.keys(dailyData).slice(0, 5).map(date => {
      const dayData = dailyData[date];
      // Get the most frequent condition for the day
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

      // Format date to short day name (e.g., 'Mon')
      const dateObj = new Date(date);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

      return {
        day: dayName,
        min: Math.round(dayData.min),
        max: Math.round(dayData.max),
        condition: mainCondition,
      };
    });

    return forecast;
  } catch (error) {
    console.error(`Could not fetch forecast for ${label}:`, error);
    throw new Error('Failed to fetch forecast data');
  }
};
