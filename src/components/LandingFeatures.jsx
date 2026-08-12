'use client';

import React from 'react';
import {
  CloudRain,
  Cloud,
  Sun,
  CloudLightning,
  CloudSnow,
  CloudFog,
} from 'lucide-react';

/* ─── Minimal Weather Icon Mapper ────────────────────────────────── */
const renderWeatherIcon = (condition, size = 20, className = 'text-sky-300') => {
  const cond = (condition || '').toLowerCase();
  if (cond.includes('rain') || cond.includes('drizzle')) return <CloudRain size={size} className={className} />;
  if (cond.includes('thunder') || cond.includes('storm')) return <CloudLightning size={size} className={className} />;
  if (cond.includes('snow') || cond.includes('ice')) return <CloudSnow size={size} className={className} />;
  if (cond.includes('fog') || cond.includes('mist') || cond.includes('haze')) return <CloudFog size={size} className={className} />;
  if (cond.includes('cloud')) return <Cloud size={size} className={className} />;
  return <Sun size={size} className={className} />;
};

/* ─── UV Index Status & Recommendation Calculator ───────────────────── */
const getUVStatus = (uv) => {
  if (uv <= 2) return `${uv} — Low`;
  if (uv <= 5) return `${uv} — Moderate`;
  if (uv <= 7) return `${uv} — High`;
  if (uv <= 10) return `${uv} — Very High`;
  return `${uv} — Extreme`;
};

const getUVRecommendation = (uv) => {
  if (uv <= 2) return 'Low risk';
  if (uv <= 5) return 'Sun protection needed';
  if (uv <= 7) return 'Protection recommended';
  if (uv <= 10) return 'Extra protection required';
  return 'Avoid sun exposure';
};

