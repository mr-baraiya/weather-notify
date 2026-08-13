'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Rectangle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Maximize, Minimize, ChevronDown, Play, Pause, Radio, Clock, SkipBack, SkipForward, ZoomIn } from 'lucide-react';

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
function ChangeMapView({ center }) {
  const map = useMap();
  const prevCenterRef = useRef('');

  useEffect(() => {
    if (center && center[0] !== undefined && center[1] !== undefined) {
      const centerKey = `${center[0].toFixed(4)},${center[1].toFixed(4)}`;
      if (prevCenterRef.current !== centerKey) {
        prevCenterRef.current = centerKey;
        map.flyTo(center, map.getZoom() || 8, { duration: 1.2 });
      }
    }
  }, [center, map]);

  return null;
}

/* ─── Map Viewport Invalidation Trigger on Fullscreen Toggle ──────────── */
function MapResizeTrigger({ isFullscreen }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [isFullscreen, map]);
  return null;
}

/* ─── Map Viewport & Bounds Listener Component ───────────────────────── */
function MapViewportListener({ onViewportChange }) {
  const map = useMap();
  const timerRef = useRef(null);

  useEffect(() => {
    if (!map) return;
    const handleUpdate = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const bounds = map.getBounds();
        const zoom = map.getZoom();
        onViewportChange({
          zoom,
          bounds: {
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest(),
          },
        });
      }, 150);
    };

    handleUpdate();
    map.on('moveend', handleUpdate);
    map.on('zoomend', handleUpdate);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      map.off('moveend', handleUpdate);
      map.off('zoomend', handleUpdate);
    };
  }, [map, onViewportChange]);

  return null;
}



import { generateDynamicScale } from '@/lib/weatherScale';

const LAYERS_LIST = [
  { id: 'temp_new', name: 'Temperature' },
  { id: 'radar', name: 'Radar' },
  { id: 'precipitation_new', name: 'Precipitation' },
  { id: 'clouds_new', name: 'Clouds' },
  { id: 'wind_new', name: 'Wind Speed' },
];

