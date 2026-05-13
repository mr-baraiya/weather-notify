import WeatherIcon from './WeatherIcon';
import { Thermometer, Wind, Droplets } from 'lucide-react';

const WeatherCard = ({ weather }) => {
  if (!weather) return null;

  return (
    <div className="glass-card rounded-4xl p-8 w-full max-w-sm mx-auto transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold">{weather.name}</h2>
          <p className="text-gray-300">{weather.weather[0].description}</p>
        </div>
        <WeatherIcon condition={weather.weather[0].main} />
      </div>
      <div className="mt-8 text-center">
        <p className="text-7xl font-extrabold">{Math.round(weather.main.temp)}°C</p>
      </div>
      <div className="mt-8 flex justify-around text-lg">
        <div className="flex items-center gap-2">
          <Thermometer size={24} />
          <span>{Math.round(weather.main.feels_like)}°C</span>
        </div>
        <div className="flex items-center gap-2">
          <Wind size={24} />
          <span>{weather.wind.speed} m/s</span>
        </div>
        <div className="flex items-center gap-2">
          <Droplets size={24} />
          <span>{weather.main.humidity}%</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
