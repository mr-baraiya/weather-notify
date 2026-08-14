'use client';

import { useState, useEffect, useMemo } from 'react';
import { Locate, Maximize2, Minimize2, Layers } from 'lucide-react';
import WeatherIcon from './WeatherIcon';

const LAYERS_LIST = [
  { id: 'temp_new', name: 'Temperature', icon: 'temp' },
  { id: 'radar', name: 'Weather Radar', icon: 'radar' },
  { id: 'precipitation_new', name: 'Rain, thunder', icon: 'rain' },
  { id: 'clouds_new', name: 'Clouds', icon: 'clouds' },
  { id: 'wind_new', name: 'Wind', icon: 'wind' },
  { id: 'waves_new', name: 'Waves', icon: 'waves' },
  { id: 'pressure_new', name: 'Sea Pressure', icon: 'pressure' },
];

const WINDY_OVERLAY_MAP = {
  temp_new: 'temp',
  radar: 'radar',
  precipitation_new: 'rain',
  clouds_new: 'clouds',
  wind_new: 'wind',
  waves_new: 'waves',
  pressure_new: 'pressure',
};

const LAYER_DESCRIPTIONS = {
  temp_new: 'High-contrast thermal overlays displaying temperature gradients across heights.',
  radar: 'Real-time doppler radar tracking rain fronts, storm cells, and severe weather movement.',
  precipitation_new: 'Accumulated rain, snow, and moisture forecast overlays over hours.',
  clouds_new: 'Satellite cloud cover density tracking low, medium, and high-altitude clouds.',
  wind_new: 'Dynamic flow particle animation tracking wind direction and velocity.',
  waves_new: 'Real-time wave height, swell direction, and sea state forecasts.',
  pressure_new: 'Atmospheric sea level pressure contours, identifying high and low-pressure systems.',
};