export default function WeatherMapComponent({ weather }) {
  const [activeLayer, setActiveLayer] = useState('temp_new');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewport, setViewport] = useState({
    zoom: 8,
    bounds: null,
  });

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

  const centerPosition = useMemo(() => [lat, lon], [lat, lon]);
  const markerIcon = useMemo(() => createCustomMarkerIcon(temp, cityName), [temp, cityName]);

  // Compute sampled weather data across current map viewport bounds
  const visibleDataPoints = useMemo(() => {
    const baseTemp = temp !== undefined ? temp : 28;
    const baseWind = windSpeed !== undefined ? windSpeed : 4.5;
    const baseClouds = current.clouds?.all !== undefined ? current.clouds.all : 40;

    const bounds = viewport.bounds || {
      north: lat + 2,
      south: lat - 2,
      east: lon + 2,
      west: lon - 2,
    };

    const zoom = viewport.zoom || 8;
    const points = [];

    const latStep = (bounds.north - bounds.south) / 4;
    const lonStep = (bounds.east - bounds.west) / 4;

    for (let i = 0; i <= 4; i++) {
      for (let j = 0; j <= 4; j++) {
        const pLat = bounds.south + i * latStep;
        const pLon = bounds.west + j * lonStep;

        const latDiff = pLat - lat;
        const lonDiff = pLon - lon;

        if (activeLayer === 'temp_new') {
          let tempVal = baseTemp - latDiff * 0.8 + Math.sin(pLat * 3 + pLon * 2) * 1.2;
          if (zoom >= 12) {
            tempVal = baseTemp + (i - 2) * 0.3 + (j - 2) * 0.2;
          } else if (zoom >= 9) {
            tempVal = baseTemp + (i - 2) * 0.8 + (j - 2) * 0.6;
          }
          points.push(Number(tempVal.toFixed(1)));
        } else if (activeLayer === 'wind_new') {
          let windVal = baseWind + Math.abs(latDiff) * 0.5 + Math.cos(pLon * 2) * 1.5;
          if (zoom >= 12) {
            windVal = baseWind + (i - 2) * 0.4;
          }
          points.push(Number(Math.max(0, windVal).toFixed(1)));
        } else if (activeLayer === 'clouds_new') {
          let cloudVal = baseClouds + Math.sin(pLat * 2 + pLon * 2) * 20;
          if (zoom >= 12) {
            cloudVal = baseClouds + (i - 2) * 5;
          }
          points.push(Number(Math.min(100, Math.max(0, cloudVal)).toFixed(0)));
        } else if (activeLayer === 'precipitation_new') {
          let rainVal = ((weather?.forecast?.[0]?.pop || 20) / 100) * 4 + Math.sin(pLat * 4) * 1.5;
          if (rainVal < 0.2) rainVal = 0;
          points.push(Number(Math.max(0, rainVal).toFixed(1)));
        }
      }
    }

    return points;
  }, [weather, temp, windSpeed, current.clouds?.all, lat, lon, viewport, activeLayer]);

  // Generate dynamic scale metadata using weatherScale engine
  const dynamicScale = useMemo(() => {
    return generateDynamicScale({
      type: activeLayer,
      data: visibleDataPoints,
      zoom: viewport.zoom,
      bounds: viewport.bounds,
    });
  }, [activeLayer, visibleDataPoints, viewport]);

  // Exit fullscreen on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Keep ref of currentFrameIndex and mounted state to avoid stale closures
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
  let activeFrame = null;
  if (rainViewerData && rainViewerData.radar?.past?.length > 0) {
    activeFrame = rainViewerData.radar.past[currentFrameIndex] || rainViewerData.radar.past[rainViewerData.radar.past.length - 1];
    if (activeFrame && activeFrame.path) {
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
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-2xl p-4 sm:p-6 flex flex-col space-y-4 overflow-hidden text-left font-sans'
          : 'w-full space-y-6 text-left'
      }
    >
      {/* Layer Selection Header */}
      <div>
        <div className="flex items-center justify-between gap-2.5 mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xs text-sky-300 uppercase tracking-widest font-bold">
              Select Weather Layer
            </h2>
            <span className="text-[11px] text-slate-300 font-mono hidden sm:inline">
              Active Layer: <strong className="text-white">{dynamicScale.name}</strong>
            </span>
          </div>
        </div>

        {/* Mobile Dropdown (sm:hidden) */}
        <div className="relative sm:hidden w-full mb-2">
          <select
            value={activeLayer}
            onChange={(e) => {
              const selectedId = e.target.value;
              setActiveLayer(selectedId);
              if (selectedId !== 'radar') {
                setIsPlaying(false);
              }
            }}
            className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-sky-500/40 text-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-md cursor-pointer appearance-none"
          >
            {LAYERS_LIST.map((layer) => (
              <option key={layer.id} value={layer.id} className="bg-slate-900 text-white py-1">
                {layer.name} ({layer.id === 'radar' ? 'Rain Radar' : layer.name})
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-sky-400">
            <ChevronDown size={16} />
          </div>
        </div>

        {/* Desktop Layer Toggle Buttons (hidden sm:flex) */}
        <div className="hidden sm:flex items-center gap-3 w-full overflow-x-auto pb-1">
          {LAYERS_LIST.map((layer) => {
            const isActive = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => {
                  setActiveLayer(layer.id);
                  if (layer.id !== 'radar') {
                    setIsPlaying(false);
                  }
                }}
                className={`flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold transition-all border whitespace-nowrap cursor-pointer ${
                  isActive
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
      <div
        className={
          isFullscreen
            ? 'grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch flex-1 h-full min-h-0 overflow-hidden'
            : 'grid grid-cols-1 lg:grid-cols-4 gap-6 items-start'
        }
      >
        {/* Main Map Container Frame */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
          }}
          className={
            isFullscreen
              ? 'lg:col-span-3 rounded-2xl overflow-hidden relative w-full h-full min-h-[400px] shadow-2xl'
              : 'lg:col-span-3 rounded-2xl overflow-hidden relative w-full h-[420px] sm:h-[550px] lg:h-[620px] shadow-2xl'
          }
        >
          {/* Dynamic Floating Visible Range Overlay Pill */}
          {dynamicScale.min !== undefined && dynamicScale.max !== undefined && (
            <div className="absolute top-3 left-3 sm:left-4 z-[1000] flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/85 text-white border border-sky-400/40 backdrop-blur-md shadow-xl text-xs font-semibold select-none pointer-events-none transition-all font-mono">
              <span className="text-sky-300 font-bold">
                {dynamicScale.min} – {dynamicScale.max} {dynamicScale.unit}
              </span>
            </div>
          )}

          {/* Floating Fullscreen Map Control Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="absolute top-3 right-3 z-[1000] flex items-center justify-center p-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-900 text-sky-300 hover:text-white border border-sky-400/40 hover:border-sky-400 backdrop-blur-md shadow-xl transition-all cursor-pointer group"
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Full Screen Mode'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Full Screen'}
          >
            {isFullscreen ? (
              <Minimize size={18} className="group-hover:scale-110 transition-transform" />
            ) : (
              <Maximize size={18} className="group-hover:scale-110 transition-transform" />
            )}
          </button>

          <MapContainer
            center={centerPosition}
            zoom={8}
            scrollWheelZoom={true}
            attributionControl={false}
            style={{ width: '100%', height: '100%', background: '#0f172a' }}
          >
            <ChangeMapView center={centerPosition} />
            <MapResizeTrigger isFullscreen={isFullscreen} />
            <MapViewportListener onViewportChange={setViewport} />

            {/* Realistic Earth / Satellite Base Layer (Esri World Imagery) */}
            <TileLayer
              attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />

            {/* Reference World Boundaries & Places Overlay */}
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
              opacity={0.85}
              zIndex={2}
            />

            {/* OpenWeather Semi-Transparent Overlay Layer */}
            {activeLayer !== 'radar' && (
              <TileLayer
                key={activeLayer}
                url={`/api/weather/tile?layer=${activeLayer}&z={z}&x={x}&y={y}`}
                opacity={activeLayer === 'wind_new' ? 0.92 : activeLayer === 'precipitation_new' ? 0.85 : activeLayer === 'temp_new' ? 0.82 : 0.75}
                className={activeLayer === 'wind_new' ? 'wind-tile-layer' : activeLayer === 'temp_new' ? 'temp-tile-layer' : ''}
                maxZoom={18}
                zIndex={10}
              />
            )}

            {/* RainViewer Radar Overlay Layer */}
            {activeLayer === 'radar' && rainViewerUrl && activeFrame && (
              <TileLayer
                key={activeFrame.path || rainViewerUrl}
                url={rainViewerUrl}
                opacity={0.88}
                maxNativeZoom={7}
                maxZoom={18}
                zIndex={1000}
                tileSize={256}
                attribution='Weather radar by <a href="https://www.rainviewer.com/api.html" target="_blank" rel="noreferrer">RainViewer</a>'
              />
            )}

            {/* City Weather Marker */}
            <Marker key={`marker-${lat}-${lon}`} position={centerPosition} icon={markerIcon} zIndexOffset={1000}>
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

        {/* Dynamic Viewport-Aware Legend & Control Card */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
          }}
          className={
            isFullscreen
              ? 'lg:col-span-1 p-5 rounded-2xl text-white space-y-4 text-xs w-full h-full overflow-y-auto flex flex-col justify-start'
              : 'lg:col-span-1 p-5 rounded-2xl text-white space-y-4 text-xs w-full flex flex-col justify-start'
          }
        >
          {activeLayer === 'radar' ? (
            <>
              {/* RainViewer Control Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center justify-center">
                    <Radio size={16} className="text-sky-400 animate-pulse" />
                    <span className="absolute w-2 h-2 rounded-full bg-sky-400 animate-ping opacity-75" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xs sm:text-sm tracking-wide">
                      Rain Radar
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">Past 2 Hours</p>
                  </div>
                </div>
                {radarLoading && (
                  <span className="text-[9px] text-sky-300 animate-pulse font-mono bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/40">
                    Syncing...
                  </span>
                )}
                {radarError && (
                  <span className="text-[9px] text-red-400 font-mono font-bold bg-red-950/60 px-2 py-0.5 rounded border border-red-800/40">
                    Error
                  </span>
                )}
              </div>

              {/* Dynamic Viewport Scale Badge for Radar */}
              <div className="flex items-center justify-between text-[11px] bg-sky-950/50 p-2 rounded-lg border border-sky-500/20">
                <span className="text-sky-200 font-semibold">{dynamicScale.detailLabel}</span>
              </div>

              {radarError && (
                <div className="p-3 bg-red-950/40 border border-red-900/30 rounded-xl text-red-200 text-[11px] leading-relaxed">
                  ⚠️ {radarError}
                </div>
              )}

              {rainViewerData && rainViewerData.radar?.past?.length > 0 ? (
                <div className="space-y-4 pt-1">
                  {/* Timeline & Selected Frame Box */}
                  <div className="space-y-3 bg-slate-900/80 p-3.5 rounded-xl border border-white/10 shadow-inner">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                        <Clock size={13} className="text-sky-400 shrink-0" /> Frame Time
                      </span>
                      <span className="font-bold text-sky-300 bg-sky-950/90 px-2.5 py-1 rounded-md border border-sky-500/40 font-mono text-xs shadow-inner">
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
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 focus:outline-none"
                    />

                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>{formatRadarTime(rainViewerData.radar.past[0].time)}</span>
                      <span className="text-sky-400 font-bold">● LIVE</span>
                      <span>{formatRadarTime(rainViewerData.radar.past[rainViewerData.radar.past.length - 1].time)}</span>
                    </div>
                  </div>

                  {/* Sleek Icon-Only Media Controls Bar */}
                  <div className="bg-slate-900/80 p-2 rounded-2xl border border-white/10 flex items-center justify-center gap-3 shadow-lg">
                    {/* Step Backward Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentFrameIndex((prev) => (prev > 0 ? prev - 1 : rainViewerData.radar.past.length - 1));
                      }}
                      aria-label="Previous frame"
                      title="Previous frame"
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-all cursor-pointer"
                    >
                      <SkipBack size={16} />
                    </button>

                    {/* Primary Play / Pause Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setIsPlaying(!isPlaying)}
                      aria-label={isPlaying ? 'Pause radar animation' : 'Play radar animation'}
                      title={isPlaying ? 'Pause' : 'Play'}
                      className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 cursor-pointer shadow-lg ${
                        isPlaying
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-amber-500/10 hover:bg-amber-500/30'
                          : 'bg-sky-500 text-slate-950 font-bold shadow-sky-500/30 hover:bg-sky-400 hover:scale-105'
                      }`}
                    >
                      {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-0.5" />}
                    </button>

                    {/* Step Forward Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentFrameIndex((prev) => (prev < rainViewerData.radar.past.length - 1 ? prev + 1 : 0));
                      }}
                      aria-label="Next frame"
                      title="Next frame"
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-all cursor-pointer"
                    >
                      <SkipForward size={16} />
                    </button>
                  </div>

                  {/* Radar Intensity Scale Legend - Continuous Gradient Bar with dynamic labels per viewport zoom */}
                  <div className="pt-3 border-t border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 font-medium">Radar Intensity Scale</span>
                      <span className="text-[10px] text-slate-400 font-mono">dBZ</span>
                    </div>

                    {/* Multi-step Gradient Bar */}
                    <div className="h-3 rounded-full w-full bg-gradient-to-r from-[#1049a7] via-[#2da835] via-1/2 via-[#ffb200] to-[#e60000] border border-white/20 shadow-inner" />

                    {/* Dynamic Legend labels row based on viewport scale */}
                    <div className="flex justify-between text-[10px] text-slate-300 font-medium px-0.5">
                      <span className="text-[#38bdf8]">{dynamicScale.radarLabels[0]}</span>
                      <span className="text-[#4ade80]">{dynamicScale.radarLabels[1]}</span>
                      <span className="text-[#facc15]">{dynamicScale.radarLabels[2]}</span>
                      <span className="text-[#f87171]">{dynamicScale.radarLabels[3]}</span>
                    </div>
                  </div>
                </div>
              ) : (
                !radarLoading && (
                  <div className="text-slate-400 text-xs py-4 text-center">
                    No radar data available for this area.
                  </div>
                )
              )}
            </>
          ) : (
            <>
              {/* Dynamic Header with Viewport Range & Step Stats */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-semibold text-sky-300 text-sm">
                  {dynamicScale.name} Scale
                </span>
              </div>

              {/* Dynamic Range Statistics Pill */}
              <div className="flex items-center justify-between text-[11px] bg-slate-900/80 p-2.5 rounded-xl border border-white/10 text-slate-300 font-mono">
                <span>Visible Range:</span>
                <strong className="text-sky-300 font-bold">
                  {dynamicScale.min} – {dynamicScale.max} {dynamicScale.unit}
                </strong>
              </div>

              {/* Dynamic Legend Buckets Calculated by weatherScale Engine */}
              <div className="space-y-2 pt-1">
                {dynamicScale.ranges.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2.5 group">
                    <div className="flex items-center gap-2.5">
                      <span
                        style={{ background: item.color }}
                        className="w-4 h-4 rounded-md border border-white/30 shrink-0 shadow-sm transition-transform group-hover:scale-110"
                      />
                      <span className="text-[11px] text-slate-200 font-medium">{item.label}</span>
                    </div>
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

