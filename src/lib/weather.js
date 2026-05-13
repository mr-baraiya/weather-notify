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
