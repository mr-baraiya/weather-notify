import axios from 'axios';

const API_KEY = process.env.OPENWEATHER_API_KEY;
const GEO_REVERSE_URL = 'https://api.openweathermap.org/geo/1.0/reverse';

export const getCountryFromCoords = async ({ lat, lon }) => {
  if (lat === undefined || lon === undefined) {
    throw new Error('Latitude and longitude are required');
  }

  const response = await axios.get(GEO_REVERSE_URL, {
    params: {
      lat,
      lon,
      limit: 1,
      appid: API_KEY,
    },
  });

  const first = Array.isArray(response.data) ? response.data[0] : null;
  return first?.country || null;
};
