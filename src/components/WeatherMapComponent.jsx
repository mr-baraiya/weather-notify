'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/* ─── Custom Leaflet Marker Icon ──────────────────────────────────────── */
const createCustomMarkerIcon = (temp, city) => {
  return L.divIcon({
    className: 'custom-weather-marker',
    html: `
      <div style="
        background: rgba(15, 23, 42, 0.92);
        backdrop-filter: blur(12px);
        border: 2px solid rgba(56, 189, 248, 0.8);
        box-shadow: 0 10px 25px rgba(0,0,0,0.6);
        color: #ffffff;
        padding: 6px 12px;
        border-radius: 12px;
        font-family: system-ui, sans-serif;
        font-size: 12px;
        font-weight: 700;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 6px;
        transform: translate(-50%, -100%);
      ">
        <span style="
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #38bdf8;
          display: inline-block;
          box-shadow: 0 0 8px #38bdf8;
        "></span>
        <span>${city || 'Location'}: ${temp !== undefined ? Math.round(temp) + '°C' : ''}</span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

/* ─── Map Recenter Helper Component ───────────────────────────────────── */
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

/* ─── Layer Definitions & Legends ─────────────────────────────────────── */
const LAYERS = [
  {
    id: 'temp_new',
    name: 'Temperature',
    description: 'Thermal heat map distribution from freezing to extreme heat.',
    legend: [
      { color: '#2b83ba', label: 'Cool (< 15°C)' },
      { color: '#abdda4', label: 'Mild (15°C - 25°C)' },
      { color: '#fdae61', label: 'Warm (25°C - 35°C)' },
      { color: '#d7191c', label: 'Extreme Heat (> 35°C)' },
    ],
  },
  {
    id: 'precipitation_new',
    name: 'Rain / Precip',
    description: 'Displays real-time rainfall & precipitation density across the map.',
    legend: [
      { color: '#8856a7', label: 'Light Drizzle (< 0.5 mm/h)' },
      { color: '#2b8cbe', label: 'Moderate Rain (1 - 5 mm/h)' },
      { color: '#e34a33', label: 'Heavy Torrent (> 10 mm/h)' },
    ],
  },
  {
    id: 'clouds_new',
    name: 'Clouds',
    description: 'Satellite cloud cover density percentage.',
    legend: [
      { color: 'rgba(255, 255, 255, 0.4)', label: 'Scattered Clouds (20% - 50%)' },
      { color: 'rgba(255, 255, 255, 0.8)', label: 'Overcast Sky (> 80%)' },
    ],
  },
  {
    id: 'wind_new',
    name: 'Wind Speed',
    description: 'Surface wind velocity vector overlay.',
    legend: [
      { color: '#99d594', label: 'Gentle Breeze (< 5 m/s)' },
      { color: '#ffffbf', label: 'Moderate Wind (5 - 15 m/s)' },
      { color: '#fc8d59', label: 'Strong Gale (> 15 m/s)' },
    ],
  },
];

export default function WeatherMapComponent({ weather }) {
  const [activeLayer, setActiveLayer] = useState('temp_new');

  // RainViewer radar overlay state
  const [rainViewerData, setRainViewerData] = useState(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [radarLoading, setRadarLoading] = useState(false);
  const [radarError, setRadarError] = useState(null);

  const current = weather?.current || {};
  const lat = current.coord?.lat || 22.3039;
  const lon = current.coord?.lon || 70.8022;
  const cityName = current.name || 'Rajkot';
  const temp = current.main?.temp;
  const humidity = current.main?.humidity;
  const windSpeed = current.wind?.speed;
  const condition = current.weather?.[0]?.main || '';
  const description = current.weather?.[0]?.description || '';

  const centerPosition = [lat, lon];
  const activeLayerConfig = LAYERS.find((l) => l.id === activeLayer) || LAYERS[0];
  const markerIcon = createCustomMarkerIcon(temp, cityName);

  // Keep ref of currentFrameIndex and mounted state to avoid stale closures and leak warnings
  const currentFrameIndexRef = useRef(currentFrameIndex);
  useEffect(() => {
    currentFrameIndexRef.current = currentFrameIndex;
  }, [currentFrameIndex]);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch RainViewer metadata dynamically
  const fetchRainViewerData = async (preserveSelectedFrame = false) => {
    if (isMountedRef.current) setRadarLoading(true);
    try {
      const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      if (!data || !data.radar || !data.radar.past || data.radar.past.length === 0) {
        throw new Error('No radar data found');
      }

      if (isMountedRef.current) {
        setRainViewerData((prevData) => {
          let nextIndex = data.radar.past.length - 1;
          const currentIdx = currentFrameIndexRef.current;

          if (preserveSelectedFrame && prevData?.radar?.past?.length) {
            const prevSelectedFrame = prevData.radar.past[currentIdx];
            if (prevSelectedFrame) {
              const prevTime = prevSelectedFrame.time;
              const wasViewingLatest = currentIdx === prevData.radar.past.length - 1;

              if (wasViewingLatest) {
                nextIndex = data.radar.past.length - 1;
              } else {
                const matchingIndex = data.radar.past.findIndex((f) => f.time === prevTime);
                if (matchingIndex !== -1) {
                  nextIndex = matchingIndex;
                } else {
                  nextIndex = Math.min(currentIdx, data.radar.past.length - 1);
                }
              }
            }
          }

          setTimeout(() => {
            if (isMountedRef.current) setCurrentFrameIndex(nextIndex);
          }, 0);
          setRadarError(null);
          return data;
        });
      }
    } catch (err) {
      console.error('Failed to load RainViewer radar data:', err);
      if (isMountedRef.current) setRadarError('Unable to load radar data');
    } finally {
      if (isMountedRef.current) setRadarLoading(false);
    }
  };

  // Load RainViewer metadata on mount and set up 10-minute refresh interval
  useEffect(() => {
    fetchRainViewerData(false);

    const refreshInterval = setInterval(() => {
      fetchRainViewerData(true);
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  // Client-only 1s animation loop
  useEffect(() => {
    let animInterval = null;
    if (isPlaying && rainViewerData?.radar?.past?.length > 0) {
      animInterval = setInterval(() => {
        setCurrentFrameIndex((prevIndex) => {
          return (prevIndex + 1) % rainViewerData.radar.past.length;
        });
      }, 1000); // 1 second interval
    }
    return () => {
      if (animInterval) clearInterval(animInterval);
    };
  }, [isPlaying, rainViewerData]);

  // Construct RainViewer overlay tile URL
  let rainViewerUrl = '';
  if (rainViewerData && rainViewerData.radar?.past?.length > 0) {
    const activeFrame = rainViewerData.radar.past[currentFrameIndex];
    if (activeFrame) {
      rainViewerUrl = `${rainViewerData.host}${activeFrame.path}/256/{z}/{x}/{y}/2/1_1.png`;
    }
  }

  // Format timestamp helper
  const formatRadarTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full space-y-6 text-left">

      {/* Layer Selection Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h2 className="text-xs text-sky-300 uppercase tracking-widest font-bold">
            Select Radar Overlay
          </h2>
          <span className="text-[11px] text-slate-300 font-mono">
            Active Layer: <strong className="text-white">{activeLayerConfig.name}</strong>
          </span>
        </div>

        {/* 4 Layer Toggle Buttons Styled Like About Page */}
        <div className="grid grid-cols-2 sm:flex items-center gap-3 w-full">
          {LAYERS.map((layer) => {
            const isActive = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => {
                  setActiveLayer(layer.id);
                  if (layer.id !== 'precipitation_new') {
                    setIsPlaying(false);
                  }
                }}
                className={`flex items-center justify-center px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors border ${isActive
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-900/30 font-bold'
                    : 'bg-white/5 border-white/10 text-sky-200 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <span>{layer.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map & Legend Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Main Map Container Frame */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
          }}
          className="lg:col-span-3 rounded-2xl overflow-hidden relative w-full h-[420px] sm:h-[550px] lg:h-[620px] shadow-2xl"
        >
          <MapContainer
            center={centerPosition}
            zoom={8}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%', background: '#0f172a' }}
          >
            <ChangeMapView center={centerPosition} zoom={8} />

            {/* CartoDB High-Contrast Dark Map Base Layer */}
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {/* OpenWeather Overlay Layer with High Contrast Z-Index */}
            {activeLayer !== 'precipitation_new' && (
              <TileLayer
                key={activeLayer}
                url={`/api/weather/tile?layer=${activeLayer}&z={z}&x={x}&y={y}`}
                opacity={0.85}
                maxZoom={18}
                zIndex={10}
              />
            )}

            {/* RainViewer Radar Overlay Layer */}
            {activeLayer === 'precipitation_new' && rainViewerUrl && (
              <TileLayer
                key={rainViewerUrl}
                url={rainViewerUrl}
                opacity={0.65}
                maxZoom={7}
                zIndex={10}
                attribution='Weather radar by <a href="https://www.rainviewer.com/api.html" target="_blank" rel="noreferrer">RainViewer</a>'
              />
            )}

            {/* City Weather Marker */}
            <Marker position={centerPosition} icon={markerIcon}>
              <Popup className="weather-popup">
                <div className="p-2 text-slate-900 space-y-1 font-sans">
                  <h4 className="font-bold text-sm border-b pb-1 text-slate-900">{cityName}</h4>
                  <p className="text-xs font-semibold text-sky-700">
                    {temp !== undefined ? `${Math.round(temp)}°C` : 'N/A'} — <span className="capitalize">{description || condition}</span>
                  </p>
                  {humidity !== undefined && (
                    <p className="text-[11px] text-slate-600">Humidity: {humidity}%</p>
                  )}
                  {windSpeed !== undefined && (
                    <p className="text-[11px] text-slate-600">Wind: {windSpeed} m/s</p>
                  )}
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* Dynamic Legend Card Outside Overlay */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
          }}
          className="lg:col-span-1 p-5 rounded-2xl text-white space-y-3.5 text-xs w-full flex flex-col justify-start"
        >
          {activeLayer === 'precipitation_new' ? (
            <>
              {/* RainViewer Control Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2 gap-2">
                <span className="font-semibold text-sky-300 text-sm">
                  Rain Radar (Recent/Past Data)
                </span>
                {radarLoading && (
                  <span className="text-[9px] text-sky-300 animate-pulse font-mono">
                    Loading...
                  </span>
                )}
                {radarError && (
                  <span className="text-[9px] text-red-400 font-mono font-bold">
                    Error
                  </span>
                )}
              </div>

              {radarError && (
                <div className="p-3 bg-red-950/40 border border-red-900/30 rounded-xl text-red-200 text-[11px] leading-relaxed">
                  ⚠️ {radarError}
                </div>
              )}

              {rainViewerData && rainViewerData.radar?.past?.length > 0 ? (
                <div className="space-y-4">
                  {/* Slider & Timeline Index */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300">Selected Frame:</span>
                      <span className="font-bold text-sky-400 bg-sky-950/50 px-2 py-0.5 rounded border border-sky-800/30 font-mono">
                        {formatRadarTime(rainViewerData.radar.past[currentFrameIndex].time)}
                      </span>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={rainViewerData.radar.past.length - 1}
                      value={currentFrameIndex}
                      onChange={(e) => {
                        setIsPlaying(false);
                        setCurrentFrameIndex(Number(e.target.value));
                      }}
                      className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-sky-400 focus:outline-none"
                    />

                    <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                      <span>{formatRadarTime(rainViewerData.radar.past[0].time)}</span>
                      <span>{formatRadarTime(rainViewerData.radar.past[Math.floor(rainViewerData.radar.past.length / 2)].time)}</span>
                      <span>{formatRadarTime(rainViewerData.radar.past[rainViewerData.radar.past.length - 1].time)} (Latest)</span>
                    </div>
                  </div>

                  {/* Play & Pause Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlaying(true)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all border ${
                        isPlaying
                          ? 'bg-sky-500/20 border-sky-400/40 text-sky-300 font-bold shadow-sm'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span>▶ Play</span>
                    </button>
                    <button
                      onClick={() => setIsPlaying(false)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all border ${
                        !isPlaying
                          ? 'bg-sky-500/20 border-sky-400/40 text-sky-300 font-bold shadow-sm'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span>⏸ Pause</span>
                    </button>
                  </div>

                  {/* Time sequence view */}
                  <div className="flex justify-center items-center gap-1.5 text-[10px] text-slate-400 pt-1 font-mono border-t border-white/5 pt-2">
                    {(() => {
                      const len = rainViewerData.radar.past.length;
                      const idx1 = 0;
                      const idx2 = Math.floor(len / 2);
                      const idx3 = len - 1;

                      const active1 = currentFrameIndex === idx1 ? 'text-sky-300 font-bold underline decoration-sky-400 decoration-2' : '';
                      const active2 = currentFrameIndex === idx2 ? 'text-sky-300 font-bold underline decoration-sky-400 decoration-2' : '';
                      const active3 = currentFrameIndex === idx3 ? 'text-sky-300 font-bold underline decoration-sky-400 decoration-2' : '';

                      return (
                        <>
                          <span className={active1}>{formatRadarTime(rainViewerData.radar.past[idx1].time)}</span>
                          <span>←</span>
                          <span className={active2}>{formatRadarTime(rainViewerData.radar.past[idx2].time)}</span>
                          <span>←</span>
                          <span className={active3}>{formatRadarTime(rainViewerData.radar.past[idx3].time)}</span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                !radarLoading && (
                  <div className="text-slate-400 text-xs py-4 text-center">
                    No radar data available.
                  </div>
                )
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-semibold text-sky-300 text-sm">
                  {activeLayerConfig.name} Scale
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">{activeLayerConfig.description}</p>

              <div className="space-y-2 pt-1.5">
                {activeLayerConfig.legend.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <span
                      style={{ background: item.color }}
                      className="w-4 h-4 rounded-md border border-white/30 shrink-0 shadow-sm"
                    />
                    <span className="text-[11px] text-slate-200">{item.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
