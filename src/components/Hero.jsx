'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import WeatherCard from './WeatherCard';
import WeatherLoader from './WeatherLoader';
import SubscribeForm from './SubscribeForm';

const Hero = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState('');
  const defaultCity = 'Rajkot';

  useEffect(() => {
    let canceled = false;

    const fetchWeather = async (url) => {
      const response = await axios.get(url);
      return response.data.data;
    };

    const loadInitialWeather = async () => {
      setLoading(true);

      try {
        const defaultData = await fetchWeather(`/api/weather?city=${encodeURIComponent(defaultCity)}`);
        if (!canceled) {
          setWeather(defaultData);
          setLoading(false);
        }
      } catch (err) {
        console.error('Initial weather fetch error:', err);
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            if (canceled) return;
            try {
              const localData = await fetchWeather(
                `/api/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}`
              );
              if (!canceled && localData) {
                setWeather(localData);
                setLocationStatus('');
              }
            } catch (error) {
              console.error('Location weather error:', error);
            }
          },
          (error) => {
            if (canceled) return;
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
    };

    loadInitialWeather();

    return () => {
      canceled = true;
    };
  }, []);

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
          ) : (
            weather && <WeatherCard weather={weather} />
          )}
          <SubscribeForm />
        </div>
      </div>
    </section>
  );
};

export default Hero;
