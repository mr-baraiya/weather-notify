import WeatherIcon from './WeatherIcon';
import { Thermometer, Wind, Droplets } from 'lucide-react';

const WeatherCard = ({ weather }) => {
  if (!weather || !weather.current) return null;

  const current = weather.current;
  const forecast = weather.forecast || [];

  const temp = Math.round(current.main.temp);
  const feelsLike = Math.round(current.main.feels_like);
  const description = current.weather?.[0]?.description || '';
  const condition = current.weather?.[0]?.main || 'Clear';

  return (
    <div className="glass-card md:rounded-4xl md:p-8 p-4 w-full h-full min-h-[380px] flex flex-col justify-between text-left">
      
      {/* City & Description */}
      <div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">{current.name}</h2>
        <p className="text-sm sm:text-base text-sky-100/80 capitalize mt-1">{description}</p>
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
      <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-5 text-center mb-6">
        <div>
          <p className="text-xs text-sky-100/75">Feels like</p>
          <p className="text-base sm:text-lg font-semibold text-white mt-0.5">{feelsLike}°C</p>
        </div>
        <div className="border-x border-white/10">
          <p className="text-xs text-sky-100/75">Wind</p>
          <p className="text-base sm:text-lg font-semibold text-white mt-0.5">{current.wind.speed} m/s</p>
        </div>
        <div>
          <p className="text-xs text-sky-100/75">Humidity</p>
          <p className="text-base sm:text-lg font-semibold text-white mt-0.5">{current.main.humidity}%</p>
        </div>
      </div>

      {/* 5-Day Forecast */}
      {forecast.length > 0 && (
        <div className="flex items-center justify-between gap-4 overflow-x-auto border-t border-white/10 pt-5 pb-2 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {forecast.map((day, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <p className="text-xs text-sky-100/75 mb-2">{day.day}</p>
              <div className="text-white mb-2">
                <WeatherIcon condition={day.condition} className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-white">
                {day.max}° <span className="text-sky-200/60 font-normal">{day.min}°</span>
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default WeatherCard;
