'use client';

import { useState, useEffect } from 'react';
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
        border: 2px solid rgba(56, 189, 248, 0.7);
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
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
      { color: 'rgba(255, 255, 255, 0.3)', label: 'Scattered Clouds (20% - 50%)' },
      { color: 'rgba(255, 255, 255, 0.7)', label: 'Overcast Sky (> 80%)' },
    ],
  },
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
  const [activeLayer, setActiveLayer] = useState('precipitation_new');

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

  return (
    <div className="w-full space-y-6 text-left">
      
      {/* Layer Selection Section */}
      <div>
        <h2 className="text-xs text-sky-300 uppercase tracking-widest font-bold mb-4">
          Select Radar Overlay
        </h2>

        {/* 4 Layer Toggle Buttons Styled Like About Page (No Icons) */}
        <div className="grid grid-cols-2 sm:flex items-center gap-3 w-full">
          {LAYERS.map((layer) => {
            const isActive = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`flex items-center justify-center px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors border ${
                  isActive
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-900/30'
                    : 'bg-white/5 border-white/10 text-sky-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{layer.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map Container Frame */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
        }}
        className="rounded-2xl overflow-hidden relative w-full h-[420px] sm:h-[550px] lg:h-[620px] shadow-2xl"
      >
        <MapContainer
          center={centerPosition}
          zoom={8}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', background: '#0f172a' }}
        >
          <ChangeMapView center={centerPosition} zoom={8} />

          {/* OpenStreetMap Dark Base Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Single Weather Layer Overlay via Next.js Proxy */}
          <TileLayer
            key={activeLayer}
            url={`/api/weather/tile?layer=${activeLayer}&z={z}&x={x}&y={y}`}
            opacity={0.7}
            maxZoom={18}
          />

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

        {/* Dynamic Legend Card Overlay */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
          className="absolute bottom-4 right-4 z-[1000] p-3.5 rounded-xl shadow-2xl max-w-xs text-white space-y-2 text-xs"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5 gap-2">
            <span className="font-semibold text-sky-300">
              {activeLayerConfig.name} Scale
            </span>
          </div>
          <p className="text-[11px] text-slate-300">{activeLayerConfig.description}</p>

          <div className="space-y-1.5 pt-1">
            {activeLayerConfig.legend.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span
                  style={{ background: item.color }}
                  className="w-3.5 h-3.5 rounded-md border border-white/30 shrink-0 shadow-sm"
                />
                <span className="text-[11px] text-slate-200">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
