'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle2, MessageCircleMore, Phone, Send, User, MapPin } from 'lucide-react';

const SubscribeForm = () => {
  const [formData, setFormData] = useState({ name: '', city: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [whatsappSetup, setWhatsappSetup] = useState(null);
  const [phoneError, setPhoneError] = useState('');
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
      setPhoneError('');
      setPhoneExists(false);
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handlePhoneBlur = async () => {
    if (!formData.phone) {
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setPhoneError('Enter a 10 digit mobile number.');
      return;
    }

    setCheckingPhone(true);
    setPhoneError('');
    setPhoneExists(false);

    try {
      const fullPhone = `${callingCode}${formData.phone}`;
      const checkResponse = await axios.get(`/api/subscribe/check?phone=${encodeURIComponent(fullPhone)}`);
      if (checkResponse.data.exists) {
        setPhoneExists(true);
        setPhoneError('This phone number is already subscribed.');
      }
    } catch (error) {
      console.error('Phone validation error:', error);
      setPhoneError('Unable to validate phone number right now.');
    } finally {
      setCheckingPhone(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setWhatsappSetup(null);

    if (phoneExists) {
      setMessage('This phone number is already subscribed.');
      setLoading(false);
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setPhoneError('Enter a 10 digit mobile number.');
      setLoading(false);
      return;
    }

    try {
      // Check if the phone number already exists
      const fullPhone = `${callingCode}${formData.phone}`;
      const checkResponse = await axios.get(`/api/subscribe/check?phone=${encodeURIComponent(fullPhone)}`);
      if (checkResponse.data.exists) {
        setPhoneExists(true);
        setPhoneError('This phone number is already subscribed.');
        setMessage('This phone number is already subscribed.');
        setLoading(false);
        return;
      }

      // If not, create the new subscription
      const response = await axios.post('/api/subscribe', {
        ...formData,
        phone: fullPhone,
      });
      if (response.data.success) {
        setMessage('Subscription successful! Complete the WhatsApp connection below.');
        setWhatsappSetup(response.data.whatsappSetup || null);
        setFormData({ name: '', city: '', phone: '' });
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
    <div className="glass-card rounded-4xl p-6 sm:p-8 w-full max-w-sm mx-auto">
      <h3 className="text-xl sm:text-2xl font-bold text-center mb-6">Subscribe for Alerts</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            required
            className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
            required
            className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-20 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="absolute left-10 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            {callingCode}
          </span>
        </div>
        {locationError && (
          <p className="text-xs text-gray-400">{locationError}</p>
        )}
        {phoneError && (
          <p className="text-sm text-red-300">{phoneError}</p>
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
        <div className="mt-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 shrink-0 text-emerald-400" size={22} />
            <div>
              <h4 className="text-lg sm:text-xl font-bold">{whatsappSetup.title}</h4>
              <p className="mt-1 text-sm sm:text-base text-gray-300">{whatsappSetup.intro}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3 text-sm sm:text-base">
            <div className="flex gap-3 rounded-2xl bg-black/20 px-4 py-4">
              <MessageCircleMore className="mt-0.5 shrink-0 text-sky-400" size={20} />
              <div>
                <p className="font-semibold text-white">Step 1: Open WhatsApp.</p>
                <p className="text-gray-400">Keep this screen open while you switch apps.</p>
              </div>
            </div>

            <div className="flex gap-3 rounded-2xl bg-black/20 px-4 py-4">
              <Send className="mt-0.5 shrink-0 text-emerald-400" size={20} />
              <div>
                <p className="font-semibold text-white">Step 2: Send this exact message:</p>
                <pre className="mt-2 overflow-x-auto rounded-xl bg-black/40 px-4 py-3 text-sm text-emerald-300">{whatsappSetup.joinMessage}</pre>
              </div>
            </div>

            <div className="flex gap-3 rounded-2xl bg-black/20 px-4 py-4">
              <Phone className="mt-0.5 shrink-0 text-cyan-400" size={20} />
              <div>
                <p className="font-semibold text-white">Step 3: Send it to:</p>
                <pre className="mt-2 overflow-x-auto rounded-xl bg-black/40 px-4 py-3 text-sm text-sky-300">{whatsappSetup.sandboxNumber}</pre>
              </div>
            </div>

            <div className="flex gap-3 rounded-2xl bg-black/20 px-4 py-4">
              <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" size={20} />
              <div>
                <p className="font-semibold text-white">Step 4: Wait for the confirmation.</p>
                <p className="mt-2 rounded-xl bg-black/40 px-4 py-3 text-sm text-gray-200">{whatsappSetup.confirmationMessage}</p>
              </div>
            </div>

            <div className="flex gap-3 rounded-2xl bg-black/20 px-4 py-4">
              <CheckCircle2 className="mt-0.5 shrink-0 text-indigo-400" size={20} />
              <div className="w-full">
                <p className="font-semibold text-white">Step 5: Return to Weather Notify and click:</p>
                <button
                  type="button"
                  onClick={() => setWhatsappSetup(null)}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-indigo-700"
                >
                  <CheckCircle2 size={18} />
                  {whatsappSetup.returnLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscribeForm;
