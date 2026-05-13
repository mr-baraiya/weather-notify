import React from 'react';
import SunIcon from './icons/SunIcon';
import CloudIcon from './icons/CloudIcon';
import RainIcon from './icons/RainIcon';
import SnowIcon from './icons/SnowIcon';
import DrizzleIcon from './icons/DrizzleIcon';
import ThunderstormIcon from './icons/ThunderstormIcon';

const WeatherIcon = ({ condition, ...props }) => {
  switch (condition) {
    case 'Clear':
      return <SunIcon {...props} />;
    case 'Clouds':
      return <CloudIcon {...props} />;
    case 'Rain':
      return <RainIcon {...props} />;
    case 'Snow':
      return <SnowIcon {...props} />;
    case 'Drizzle':
      return <DrizzleIcon {...props} />;
    case 'Thunderstorm':
      return <ThunderstormIcon {...props} />;
    default:
      return <SunIcon {...props} />;
  }
};

export default WeatherIcon;
