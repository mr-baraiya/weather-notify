'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import WeatherCard from './WeatherCard';
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

    const loadByCity = async (message) => {
      if (!canceled && message) {
        setLocationStatus(message);
      }

      try {
        const data = await fetchWeather(`/api/weather?city=${encodeURIComponent(defaultCity)}`);
        if (!canceled) {
          setWeather(data);
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
        if (!canceled) {
          setLocationStatus('Unable to fetch weather right now.');
        }
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    };

    const loadByCoords = async (coords) => {
      let handledFallback = false;
      try {
        const data = await fetchWeather(`/api/weather?lat=${coords.latitude}&lon=${coords.longitude}`);
        if (!canceled) {
          setWeather(data);
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
        handledFallback = true;
        await loadByCity(`Unable to fetch weather for your location. Showing ${defaultCity}.`);
      } finally {
        if (!canceled && !handledFallback) {
          setLoading(false);
        }
      }
    };

    setLoading(true);

    if (!navigator.geolocation) {
      loadByCity('Geolocation is not supported. Showing Rajkot.');
      return () => {
        canceled = true;
      };
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        loadByCoords(position.coords);
      },
      (error) => {
        let message = 'Unable to access your location. Showing Rajkot.';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Location permission denied. Showing Rajkot.';
        } else if (error.code === error.TIMEOUT) {
          message = 'Location request timed out. Showing Rajkot.';
        }
        loadByCity(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );

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
        <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-10 sm:mb-12 max-w-2xl mx-auto">
          Get live weather updates and receive instant rain or heatwave alerts directly on your WhatsApp.
        </p>
        {locationStatus && (
          <p className="text-sm text-gray-400 mb-8">{locationStatus}</p>
        )}

        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8">
          {loading ? (
            <div className="w-full lg:w-auto">
              <div className="glass-card rounded-4xl p-8 w-full max-w-sm mx-auto h-64 animate-pulse"></div>
            </div>
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
