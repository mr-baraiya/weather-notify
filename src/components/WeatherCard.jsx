import WeatherIcon from './WeatherIcon';
import { Thermometer, Wind, Droplets } from 'lucide-react';

const WeatherCard = ({ weather }) => {
  if (!weather) return null;

  const temp = Math.round(weather.main.temp);
  const feelsLike = Math.round(weather.main.feels_like);
  const description = weather.weather?.[0]?.description || '';
  const condition = weather.weather?.[0]?.main || 'Clear';

  return (
    <div className="glass-card rounded-4xl p-8 w-full h-full min-h-[380px] flex flex-col justify-between text-left">
      
      {/* City & Description */}
      <div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">{weather.name}</h2>
        <p className="text-sm sm:text-base text-gray-400 capitalize mt-1">{description}</p>
      </div>

      {/* Main Temperature & Weather Icon Side by Side */}
      <div className="flex items-center justify-between my-auto py-6">
        <p className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-tighter text-white">
          {temp}°
        </p>
        <div className="text-yellow-400 p-2">
          <WeatherIcon condition={condition} className="w-16 h-16 sm:w-20 sm:h-20" />
        </div>
      </div>

      {/* Bottom Metrics Bar */}
      <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-5 text-center">
        <div>
          <p className="text-xs text-gray-400">Feels like</p>
          <p className="text-base sm:text-lg font-semibold text-white mt-0.5">{feelsLike}°C</p>
        </div>
        <div className="border-x border-white/10">
          <p className="text-xs text-gray-400">Wind</p>
          <p className="text-base sm:text-lg font-semibold text-white mt-0.5">{weather.wind.speed} m/s</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Humidity</p>
          <p className="text-base sm:text-lg font-semibold text-white mt-0.5">{weather.main.humidity}%</p>
        </div>
      </div>

    </div>
  );
};

export default WeatherCard;
