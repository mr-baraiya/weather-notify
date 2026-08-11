'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import Link from 'next/link';

/* ─── Dynamic Import for Client-Only Leaflet Component ──────────────── */
const WeatherMapComponent = dynamic(() => import('@/components/WeatherMapComponent'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
      }}
      className="rounded-2xl h-[500px] sm:h-[620px] w-full flex flex-col items-center justify-center text-white space-y-3 shadow-2xl"
    >
      <div className="w-6 h-6 border-2 border-sky-300 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-mono font-semibold text-sky-200 uppercase tracking-widest">Initializing Interactive Weather Radar...</p>
    </div>
  ),
});

const POPULAR_CITIES = ['Rajkot', 'Mumbai', 'Ahmedabad', 'London', 'Tokyo', 'New York'];

export default function WeatherMapPage() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [activeCity, setActiveCity] = useState('Rajkot');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchCityWeather = async (cityName) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await axios.get(`/api/weather?city=${encodeURIComponent(cityName)}`);
      if (res.data?.success && res.data.data) {
        setWeather(res.data.data);
        setActiveCity(res.data.data.current?.name || cityName);
      } else {
        setErrorMessage('City not found. Please try another name.');
      }
    } catch {
      setErrorMessage('Unable to fetch weather data for this city.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let canceled = false;

    const loadInitialWeather = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/weather?city=Rajkot');
        if (!canceled && res.data?.data) {
          setWeather(res.data.data);
          setActiveCity(res.data.data.current?.name || 'Rajkot');
          setLoading(false);
        }
      } catch (err) {
        console.error('Initial weather map fetch error:', err);
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            if (canceled) return;
            try {
              const localRes = await axios.get(
                `/api/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
              );
              if (!canceled && localRes.data?.data) {
                setWeather(localRes.data.data);
                setActiveCity(localRes.data.data.current?.name || 'Current Location');
              }
            } catch (err) {
              console.error('Location map weather error:', err);
            }
          },
          () => {},
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 300000 }
        );
      }
    };

    loadInitialWeather();
    return () => { canceled = true; };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    fetchCityWeather(searchInput.trim());
  };

  return (
    <div className="min-h-screen py-16 sm:py-24 px-4 text-white">
      <div className="max-w-4xl mx-auto">

        {/* Eyebrow */}
        <p className="text-xs text-sky-300 font-bold uppercase tracking-widest mb-5">Weather Map</p>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
          Interactive Weather Radar Map
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-sky-100/90 leading-relaxed mb-10 max-w-xl">
          Explore real-time rain radar, cloud density, temperature gradients, and wind velocity overlays centered on your selected location.
        </p>

        {/* City Search Form & Quick Focus */}
        <div className="space-y-4 mb-10 max-w-xl">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Center map on any city (e.g. Mumbai, London)..."
              className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/15 rounded-lg py-3 pl-4 pr-28 text-sm text-white placeholder-sky-200/70 focus:outline-none focus:ring-2 focus:ring-sky-400/40 backdrop-blur-xl transition-all shadow-md"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-md transition-colors shadow-md shadow-indigo-900/30"
            >
              {loading ? 'Locating...' : 'Go to City'}
            </button>
          </form>

          {errorMessage && (
            <p className="text-xs text-red-400 font-medium">{errorMessage}</p>
          )}

          {/* Quick Focus Pills */}
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-300 pt-1">
            <span className="text-sky-300 font-bold uppercase tracking-widest text-[11px]">
              Quick Focus:
            </span>
            {POPULAR_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => { setSearchInput(city); fetchCityWeather(city); }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
                  activeCity.toLowerCase() === city.toLowerCase()
                    ? 'bg-indigo-600 border-indigo-500 text-white font-semibold shadow-md'
                    : 'bg-white/5 border-white/10 text-sky-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-10" />

        {/* Main Interactive Weather Map Component */}
        <WeatherMapComponent weather={weather} />

        {/* Divider */}
        <div className="border-t border-white/10 mt-12 mb-10" />

        {/* Bottom CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <p className="text-sm text-sky-100/90">Want automated WhatsApp alerts for your city?</p>
          <Link href="/" className="text-sm font-semibold text-sky-300 hover:text-white transition-colors">
            Subscribe for free →
          </Link>
        </div>

      </div>
    </div>
  );
}
