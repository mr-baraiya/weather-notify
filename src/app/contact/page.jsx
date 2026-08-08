'use client';
import { useState } from 'react';
import axios from 'axios';
import { ChevronDown } from 'lucide-react';

const categories = [
  'General Inquiry',
  'Bug Report',
  'Feature Request',
  'WhatsApp Connection Issue',
  'Alert / Notification Issue',
  'Other',
];

const validate = (data) => {
  const errs = {};
  if (!data.name.trim()) errs.name = 'Required';
  else if (data.name.trim().length < 2) errs.name = 'At least 2 characters';
  if (!data.email.trim()) errs.email = 'Required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = 'Invalid email';
  if (!data.category) errs.category = 'Select a category';
  if (!data.message.trim()) errs.message = 'Required';
  else if (data.message.trim().length < 10) errs.message = 'At least 10 characters';
  return errs;
};

const field =
  'w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none transition-colors';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', category: '', message: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(formData);
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setLoading(true);
    try {
      const res = await axios.post('/api/contact', formData);
      if (res.data?.success) {
        setFormData({ name: '', email: '', category: '', message: '' });
        setFieldErrors({});
        setSubmitted(true);
      } else {
        setSubmitError(res.data?.message || 'Unable to send. Please try again.');
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Something went wrong. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (f) => ({
    background: '#0f1629',
    border: `1px solid ${fieldErrors[f] ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.07)'}`,
  });

  /* ── Success ─────────────────────────────── */
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-white">
        <div className="max-w-sm w-full space-y-4">
          <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
          <h2 className="text-xl font-semibold">Message sent.</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Thanks for reaching out. We'll get back to you as soon as possible.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Send another message →
          </button>
        </div>
      </div>
    );
  }

  /* ── Form ────────────────────────────────── */
  return (
    <div className="min-h-screen py-16 sm:py-24 px-4 text-white">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-5">Contact</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Get in touch</h1>
        <p className="text-sm text-gray-500 mb-10 leading-relaxed">
          Have a question, found a bug, or want to share feedback? Fill out the form and we'll get back to you.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* Name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-600" htmlFor="name">Name</label>
              <input
                id="name" name="name" type="text" placeholder="Your name"
                value={formData.name} onChange={handleChange}
                className={field} style={inputStyle('name')}
              />
              {fieldErrors.name && <p className="text-xs text-red-400">{fieldErrors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-600" htmlFor="email">Email</label>
              <input
                id="email" name="email" type="email" placeholder="you@example.com"
                value={formData.email} onChange={handleChange}
                className={field} style={inputStyle('email')}
              />
              {fieldErrors.email && <p className="text-xs text-red-400">{fieldErrors.email}</p>}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-600" htmlFor="category">Category</label>
            <div className="relative">
              <select
                id="category" name="category" value={formData.category} onChange={handleChange}
                className={`${field} appearance-none pr-8 cursor-pointer`} style={inputStyle('category')}
              >
                <option value="" disabled className="bg-[#0f1629] text-gray-600">Select a category…</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#0f1629] text-white">{cat}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
            </div>
            {fieldErrors.category && <p className="text-xs text-red-400">{fieldErrors.category}</p>}
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs text-gray-600" htmlFor="message">Message</label>
              <span className={`text-xs tabular-nums ${formData.message.length > 0 && formData.message.length < 10 ? 'text-red-400' : 'text-gray-700'}`}>
                {formData.message.length} / 10 min
              </span>
            </div>
            <textarea
              id="message" name="message" rows={5}
              placeholder="Tell us what's on your mind…"
              value={formData.message} onChange={handleChange}
              className={`${field} resize-none`} style={inputStyle('message')}
            />
            {fieldErrors.message && <p className="text-xs text-red-400">{fieldErrors.message}</p>}
          </div>

          {/* Submit error */}
          {submitError && (
            <p className="text-xs text-red-400 border border-red-500/15 bg-red-500/5 rounded-lg px-3 py-2.5">
              {submitError}
            </p>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 transition-colors"
          >
            {loading ? 'Sending…' : 'Send message'}
          </button>
        </form>

      </div>
    </div>
  );
}
