'use client';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { WifiOff, RefreshCw } from 'lucide-react';
import WeatherCard from './WeatherCard';
import WeatherLoader from './WeatherLoader';
import SubscribeForm from './SubscribeForm';
import LandingFeatures from './LandingFeatures';
import WeatherReportSection from './WeatherReportSection';

const Hero = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [locationStatus, setLocationStatus] = useState('');
  const defaultCity = 'Rajkot';

  const fetchWeather = async (url) => {
    const response = await axios.get(url);
    return response.data.data;
  };

  const loadInitialWeather = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');

    let fetchSuccess = false;

    try {
      const defaultData = await fetchWeather(`/api/weather?city=${encodeURIComponent(defaultCity)}`);
      setWeather(defaultData);
      setErrorMessage('');
      fetchSuccess = true;
    } catch (err) {
      console.error('Initial weather fetch error:', err?.message || err);
      const isOffline = !navigator.onLine || err.response?.status === 503 || err.code === 'ERR_NETWORK';
      setErrorMessage(
        isOffline
          ? 'No internet connection. Please check your network and try again.'
          : 'Unable to fetch weather data right now.'
      );
    } finally {
      setLoading(false);
    }

    if (navigator.geolocation && fetchSuccess) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const localData = await fetchWeather(
              `/api/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );
            if (localData) {
              setWeather(localData);
              setLocationStatus('');
              setErrorMessage('');
            }
          } catch (error) {
            console.error('Location weather error:', error);
          }
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setLocationStatus('Showing default weather (Location permission denied)');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 300000,
        }
      );
    }
  }, []);

  useEffect(() => {
    loadInitialWeather();
  }, [loadInitialWeather]);

  return (
    <section className="relative min-h-screen flex items-center justify-center text-white py-16 sm:py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4">
          Weather Notify
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-sky-100/90 mb-10 sm:mb-12 max-w-2xl mx-auto">
          Get live weather updates and receive instant rain or heatwave alerts directly on your WhatsApp.
        </p>
        {locationStatus && (
          <p className="text-sm text-sky-200/80 mb-8">{locationStatus}</p>
        )}

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 lg:gap-28 items-stretch px-4">
          {loading ? (
            <WeatherLoader />
          ) : errorMessage && !weather ? (
            <div className="glass-card md:rounded-4xl md:p-8 p-6 w-full h-full min-h-[380px] flex flex-col items-center justify-center text-center space-y-5 border border-rose-500/20">
              <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <WifiOff size={36} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Weather Service Offline</h3>
                <p className="text-sm text-sky-200/80 max-w-xs mx-auto leading-relaxed">
                  {errorMessage}
                </p>
              </div>
              <button
                onClick={loadInitialWeather}
                className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-indigo-900/40 cursor-pointer"
              >
                <RefreshCw size={15} className="mr-2" />
                Try Again
              </button>
            </div>
          ) : (
            weather && <WeatherCard weather={weather} />
          )}
          <SubscribeForm />
        </div>

        <LandingFeatures weather={weather} loading={loading} />

        <WeatherReportSection initialCity={weather?.current?.name || 'Rajkot'} />
      </div>
    </section>
  );
};

export default Hero;