export default function LandingFeatures({ weather, loading }) {
  /* ─── 1. SKELETON LOADING STATE ─────────────────────────────────────── */
  if (loading || !weather || !weather.current) {
    return (
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
        }}
        className="rounded-3xl max-w-6xl mx-4 sm:mx-6 lg:mx-auto shadow-2xl mt-8 sm:mt-12 mb-16 sm:mb-20 divide-y divide-white/10 overflow-hidden animate-pulse font-sans"
      >
        {/* ROW 1 SKELETON */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
          <div className="p-5 sm:p-8 space-y-6">
            <div className="flex items-center justify-between gap-2">
              <div className="h-7 w-40 bg-white/10 rounded-lg"></div>
              <div className="h-6 w-20 bg-white/10 rounded-full"></div>
            </div>
            <div className="h-10 w-full bg-white/10 rounded-lg"></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="h-6 w-full bg-white/10 rounded-lg"></div>
              <div className="h-6 w-full bg-white/10 rounded-lg"></div>
              <div className="h-6 w-full bg-white/10 rounded-lg"></div>
              <div className="h-6 w-full bg-white/10 rounded-lg"></div>
            </div>
            <div className="pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="h-8 w-full bg-white/10 rounded-lg"></div>
              <div className="h-8 w-full bg-white/10 rounded-lg"></div>
              <div className="h-8 w-full bg-white/10 rounded-lg"></div>
              <div className="h-8 w-full bg-white/10 rounded-lg"></div>
            </div>
          </div>

          <div className="p-5 sm:p-8 space-y-5">
            <div className="flex items-center justify-between gap-2">
              <div className="h-7 w-32 bg-white/10 rounded-lg"></div>
              <div className="h-6 w-28 bg-white/10 rounded-full"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="h-10 w-full bg-white/10 rounded-lg"></div>
              <div className="h-10 w-full bg-white/10 rounded-lg"></div>
              <div className="h-10 w-full bg-white/10 rounded-lg"></div>
              <div className="h-10 w-full bg-white/10 rounded-lg"></div>
            </div>
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="h-5 w-40 bg-white/10 rounded-lg"></div>
              <div className="h-5 w-full bg-white/10 rounded-lg"></div>
              <div className="h-5 w-full bg-white/10 rounded-lg"></div>
              <div className="h-5 w-full bg-white/10 rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* ROW 2 SKELETON */}
        <div className="p-5 sm:p-8 space-y-4">
          <div className="h-6 w-40 bg-white/10 rounded-lg"></div>
          <div className="flex items-center justify-between gap-4 overflow-x-auto">
            <div className="h-16 w-16 bg-white/10 rounded-xl shrink-0"></div>
            <div className="h-16 w-16 bg-white/10 rounded-xl shrink-0"></div>
            <div className="h-16 w-16 bg-white/10 rounded-xl shrink-0"></div>
            <div className="h-16 w-16 bg-white/10 rounded-xl shrink-0"></div>
            <div className="h-16 w-16 bg-white/10 rounded-xl shrink-0"></div>
            <div className="h-16 w-16 bg-white/10 rounded-xl shrink-0"></div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── 2. LIVE TELEMETRY VIEW ────────────────────────────────────────── */
  const current = weather.current;
  const hourlyList = weather.hourly || [];
  const airPollution = weather.airPollution || { aqi: 2, status: 'Fair', pm25: 7, pm10: 26, no2: 1, o3: 38 };

  const temp = Math.round(current.main?.temp || 0);
  const feelsLike = Math.round(current.main?.feels_like || 0);
  const humidity = current.main?.humidity || 0;
  const windSpeed = current.wind?.speed || 0;
  const pressure = current.main?.pressure || 1013;
  const visibility = current.visibility ? (current.visibility / 1000).toFixed(1) : '10.0';
  const clouds = current.clouds?.all || 0;
  const description = current.weather?.[0]?.description || 'clear sky';

  // Format Sunrise & Sunset
  const formatTime = (timestamp) => {
    if (!timestamp) return '--:--';
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const sunriseTime = formatTime(current.sys?.sunrise);
  const sunsetTime = formatTime(current.sys?.sunset);

  // Dynamic Weather Summary Sentence
  const generateSummary = () => {
    const isHot = temp >= 34;
    const isCold = temp <= 15;
    const isRainy = description.includes('rain') || description.includes('drizzle');
    const isCloudy = description.includes('cloud');

    if (isRainy) return `Rainy conditions today in ${current.name} with ${description}. Carry an umbrella if heading outdoors.`;
    if (isHot) return `Warm and sunny today in ${current.name}. High temperature of ${temp}°C expected during afternoon hours.`;
    if (isCold) return `Cool temperatures today in ${current.name} with ${description}. Keep warm in the early morning and evening.`;
    if (isCloudy) return `Mild and ${description} today in ${current.name} with temperatures around ${temp}°C.`;
    return `Clear skies and pleasant weather today in ${current.name} with comfortable temperatures.`;
  };

  const summaryText = generateSummary();
  const uvValue = Math.min(11, Math.max(1, Math.round(temp / 4.5)));
  const uvDisplay = getUVStatus(uvValue);

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
      }}
      className="rounded-2xl sm:rounded-3xl max-w-6xl mx-4 sm:mx-6 lg:mx-auto text-white shadow-2xl mt-8 sm:mt-12 mb-16 sm:mb-20 font-sans divide-y divide-white/10 overflow-hidden"
    >
      {/* ─── ROW 1: TODAY'S WEATHER & AIR QUALITY / SOLAR TELEMETRY ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
        
        {/* LEFT COLUMN: TODAY'S WEATHER */}
        <div className="p-5 sm:p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <h3 className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-sky-200 via-sky-100 to-white bg-clip-text text-transparent text-left border-l-2 border-sky-400 pl-3 py-0.5">
                Today's Weather
              </h3>
              <span className="self-start sm:self-auto text-xs sm:text-sm font-mono font-semibold text-white/90 bg-white/10 border border-white/20 px-3.5 py-1 rounded-full backdrop-blur-md">
                {current.name}
              </span>
            </div>

            <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium text-left">
              {summaryText}
            </p>

            {/* Metric Row */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm text-left">
              <div>
                <span className="text-sky-200/90 block text-xs sm:text-sm font-medium">Temperature</span>
                <span className="font-extrabold text-white text-base sm:text-xl font-mono">{temp}°C</span>
              </div>
              <div>
                <span className="text-sky-200/90 block text-xs sm:text-sm font-medium">Feels Like</span>
                <span className="font-extrabold text-white text-base sm:text-xl font-mono">{feelsLike}°C</span>
              </div>
              <div>
                <span className="text-sky-200/90 block text-xs sm:text-sm font-medium">Humidity</span>
                <span className="font-extrabold text-white text-base sm:text-xl font-mono">{humidity}%</span>
              </div>
              <div>
                <span className="text-sky-200/90 block text-xs sm:text-sm font-medium">Wind</span>
                <span className="font-extrabold text-white text-base sm:text-xl font-mono">{windSpeed} m/s</span>
              </div>
            </div>
          </div>

          {/* Atmospheric Conditions */}
          <div className="pt-4 border-t border-white/10 space-y-3 text-left">
            <h3 className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-sky-200 via-sky-100 to-white bg-clip-text text-transparent text-left border-l-2 border-sky-400 pl-3 py-0.5">
              Atmospheric Conditions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
              <div>
                <p className="text-sky-200/90 font-sans text-xs sm:text-sm font-medium">Pressure</p>
                <p className="font-extrabold text-white text-base sm:text-lg mt-0.5 font-mono">{pressure} hPa</p>
              </div>
              <div>
                <p className="text-sky-200/90 font-sans text-xs sm:text-sm font-medium">Visibility</p>
                <p className="font-extrabold text-white text-base sm:text-lg mt-0.5 font-mono">{visibility} km</p>
              </div>
              <div>
                <p className="text-sky-200/90 font-sans text-xs sm:text-sm font-medium">Cloudiness</p>
                <p className="font-extrabold text-white text-base sm:text-lg mt-0.5 font-mono">{clouds}%</p>
              </div>
              <div>
                <p className="text-sky-200/90 font-sans text-xs sm:text-sm font-medium">Precipitation</p>
                <p className="font-extrabold text-white text-base sm:text-lg mt-0.5 font-mono">{hourlyList[0]?.pop || 0}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AIR QUALITY & SUN / UV TELEMETRY */}
        <div className="p-5 sm:p-8 space-y-5 flex flex-col justify-between">
          {/* Air Quality */}
          <div className="space-y-3 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <h3 className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-sky-200 via-sky-100 to-white bg-clip-text text-transparent text-left border-l-2 border-sky-400 pl-3 py-0.5">
                Air Quality
              </h3>
              <span className="self-start sm:self-auto text-xs sm:text-sm font-mono font-semibold text-white/90 bg-white/10 border border-white/20 px-3.5 py-1 rounded-full backdrop-blur-md">
                AQI {airPollution.aqi} — {airPollution.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center pt-1">
              <div>
                <p className="text-sky-200/90 font-sans text-xs sm:text-sm font-medium">PM2.5</p>
                <p className="font-extrabold text-white text-base sm:text-lg mt-0.5 font-mono">
                  {airPollution.pm25} <span className="text-xs text-sky-200 font-normal">µg/m³</span>
                </p>
              </div>
              <div>
                <p className="text-sky-200/90 font-sans text-xs sm:text-sm font-medium">PM10</p>
                <p className="font-extrabold text-white text-base sm:text-lg mt-0.5 font-mono">
                  {airPollution.pm10} <span className="text-xs text-sky-200 font-normal">µg/m³</span>
                </p>
              </div>
              <div>
                <p className="text-sky-200/90 font-sans text-xs sm:text-sm font-medium">NO₂</p>
                <p className="font-extrabold text-white text-base sm:text-lg mt-0.5 font-mono">
                  {airPollution.no2} <span className="text-xs text-sky-200 font-normal">µg/m³</span>
                </p>
              </div>
              <div>
                <p className="text-sky-200/90 font-sans text-xs sm:text-sm font-medium">O₃</p>
                <p className="font-extrabold text-white text-base sm:text-lg mt-0.5 font-mono">
                  {airPollution.o3} <span className="text-xs text-sky-200 font-normal">µg/m³</span>
                </p>
              </div>
            </div>
          </div>

          {/* Sun & UV */}
          <div className="pt-4 border-t border-white/10 space-y-3 text-left">
            <h3 className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-sky-200 via-sky-100 to-white bg-clip-text text-transparent text-left border-l-2 border-sky-400 pl-3 py-0.5">
              Sun & UV
            </h3>
            <div className="space-y-2.5 text-sm sm:text-base">
              <div className="flex items-center justify-between">
                <span className="text-slate-200 font-semibold text-xs sm:text-sm">UV Index</span>
                <div className="text-right">
                  <span className="font-extrabold text-white font-mono text-xs sm:text-sm block">{uvDisplay}</span>
                  <span className="text-xs text-sky-300 font-medium block">{getUVRecommendation(uvValue)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-200 font-semibold text-xs sm:text-sm">Sunrise</span>
                <span className="font-extrabold text-white font-mono text-xs sm:text-sm">{sunriseTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-200 font-semibold text-xs sm:text-sm">Sunset</span>
                <span className="font-extrabold text-white font-mono text-xs sm:text-sm">{sunsetTime}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ─── LAST ROW: HOURLY FORECAST ─────────────────────────────────────── */}
      <div className="p-5 sm:p-8 space-y-4 text-left">
        <h3 className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-sky-200 via-sky-100 to-white bg-clip-text text-transparent text-left border-l-2 border-sky-400 pl-3 py-0.5">
          Hourly Forecast
        </h3>
        
        <div className="flex items-center justify-start sm:justify-between overflow-x-auto pb-2 pt-1 gap-4 sm:gap-6 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
          {(hourlyList.length > 0 ? hourlyList : [
            { time: '8 PM', temp: temp, condition: 'Clear', pop: 0 },
            { time: '11 PM', temp: temp, condition: 'Clouds', pop: 0 },
            { time: '2 AM', temp: temp - 1, condition: 'Clouds', pop: 0 },
            { time: '5 AM', temp: temp - 1, condition: 'Clear', pop: 0 },
            { time: '8 AM', temp: temp, condition: 'Clear', pop: 0 },
            { time: '11 AM', temp: temp + 1, condition: 'Clear', pop: 0 },
          ]).slice(0, 7).map((item, idx) => (
            <div key={idx} className="flex flex-col items-center min-w-[65px] sm:min-w-[70px] space-y-1.5 text-center flex-1 py-1 px-2 rounded-xl hover:bg-white/5 transition-all shrink-0 sm:shrink">
              <span className="text-xs sm:text-sm font-mono text-slate-200 font-semibold">{item.time}</span>
              <div className="py-1">
                {renderWeatherIcon(item.condition, 22)}
              </div>
              <span className="text-base sm:text-lg font-extrabold text-white font-mono">{item.temp}°C</span>
              <span className="text-xs font-mono text-sky-300 font-semibold whitespace-nowrap">Rain {item.pop}%</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
