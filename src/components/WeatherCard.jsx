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
        <div className="grid grid-cols-5 gap-1 sm:gap-2 border-t border-white/10 pt-4 pb-1 text-center">
          {forecast.map((day, idx) => (
            <div key={idx} className="flex flex-col items-center justify-between h-full min-w-0">
              <p className="text-[10px] sm:text-xs text-sky-100/75 font-medium truncate w-full mb-1.5" title={day.day}>
                {day.day}
              </p>
              <div className="text-white mb-1.5 flex items-center justify-center">
                <WeatherIcon condition={day.condition} className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs sm:text-sm font-semibold text-white leading-tight">
                  {day.max}°
                </span>
                <span className="text-[10px] sm:text-xs text-sky-200/60 font-normal leading-tight">
                  {day.min}°
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default WeatherCard;
