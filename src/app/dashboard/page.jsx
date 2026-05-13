'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Cloud, Droplets, Thermometer, Users, Zap } from 'lucide-react';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    subscribers: 0,
    weather: null,
    alerts: 0,
    recentSubscriptions: [],
  });
  const [loading, setLoading] = useState(true);
  const [cityLabel, setCityLabel] = useState('Rajkot');

  useEffect(() => {
    let canceled = false;

    const fetchData = async (url) => {
      try {
        const response = await axios.get(url);
        if (response.data?.success && !canceled) {
          setStats(response.data.data);
          if (response.data.data?.city) {
            setCityLabel(response.data.data.city);
          }
        } else {
          console.error('Error fetching dashboard data:', response.data?.message || 'Unknown error');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    };

    setLoading(true);

    if (!navigator.geolocation) {
      fetchData(`/api/dashboard?city=${encodeURIComponent('Rajkot')}`);
      return () => {
        canceled = true;
      };
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchData(`/api/dashboard?lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
      },
      () => {
        fetchData(`/api/dashboard?city=${encodeURIComponent('Rajkot')}`);
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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>;
  }

  const cloudPercent = stats.weather?.clouds?.all;
  const cloudLabel = typeof cloudPercent === 'number' ? `${cloudPercent}%` : 'N/A';

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Subscribers */}
        <div className="bg-white/10 backdrop-blur-lg p-5 sm:p-6 rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300">Total Subscribers</p>
              <p className="text-2xl sm:text-3xl font-bold">{stats.subscribers}</p>
            </div>
            <Users className="text-gray-400" size={32} />
          </div>
        </div>

        {/* Current Weather */}
        <div className="bg-white/10 backdrop-blur-lg p-5 sm:p-6 rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300">Weather in {cityLabel}</p>
              <p className="text-2xl sm:text-3xl font-bold">{stats.weather ? `${Math.round(stats.weather.main.temp)}°C` : 'N/A'}</p>
            </div>
            {stats.weather?.weather[0].main === 'Rain' ? <Droplets className="text-blue-400" size={32} /> : <Thermometer className="text-red-400" size={32} />}
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-white/10 backdrop-blur-lg p-5 sm:p-6 rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300">Active Alerts</p>
              <p className="text-2xl sm:text-3xl font-bold">{stats.alerts}</p>
            </div>
            <Zap className="text-yellow-400" size={32} />
          </div>
        </div>
        
        {/* Placeholder */}
        <div className="bg-white/10 backdrop-blur-lg p-5 sm:p-6 rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300">Cloud Status</p>
              <p className="text-2xl sm:text-3xl font-bold">{cloudLabel}</p>
            </div>
            <Cloud className="text-gray-400" size={32} />
          </div>
        </div>
        </div>

        <div className="mt-6 sm:mt-8 bg-white/10 backdrop-blur-lg p-5 sm:p-6 rounded-3xl">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Recent Subscriptions</h2>
          <ul>
            {stats.recentSubscriptions.map((sub, index) => (
              <li key={index} className="border-b border-gray-700 py-2 flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-sm sm:text-base">{sub.name}</span>
                <span className="text-gray-400 text-sm sm:text-base">{sub.city}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
