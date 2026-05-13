'use client';
import { useState } from 'react';
import axios from 'axios';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/contact', formData);
      if (response.data?.success) {
        setFormData({ name: '', email: '', message: '' });
        setShowPopup(true);
      } else {
        setError(response.data?.message || 'Unable to send message.');
      }
    } catch (submitError) {
      const apiMessage = submitError.response?.data?.message;
      setError(apiMessage || 'Unable to send message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-12 sm:px-6 sm:py-16">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-base sm:text-lg text-gray-300 mb-8 sm:mb-10">
          Have a question or feedback? Send us a message and we will get back to you.
        </p>

        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <label className="block text-sm text-gray-300 mb-2" htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2" htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              required
              className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {error && (
            <p className="text-sm text-red-300">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 transition-colors disabled:bg-gray-500"
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3">Message sent</h2>
            <p className="text-gray-300 mb-6">Thanks for reaching out. We will respond shortly.</p>
            <button
              onClick={() => setShowPopup(false)}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactPage;
