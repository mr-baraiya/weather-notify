'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';

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

import LocationSelector from '@/components/LocationSelector';

const POPULAR_CITIES = ['Rajkot', 'Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Ahmedabad', 'London', 'New York'];

export default function WeatherMapPage() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState({ country: '', state: '', city: '' });
  const [locationErrors, setLocationErrors] = useState({ country: '', state: '', city: '' });
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
    } catch (err) {
      const isOffline = !navigator.onLine || err.response?.status === 503 || err.code === 'ERR_NETWORK';
      setErrorMessage(
        isOffline
          ? 'No internet connection. Please check your network and try again.'
          : 'Unable to fetch weather data for this city.'
      );
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
        }
      } catch (err) {
        console.error('Initial weather map fetch error:', err);
        if (!canceled) {
          const isOffline = !navigator.onLine || err.response?.status === 503 || err.code === 'ERR_NETWORK';
          setErrorMessage(
            isOffline
              ? 'No internet connection. Please check your network and try again.'
              : 'Unable to fetch weather data.'
          );
        }
      } finally {
        if (!canceled) setLoading(false);
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
          () => { },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 300000 }
        );
      }
    };

    loadInitialWeather();
    return () => { canceled = true; };
  }, []);

  const handleLocationChange = (newWeather, cityName) => {
    setWeather(newWeather);
    setActiveCity(cityName);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    let hasErr = false;
    const errors = { country: '', state: '', city: '' };

    if (!location.country) { errors.country = 'Country is Required'; hasErr = true; }
    if (!location.state) { errors.state = 'State is Required'; hasErr = true; }
    if (!location.city) { errors.city = 'City is Required'; hasErr = true; }

    setLocationErrors(errors);
    if (hasErr) return;

    fetchCityWeather(location.city);
  };

  return (
    <div className="min-h-screen py-16 sm:py-24 px-4 text-white">
      <div className="max-w-6xl mx-auto">

        {/* Eyebrow */}
        <p className="text-xs text-sky-300 font-bold uppercase tracking-widest mb-5">Weather Map</p>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
          Interactive Weather Radar Map
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-sky-100/90 leading-relaxed mb-10 max-w-2xl">
          Explore real-time rain radar, cloud density, temperature gradients, and wind velocity overlays centered on your selected location.
        </p>

        {/* Cascading Country -> State -> City Dropdowns Form */}
        <div className="space-y-4 mb-10 w-full glass-card rounded-3xl p-6 sm:p-8">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <LocationSelector
              country={location.country}
              state={location.state}
              city={location.city}
              onChange={({ country, state, city }) => {
                setLocation({ country, state, city });
                setLocationErrors({ country: '', state: '', city: '' });
              }}
              errors={locationErrors}
              layout="horizontal"
              showLabels={true}
            />

            <div className="flex items-center justify-between pt-1">
              {errorMessage ? (
                <p className="text-xs text-red-400 font-medium">{errorMessage}</p>
              ) : (
                <span className="text-xs text-sky-200/70">Select Country, State, and City to center map.</span>
              )}

              <button
                type="submit"
                disabled={loading}
                className="px-3.5 py-2 sm:px-6 sm:py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-indigo-900/40 disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                {loading ? 'Locating...' : 'Go to City'}
              </button>
            </div>
          </form>

          {/* Quick Actions / Quick Focus Pills (Desktop Only) */}
          <div className="hidden sm:flex items-center gap-2 flex-wrap text-xs text-slate-300 pt-2 border-t border-white/10">
            <span className="text-sky-300 font-bold uppercase tracking-widest text-[11px]">
              Quick Focus:
            </span>
            {POPULAR_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => { fetchCityWeather(city); }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${activeCity.toLowerCase() === city.toLowerCase()
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
        <WeatherMapComponent weather={weather} onLocationChange={handleLocationChange} />

      </div>
    </div>
  );
}
