'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { User, MapPin, Phone, Mail } from 'lucide-react';
import WhatsAppModal from './WhatsAppModal';

const SubscribeForm = () => {
  const [formData, setFormData] = useState({ name: '', city: '', phone: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [whatsappSetup, setWhatsappSetup] = useState(null);
  const [formErrors, setFormErrors] = useState({ name: '', city: '', phone: '', email: '' });
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [phoneExists, setPhoneExists] = useState(false);
  const [callingCode, setCallingCode] = useState('+91');
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    let canceled = false;

    const loadCallingCode = async (coords) => {
      try {
        const response = await axios.get(`/api/geo/calling-code?lat=${coords.latitude}&lon=${coords.longitude}`);
        if (!canceled && response.data?.success && response.data.data?.callingCode) {
          setCallingCode(response.data.data.callingCode);
        }
      } catch (error) {
        if (!canceled) {
          setLocationError('Unable to detect country code. Using +91.');
        }
      }
    };

    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported. Using +91.');
      return () => {
        canceled = true;
      };
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        loadCallingCode(position.coords);
      },
      () => {
        if (!canceled) {
          setLocationError('Location permission denied. Using +91.');
        }
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: digitsOnly });
      setFormErrors(prev => ({ ...prev, phone: '' }));
      setPhoneExists(false);
      return;
    }
    setFormData({ ...formData, [name]: value });
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePhoneBlur = async () => {
    if (!formData.phone) return;

    if (!/^\d{10}$/.test(formData.phone)) {
      setFormErrors(prev => ({ ...prev, phone: 'Enter a 10 digit mobile number.' }));
      return;
    }

    setCheckingPhone(true);
    setFormErrors(prev => ({ ...prev, phone: '' }));
    setPhoneExists(false);

    try {
      const fullPhone = `${callingCode}${formData.phone}`;
      const checkResponse = await axios.get(`/api/subscribe/check?phone=${encodeURIComponent(fullPhone)}`);
      if (checkResponse.data.exists) {
        setPhoneExists(true);
        setFormErrors(prev => ({ ...prev, phone: 'This phone number is already subscribed.' }));
      }
    } catch (error) {
      console.error('Phone validation error:', error);
      setFormErrors(prev => ({ ...prev, phone: 'Unable to validate phone number right now.' }));
    } finally {
      setCheckingPhone(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Custom Validation
    let hasError = false;
    const errors = { name: '', city: '', phone: '', email: '' };

    if (!formData.name.trim()) { errors.name = 'Name is Required'; hasError = true; }
    if (!formData.city.trim()) { errors.city = 'City is Required'; hasError = true; }
    if (!formData.email.trim()) {
      errors.email = 'Email is Required'; hasError = true;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Invalid email'; hasError = true;
    }
    if (!formData.phone) {
      errors.phone = 'Phone is Required'; hasError = true;
    } else if (!/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'Invalid 10 digit number'; hasError = true;
    }

    setFormErrors(errors);
    if (hasError) return;

    setLoading(true);
    setMessage('');
    setWhatsappSetup(null);

    if (phoneExists) {
      setMessage('This phone number is already subscribed.');
      setLoading(false);
      return;
    }

    try {
      const fullPhone = `${callingCode}${formData.phone}`;
      const checkResponse = await axios.get(`/api/subscribe/check?phone=${encodeURIComponent(fullPhone)}`);
      if (checkResponse.data.exists) {
        setPhoneExists(true);
        setFormErrors(prev => ({ ...prev, phone: 'This phone number is already subscribed.' }));
        setMessage('This phone number is already subscribed.');
        setLoading(false);
        return;
      }

      const response = await axios.post('/api/subscribe', {
        ...formData,
        phone: fullPhone,
      });
      if (response.data.success) {
        setMessage('Subscription successful! Complete the WhatsApp connection in the popup.');
        setWhatsappSetup(response.data.whatsappSetup || null);
        setFormData({ name: '', city: '', phone: '', email: '' });
      } else {
        setMessage(response.data.message || 'Subscription failed. Please try again.');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('An error occurred. Please try again later.');
      }
      console.error('Subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-4xl p-6 sm:p-8 w-full h-full min-h-[380px] flex flex-col justify-between">
      <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 text-white">Subscribe for Alerts</h3>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/90" size={18} />
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full bg-white/15 hover:bg-white/20 focus:bg-white/25 border ${formErrors.name ? 'border-red-400' : 'border-white/25'} rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all`}
            />
          </div>
          {formErrors.name && <p className="text-xs text-red-300 font-medium mt-1.5 ml-1 text-left">{formErrors.name}</p>}
        </div>

        <div>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/90" size={18} />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className={`w-full bg-white/15 hover:bg-white/20 focus:bg-white/25 border ${formErrors.email ? 'border-red-400' : 'border-white/25'} rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all`}
            />
          </div>
          {formErrors.email && <p className="text-xs text-red-300 font-medium mt-1.5 ml-1 text-left">{formErrors.email}</p>}
        </div>

        <div>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/90" size={18} />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              className={`w-full bg-white/15 hover:bg-white/20 focus:bg-white/25 border ${formErrors.city ? 'border-red-400' : 'border-white/25'} rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all`}
            />
          </div>
          {formErrors.city && <p className="text-xs text-red-300 font-medium mt-1.5 ml-1 text-left">{formErrors.city}</p>}
        </div>

        <div>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/90" size={18} />
            <input
              type="tel"
              name="phone"
              placeholder="10 digit mobile number"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handlePhoneBlur}
              inputMode="numeric"
              pattern="\d{10}"
              maxLength={10}
              className={`w-full bg-white/15 hover:bg-white/20 focus:bg-white/25 border ${formErrors.phone ? 'border-red-400' : 'border-white/25'} rounded-xl py-3 pl-20 pr-4 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all`}
            />
            <span className="absolute left-11 top-1/2 -translate-y-1/2 text-sm text-white/90 font-medium">
              {callingCode}
            </span>
          </div>
          {formErrors.phone && <p className="text-xs text-red-300 font-medium mt-1.5 ml-1 text-left">{formErrors.phone}</p>}
        </div>

        {locationError && (
          <p className="text-xs text-sky-200/80 mt-1 text-right mr-2">{locationError}</p>
        )}
        <button
          type="submit"
          disabled={loading || checkingPhone || phoneExists}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors duration-300 disabled:bg-gray-500"
        >
          {loading ? 'Subscribing...' : checkingPhone ? 'Checking number...' : 'Subscribe for Alerts'}
        </button>
      </form>
      {message && <p className="mt-4 text-center text-sm">{message}</p>}

      {whatsappSetup && (
        <WhatsAppModal
          setup={whatsappSetup}
          onClose={() => setWhatsappSetup(null)}
        />
      )}
    </div>
  );
};

export default SubscribeForm;