export default function WeatherMapComponent({ weather, onLocationChange }) {
  const [activeLayer, setActiveLayer] = useState('temp_new');
  const [zoom, setZoom] = useState(8);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // User location overrides
  const [localCoords, setLocalCoords] = useState(null);
  const [localWeather, setLocalWeather] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [syncTrigger, setSyncTrigger] = useState(Date.now());

  // Dynamic values based on current city search vs geolocation override
  const activeWeather = localWeather || weather;
  const current = activeWeather?.current || {};
  
  const lat = localCoords ? localCoords.lat : (current.coord?.lat || 22.3039);
  const lon = localCoords ? localCoords.lon : (current.coord?.lon || 70.8022);
  const cityName = localCoords ? localCoords.cityName : (current.name || 'Rajkot');
  const temp = current.main?.temp;
  const feelsLike = current.main?.feels_like;
  const humidity = current.main?.humidity;
  const windSpeed = current.wind?.speed;
  const windDeg = current.wind?.deg;
  const pressure = current.main?.pressure;
  const condition = current.weather?.[0]?.main || 'Clear';
  const description = current.weather?.[0]?.description || '';
  const airPollution = activeWeather?.airPollution;

  // Reset geolocation overrides if parent searches for another city
  useEffect(() => {
    setLocalCoords(null);
    setLocalWeather(null);
    setIsDropdownOpen(false);
  }, [weather]);

  // Disable browser body scrolling when map is in fullscreen mode
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLon = pos.coords.longitude;

        setLocalCoords({
          lat: userLat,
          lon: userLon,
          cityName: 'My Location'
        });
        setSyncTrigger(Date.now());

        try {
          const res = await fetch(`/api/weather?lat=${userLat}&lon=${userLon}`);
          const data = await res.json();
          if (data?.success && data.data) {
            setLocalWeather(data.data);
            setLocalCoords({
              lat: userLat,
              lon: userLon,
              cityName: data.data.current?.name || 'My Location'
            });
            setSyncTrigger(Date.now());
            if (onLocationChange) {
              onLocationChange(data.data, data.data.current?.name || 'Current Location');
            }
          }
        } catch (err) {
          console.error("Error fetching local weather stats:", err);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Unable to fetch location. Please check browser permissions.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 300000 }
    );
  };

  // Sync zoom and loading state when coordinates change
  useEffect(() => {
    setIframeLoaded(false);
  }, [lat, lon, activeLayer, zoom]);

  // Handle Fullscreen Keydowns (Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Construct Windy iframe embed URL
  const windyUrl = useMemo(() => {
    const overlay = WINDY_OVERLAY_MAP[activeLayer] || 'temp';
    
    return `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&zoom=${zoom}&level=surface&overlay=${overlay}&menu=&message=true&marker=true&metricWind=default&metricTemp=default&calendar=now&_ts=${syncTrigger}`;
  }, [lat, lon, activeLayer, zoom, syncTrigger]);

  // AQI Level Parser
  const getAqiLabel = (aqi) => {
    switch (aqi) {
      case 1: return { label: 'Good', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 2: return { label: 'Fair', color: 'text-teal-300 bg-teal-500/10 border-teal-500/20' };
      case 3: return { label: 'Moderate', color: 'text-yellow-300 bg-yellow-500/10 border-yellow-500/20' };
      case 4: return { label: 'Poor', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
      case 5: return { label: 'Very Poor', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
      default: return { label: 'Unknown', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' };
    }
  };

  const aqiInfo = useMemo(() => {
    const aqi = airPollution?.aqi;
    return getAqiLabel(aqi);
  }, [airPollution]);

  return (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-[9999] bg-slate-950 w-screen h-screen overflow-hidden text-left font-sans'
          : 'w-full space-y-6 text-left'
      }
    >
      {/* Top Banner Control Panel */}
      {!isFullscreen && (
        <div className="flex flex-col gap-4 pb-2 border-b border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                Weather Layers
              </h2>
              <p className="text-xs text-indigo-200/90 font-semibold">
                Use map overlay telemetry and controls to explore different weather indices.
              </p>
            </div>
            <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-sky-200">
              Centering Telemetry: <strong className="text-white ml-0.5">{cityName}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout Stack: Large Map on Top, Black Box details below */}
      <div className={isFullscreen ? 'w-full h-full' : 'flex flex-col gap-6'}>
        
        {/* Large Windy Iframe Map Wrapper */}
        <div
          className={`w-full relative flex flex-col shrink-0 transition-all duration-300 ${
            isFullscreen 
              ? 'h-full rounded-none' 
              : 'glass-card rounded-3xl h-[550px] sm:h-[680px] lg:h-[760px]'
          }`}
        >
          {/* Iframe Loading screen */}
          {!iframeLoaded && (
            <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="relative flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-dotted border-indigo-400 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Syncing Windy Satellite Data...</p>
                <p className="text-xs text-sky-200/50 mt-1 max-w-[280px]">Connecting to dynamic forecasting layers and wind particle systems.</p>
              </div>
            </div>
          )}

          {/* Floating Controls HUD (Top-Left) */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-40 flex flex-col gap-1.5 sm:gap-2 select-none pointer-events-auto">
            {/* Coordinates Display Card (Desktop only) */}
            <div className="hidden sm:flex px-3 py-1.5 rounded-xl bg-slate-950/90 border border-white/10 backdrop-blur-md shadow-lg font-mono text-[9px] font-bold text-indigo-200/90 pointer-events-none">
              GPS: {Number(lat).toFixed(4)}°, {Number(lon).toFixed(4)}°
            </div>

            {/* Quick Actions Panel */}
            <div className="flex flex-col gap-1.5 sm:gap-2">
              {/* Row 1: Icon Actions (Locate & Fullscreen) */}
              <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2">
                {/* Geolocation Button */}
                <button
                  onClick={handleLocateUser}
                  disabled={isLocating}
                  className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl border transition-all cursor-pointer shadow-lg backdrop-blur-md ${
                    isLocating 
                      ? 'bg-indigo-600/40 border-indigo-500/50 text-indigo-300 pointer-events-none' 
                      : 'bg-slate-950/90 hover:bg-slate-900 border-white/10 text-sky-300 hover:text-white'
                  }`}
                  title="Locate Current Position"
                >
                  <Locate className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                </button>

                {/* Floating Fullscreen Toggle Button */}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-950/90 border border-white/10 text-sky-300 hover:text-white hover:bg-slate-900 backdrop-blur-md shadow-lg cursor-pointer transition-all"
                  title={isFullscreen ? 'Exit Fullscreen Map' : 'Enter Fullscreen Map'}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  ) : (
                    <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  )}
                </button>
              </div>

              {/* Row 2: Floating Custom Layers Selector Dropdown */}
              <div className="relative order-2 sm:order-1">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl bg-slate-950/90 border border-white/10 hover:bg-slate-900 text-sky-300 hover:text-white transition-all shadow-lg backdrop-blur-md cursor-pointer text-[10px] sm:text-xs font-bold whitespace-nowrap"
                >
                  <Layers className="w-3 h-3 sm:w-[13px] sm:h-[13px]" />
                  <span>{LAYERS_LIST.find((l) => l.id === activeLayer)?.name}</span>
                  <svg
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-white transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <>
                    {/* Click outside overlay */}
                    <div
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    
                    {/* Options popover list */}
                    <div className="absolute top-full left-0 mt-1.5 sm:mt-2 z-50 w-[160px] sm:w-[200px] rounded-lg sm:rounded-xl bg-slate-950/95 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden py-0.5 sm:py-1">
                      {LAYERS_LIST.map((layer) => {
                        const isSelected = activeLayer === layer.id;
                        return (
                          <button
                            key={layer.id}
                            onClick={() => {
                              setActiveLayer(layer.id);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-[10px] sm:text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white font-bold'
                                : 'text-indigo-200/90 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <span>{layer.name}</span>
                            {isSelected && (
                              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Custom overlays to cover Windy.com branding logo & promotional URL */}
          <div className="absolute top-[3px] left-1/2 -translate-x-1/2 z-40 px-2.5 py-1 sm:px-4 sm:py-2 rounded-full bg-slate-950/90 border border-white/10 backdrop-blur-md shadow-lg text-[8px] sm:text-[9px] font-bold uppercase tracking-wider sm:tracking-widest text-indigo-300 select-none pointer-events-none whitespace-nowrap">
            Satellite Telemetry
          </div>

          <div className="absolute bottom-[13px] right-3 z-30 w-[280px] sm:w-[320px] py-1.5 rounded-xl bg-slate-950/90 border border-white/10 backdrop-blur-md shadow-lg text-[9px] font-bold uppercase tracking-wider text-slate-200 select-none pointer-events-none flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Sync Feed: {cityName}
          </div>



          {/* Windy Map Iframe */}
          <iframe
            src={windyUrl}
            title={`Windy weather map overlay: ${activeLayer}`}
            className="w-full h-full border-none rounded-3xl"
            onLoad={() => setIframeLoaded(true)}
            allowFullScreen
          />
        </div>

        {/* Bottom Dashboard Panel: Horizontal Grid below the map */}
        {!isFullscreen && (
          <div className="w-full glass-card rounded-3xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Column 1: Core Weather Stats */}
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{cityName}</h3>
                  <p className="text-xs text-indigo-200/90 font-semibold capitalize mt-0.5">{description || condition}</p>
                </div>
                <div className="text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 p-2.5 rounded-2xl shadow-inner shrink-0">
                  <WeatherIcon condition={condition} className="w-10 h-10" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {temp !== undefined && (
                  <div className="bg-slate-950/40 border border-white/10 rounded-2xl p-3 shadow-inner">
                    <div className="text-indigo-200/90 text-[10px] uppercase font-bold tracking-wider">Temp</div>
                    <div className="text-lg font-extrabold text-white mt-0.5">{Math.round(temp)}°C</div>
                    <div className="text-[10px] text-indigo-100/70 font-semibold">Feels: {Math.round(feelsLike || temp)}°C</div>
                  </div>
                )}

                {windSpeed !== undefined && (
                  <div className="bg-slate-950/40 border border-white/10 rounded-2xl p-3 shadow-inner">
                    <div className="text-indigo-200/90 text-[10px] uppercase font-bold tracking-wider">
                      Wind
                    </div>
                    <div className="text-lg font-extrabold text-white mt-0.5">{windSpeed} m/s</div>
                    {windDeg !== undefined && (
                      <div className="text-[10px] text-indigo-100/70 font-semibold">
                        Dir: {windDeg}°
                      </div>
                    )}
                  </div>
                )}

                {humidity !== undefined && (
                  <div className="bg-slate-950/40 border border-white/10 rounded-2xl p-3 shadow-inner">
                    <div className="text-indigo-200/90 text-[10px] uppercase font-bold tracking-wider">
                      Humidity
                    </div>
                    <div className="text-lg font-extrabold text-white mt-0.5">{humidity}%</div>
                  </div>
                )}

                {pressure !== undefined && (
                  <div className="bg-slate-950/40 border border-white/10 rounded-2xl p-3 shadow-inner">
                    <div className="text-indigo-200/90 text-[10px] uppercase font-bold tracking-wider">
                      Pressure
                    </div>
                    <div className="text-lg font-extrabold text-white mt-0.5">{pressure} hPa</div>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: AQI Index Widget & Active Layer Descriptions */}
            <div className="space-y-5">
              {airPollution?.aqi !== undefined ? (
                <div className="bg-slate-950/40 border border-white/10 rounded-2xl p-3.5 shadow-inner">
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-300 text-xs uppercase font-extrabold tracking-wider">
                      Air Quality
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${aqiInfo.color}`}>
                      {aqiInfo.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-4 text-center font-mono">
                    <div>
                      <div className="text-slate-300 text-[10px] sm:text-xs uppercase font-bold tracking-wider">PM2.5</div>
                      <div className="text-sm sm:text-base font-extrabold text-white mt-1">{airPollution.pm25}</div>
                    </div>
                    <div>
                      <div className="text-slate-300 text-[10px] sm:text-xs uppercase font-bold tracking-wider">PM10</div>
                      <div className="text-sm sm:text-base font-extrabold text-white mt-1">{airPollution.pm10}</div>
                    </div>
                    <div>
                      <div className="text-slate-300 text-[10px] sm:text-xs uppercase font-bold tracking-wider">NO2</div>
                      <div className="text-sm sm:text-base font-extrabold text-white mt-1">{airPollution.no2}</div>
                    </div>
                    <div>
                      <div className="text-slate-300 text-[10px] sm:text-xs uppercase font-bold tracking-wider">O3</div>
                      <div className="text-sm sm:text-base font-extrabold text-white mt-1">{airPollution.o3}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/40 border border-white/10 rounded-2xl p-3.5 shadow-inner flex items-center justify-center text-xs text-indigo-200/70 font-semibold h-[92px]">
                  AQI Telemetry Offline
                </div>
              )}

              <div className="bg-slate-950/40 border border-white/10 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <h4 className="text-[11px] font-bold text-white uppercase tracking-wide">
                    Layer Insight
                  </h4>
                </div>
                <p className="text-xs text-white/95 leading-relaxed font-medium">
                  {LAYER_DESCRIPTIONS[activeLayer]}
                </p>
              </div>
            </div>

            {/* Column 3: Interactive Guide Tips */}
            <div className="bg-slate-950/40 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="text-indigo-200/90 text-[10px] uppercase font-bold tracking-wider border-b border-white/10 pb-2 mb-3">
                  Interactive Controls
                </div>
                <ul className="text-xs text-white/90 space-y-2.5 pl-1 leading-relaxed font-medium">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5">●</span>
                    <span>Scroll or pinch to zoom. Left-click & drag to pan the globe.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5">●</span>
                    <span>Use the timeline animation at the bottom of the map to play forecast trends.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5">●</span>
                    <span>Click directly on the map to query weather details for other surrounding locations.</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
          </div>
        )}
      </div>
    </div>
  );
}
