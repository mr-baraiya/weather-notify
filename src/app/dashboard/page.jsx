'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Mail, Send, CheckCircle, AlertCircle, LayoutDashboard, MessageSquare, Radio, Eye, Pencil, Trash2, X, ShieldCheck, LogOut, Plus, UserCog } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = ['General Inquiry', 'Bug Report', 'Feature Request', 'WhatsApp Connection Issue', 'Alert / Notification Issue', 'Other'];

/* ─── helpers ──────────────────────────────────────────────────── */
const cardStyle = { 
  background: 'rgba(255, 255, 255, 0.1)', 
  backdropFilter: 'blur(20px)', 
  WebkitBackdropFilter: 'blur(20px)', 
  border: '1px solid rgba(255, 255, 255, 0.18)', 
  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)' 
};

const inputStyle = { 
  background: 'rgba(255, 255, 255, 0.15)', 
  border: '1px solid rgba(255, 255, 255, 0.25)', 
  color: '#ffffff' 
};

const inputCls = 'w-full rounded-lg px-3 py-2 text-sm text-white placeholder-white/60 focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all';

// Abbreviate long category names for the chart X-axis
const CAT_SHORT = {
  'General Inquiry': 'General',
  'Bug Report': 'Bug',
  'Feature Request': 'Feature',
  'WhatsApp Connection Issue': 'WA Issue',
  'Alert / Notification Issue': 'Alerts',
  'Other': 'Other',
};
const shortCat = (name) => CAT_SHORT[name] ?? name;

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ─── Login Gate ─────────────────────────────────────────────── */
function LoginGate({ onUnlock }) {
  const [username, setUsername] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!username.trim()) { setErr('Enter your username.'); return; }
    if (!pw.trim()) { setErr('Enter your password.'); return; }
    setLoading(true); setErr('');
    try {
      const res = await axios.post('/api/admin/verify', { username: username.trim(), password: pw });
      if (res.data?.success && res.data.token) {
        sessionStorage.setItem('admin_token', res.data.token);
        sessionStorage.setItem('admin_username', res.data.username);
        onUnlock(res.data.token, res.data.username);
      } else {
        setErr('Invalid username or password.');
      }
    } catch (e) {
      setErr(e.response?.data?.message || 'Invalid username or password.');
    } finally { setLoading(false); }
  };

  const hasErr = !!err;

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      display: 'flex',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #38bdf8 100%)',
      fontFamily: "'Inter', 'Segoe UI', -apple-system, sans-serif",
    }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes lg-spin { to { transform: rotate(360deg); } }
        .lg-input { outline: none; transition: all 0.2s; }
        .lg-input::placeholder { color: rgba(255,255,255,0.65) !important; }
        .lg-input:focus { border-color: rgba(255,255,255,0.5) !important; background: rgba(255,255,255,0.2) !important; }
        .lg-input:-webkit-autofill,
        .lg-input:-webkit-autofill:hover,
        .lg-input:-webkit-autofill:focus,
        .lg-input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #1e3b72 inset !important;
          box-shadow: 0 0 0 1000px #1e3b72 inset !important;
          -webkit-text-fill-color: #ffffff !important;
          caret-color: #ffffff;
          transition: background-color 99999s ease-in-out 0s;
        }
        .lg-btn:hover:not(:disabled) { background: #4338ca !important; box-shadow: 0 0 24px rgba(99,102,241,0.5); }
      `}} />

      {/* Left 50%: Styled weather-login illustration in a floating glass card */}
      <div className="hidden md:flex w-1/2 h-full items-center justify-center p-6 lg:p-10 relative">
        <div className="absolute w-80 h-80 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="glass-card rounded-3xl p-3 border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.35)] overflow-hidden max-h-[88vh] flex items-center justify-center hover:scale-[1.01] transition-transform duration-300 relative z-10">
          <img
            src="/weather-login.png"
            alt="Weather App Login Illustration"
            className="max-h-[80vh] w-auto object-contain rounded-2xl drop-shadow-2xl"
          />
        </div>
      </div>

      {/* Right 50%: Centered Admin Login Form */}
      <div className="w-full md:w-1/2 h-full flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '24px',
            padding: '2.25rem 1.75rem',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
          }}>

            {/* Title */}
            <h1 style={{
              textAlign: 'center',
              fontSize: '1.5rem',
              fontWeight: '600',
              letterSpacing: '0.05em',
              color: '#ffffff',
              margin: '0 0 2rem',
            }}>
              Admin Login
            </h1>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Username field */}
              <div style={{ position: 'relative' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.85, pointerEvents: 'none' }}>
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input
                  type="text" id="admin-username" name="username"
                  placeholder="Username or Email" value={username}
                  autoFocus autoComplete="username"
                  onChange={e => { setUsername(e.target.value); setErr(''); }}
                  className="lg-input"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: `1px solid ${hasErr ? 'rgba(239,68,68,0.6)' : 'rgba(255, 255, 255, 0.25)'}`,
                    borderRadius: '12px',
                    padding: '12px 14px 12px 44px',
                    fontSize: '0.9375rem',
                    color: '#ffffff',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Password field */}
              <div style={{ position: 'relative' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.85, pointerEvents: 'none' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPw ? 'text' : 'password'} id="admin-password" name="password"
                  placeholder="Password" value={pw}
                  autoComplete="current-password"
                  onChange={e => { setPw(e.target.value); setErr(''); }}
                  className="lg-input"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: `1px solid ${hasErr ? 'rgba(239,68,68,0.6)' : 'rgba(255, 255, 255, 0.25)'}`,
                    borderRadius: '12px',
                    padding: '12px 44px 12px 44px',
                    fontSize: '0.9375rem',
                    color: '#ffffff',
                    fontFamily: 'inherit',
                  }}
                />
                <button type="button" onClick={() => setShowPw(s => !s)} tabIndex={-1}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#ffffff', opacity: 0.75, display: 'flex', alignItems: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0.75'}
                >
                  <Eye size={16} />
                </button>
              </div>

              {/* Error message */}
              {err && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: '#f87171', marginTop: '-0.25rem' }}>
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  {err}
                </div>
              )}

              {/* Remember me + Forgot */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', userSelect: 'none' }}>
                  <input type="checkbox" style={{ accentColor: '#4f46e5', width: '14px', height: '14px', cursor: 'pointer' }} />
                  Remember me
                </label>
                <Link href="/forgot-password"
                  style={{ fontSize: '0.8125rem', color: '#ffffff', opacity: 0.8, textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.textDecoration = 'underline'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '0.8'; e.currentTarget.style.textDecoration = 'none'; }}
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Login button */}
              <button type="submit" disabled={loading}
                className="lg-btn"
                style={{ width: '100%', padding: '13px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', fontSize: '0.875rem', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.72 : 1, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontFamily: 'inherit', marginTop: '0.5rem', boxShadow: '0 4px 16px rgba(79,70,229,0.4)' }}
              >
                {loading ? (
                  <>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'lg-spin 0.7s linear infinite' }} />
                    Signing in...
                  </>
                ) : 'Login'}
              </button>
            </form>

            {/* Bottom Links: Back to Home + Contact Us for non-admins */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', flexDirection: 'column', gap: '0.65rem', textAlign: 'center', fontSize: '0.8125rem' }}>
              <Link href="/"
                style={{ color: '#ffffff', opacity: 0.85, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.85'}
              >
                ← Back to Home Page
              </Link>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.78125rem' }}>
                Need admin access?{' '}
                <Link href="/contact"
                  style={{ color: '#ffffff', fontWeight: '600', textDecoration: 'underline' }}
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal ──────────────────────────────────────────────────── */

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
      <div
        style={cardStyle}
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 text-white space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-300 transition-colors p-1 -mr-1 rounded-lg hover:bg-white/5"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── Overview Tab ───────────────────────────────────────────── */
function OverviewTab({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let canceled = false;
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('/api/admin/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!canceled && res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        if (!canceled) setLoading(false);
      }
    };
    fetchAnalytics();
    return () => { canceled = true; };
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Top Stats Skeleton */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[1, 2].map(i => (
            <div key={i} style={cardStyle} className="p-4 sm:p-6 rounded-xl flex items-center justify-between overflow-hidden">
              <div className="space-y-2 w-1/2">
                <div className="h-3 rounded-md skeleton w-3/4" />
                <div className="h-8 rounded-md skeleton w-1/2" />
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full skeleton shrink-0" />
            </div>
          ))}
        </div>

        {/* Charts Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Main Growth Chart Skeleton */}
          <div style={cardStyle} className="p-4 sm:p-6 rounded-xl space-y-4 lg:col-span-2 overflow-hidden">
            <div className="h-4 rounded-md skeleton w-48" />
            <div className="h-48 sm:h-64 rounded-xl skeleton w-full flex items-end p-4 gap-3">
              {[40, 65, 30, 85, 50, 90, 45, 70, 60, 100, 75, 55, 80, 65].map((h, idx) => (
                <div key={idx} className="flex-1 bg-white/10 rounded-t-md skeleton" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          {/* Top Cities Skeleton */}
          <div style={cardStyle} className="p-4 sm:p-6 rounded-xl space-y-4 overflow-hidden">
            <div className="h-4 rounded-md skeleton w-32" />
            <div className="h-52 sm:h-64 rounded-xl skeleton w-full flex items-end p-4 gap-3">
              {[60, 40, 85, 50, 70].map((h, idx) => (
                <div key={idx} className="flex-1 bg-white/10 rounded-t-md skeleton" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          {/* Message Categories Skeleton */}
          <div style={cardStyle} className="p-4 sm:p-6 rounded-xl space-y-4 overflow-hidden">
            <div className="h-4 rounded-md skeleton w-40" />
            <div className="h-52 sm:h-64 rounded-xl skeleton w-full flex items-end p-4 gap-3">
              {[50, 75, 45, 90, 60, 35].map((h, idx) => (
                <div key={idx} className="flex-1 bg-white/10 rounded-t-md skeleton" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return <p className="text-sm text-red-400 py-10">Failed to load analytics data.</p>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div style={cardStyle} className="p-4 sm:p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-1">Total Subscribers</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">{data.totalSubscribers}</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Users size={20} />
          </div>
        </div>
        <div style={cardStyle} className="p-4 sm:p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-1">Total Messages</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">{data.totalMessages}</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
            <Mail size={20} />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* Growth Line Chart */}
        <div style={cardStyle} className="p-4 sm:p-6 rounded-xl space-y-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-white">Platform Growth (Last 14 Days)</h3>
          <div className="h-48 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.growth} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" tick={{ fill: '#ffffff', fontSize: 11, fontWeight: 500 }} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.6)" tick={{ fill: '#ffffff', fontSize: 11, fontWeight: 500 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255, 255, 255, 0.25)', color: '#fff', borderRadius: '12px', backdropFilter: 'blur(12px)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="newSubscribers" name="New Subs" stroke="#ffffff" strokeWidth={3} dot={{ r: 3, fill: '#ffffff', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="newMessages" name="New Messages" stroke="#9ca3af" strokeWidth={3} dot={{ r: 3, fill: '#9ca3af', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Cities Bar Chart */}
        <div style={cardStyle} className="p-4 sm:p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-semibold text-white">Top Cities</h3>
          <div className="h-52 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topCities} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" tick={{ fill: '#ffffff', fontSize: 11, fontWeight: 500 }} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.6)" tick={{ fill: '#ffffff', fontSize: 11, fontWeight: 500 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255, 255, 255, 0.25)', color: '#fff', borderRadius: '12px', backdropFilter: 'blur(12px)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Bar dataKey="subscribers" name="Subscribers" fill="#60a5fa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Message Categories Bar Chart */}
        <div style={cardStyle} className="p-4 sm:p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-semibold text-white">Message Categories</h3>
          <div className="h-52 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.messagesByCategory} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="rgba(255,255,255,0.6)"
                  tick={{ fill: '#ffffff', fontSize: 11, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={shortCat}
                />
                <YAxis stroke="rgba(255,255,255,0.6)" tick={{ fill: '#ffffff', fontSize: 11, fontWeight: 500 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255, 255, 255, 0.25)', color: '#fff', borderRadius: '12px', backdropFilter: 'blur(12px)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}
                  itemStyle={{ color: '#34d399' }}
                />
                <Bar dataKey="count" name="Messages" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ─── Subscribers Tab ─────────────────────────────────────────── */
function SubscribersTab({ token }) {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', city: '', phone: '', email: '', isActive: true });
  const [formErr, setFormErr] = useState('');
  const [saving, setSaving] = useState(false);
  const limit = 8;
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ search, city: cityFilter, status: statusFilter, page, limit });
      const res = await axios.get(`/api/admin/subscribers?${q}`, auth);
      if (res.data?.success) { setRows(res.data.data.subscribers); setTotal(res.data.data.total); }
    } catch { } finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, cityFilter, statusFilter, page, token]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm({ name: '', city: '', phone: '', email: '', isActive: true }); setFormErr(''); setModal('create'); };
  const openEdit = (r) => { setSelected(r); setForm({ name: r.name, city: r.city, phone: r.phone, email: r.email, isActive: r.isActive !== false }); setFormErr(''); setModal('edit'); };
  const openView = (r) => { setSelected(r); setModal('view'); };
  const openDelete = (r) => { setSelected(r); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const toggleActive = async (r) => {
    try {
      await axios.put('/api/admin/subscribers', { id: r._id, isActive: r.isActive === false }, auth);
      load();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update subscriber status.');
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.city || !form.phone || !form.email) { setFormErr('All fields are required.'); return; }
    setSaving(true); setFormErr('');
    try {
      if (modal === 'create') {
        await axios.post('/api/admin/subscribers', form, auth);
      } else {
        await axios.put('/api/admin/subscribers', { id: selected._id, ...form }, auth);
      }
      closeModal(); load();
    } catch (e) { setFormErr(e.response?.data?.message || 'Error saving.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await axios.delete(`/api/admin/subscribers?id=${selected._id}`, auth); closeModal(); load(); }
    catch (e) { setFormErr(e.response?.data?.message || 'Error deleting.'); }
    finally { setSaving(false); }
  };

  const pages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <input
          placeholder="Search name, phone or email…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className={`${inputCls} flex-1`}
          style={inputStyle}
        />
        <div className="flex gap-2">
          <input
            placeholder="City…"
            value={cityFilter}
            onChange={e => { setCityFilter(e.target.value); setPage(1); }}
            className={`${inputCls} w-28 sm:w-32`}
            style={inputStyle}
          />
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className={`${inputCls} w-32`}
            style={inputStyle}
          >
            <option value="" style={{ background: '#1e3b72', color: '#ffffff' }}>All Status</option>
            <option value="active" style={{ background: '#1e3b72', color: '#ffffff' }}>Active</option>
            <option value="inactive" style={{ background: '#1e3b72', color: '#ffffff' }}>Deactive</option>
          </select>
          <button
            onClick={openCreate}
            className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 transition-colors whitespace-nowrap shrink-0"
          >
            + New
          </button>
        </div>
      </div>

      {/* Desktop Table – hidden on mobile */}
      <div style={cardStyle} className="rounded-xl overflow-hidden hidden sm:block">
        <div className="grid grid-cols-[1fr_1.3fr_1fr_1.1fr_0.8fr_auto] text-xs text-sky-200/90 font-semibold uppercase tracking-wider px-4 py-2.5 border-b border-white/10">
          <span>Name</span><span>Email</span><span>City</span><span>Phone</span><span>Status</span><span className="text-right">Actions</span>
        </div>
        {loading ? (
          <div className="divide-y divide-white/5">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="grid grid-cols-[1fr_1.3fr_1fr_1.1fr_0.8fr_auto] items-center px-4 py-3.5">
                <div className="h-4 bg-white/10 rounded-md skeleton w-3/4" />
                <div className="h-4 bg-white/10 rounded-md skeleton w-4/5" />
                <div className="h-4 bg-white/10 rounded-md skeleton w-2/3" />
                <div className="h-4 bg-white/10 rounded-md skeleton w-3/4" />
                <div className="h-5 bg-white/10 rounded-full skeleton w-9" />
                <div className="flex gap-2 justify-end">
                  <div className="h-5 bg-white/10 rounded-md skeleton w-5" />
                  <div className="h-5 bg-white/10 rounded-md skeleton w-5" />
                  <div className="h-5 bg-white/10 rounded-md skeleton w-5" />
                </div>
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-white/70 px-4 py-6">No subscribers found.</p>
        ) : rows.map(r => (
          <div key={r._id} className="grid grid-cols-[1fr_1.3fr_1fr_1.1fr_0.8fr_auto] items-center px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors">
            <span className="text-sm text-white font-medium truncate pr-2">{r.name}</span>
            <span className="text-sm text-white/80 truncate pr-2">{r.email}</span>
            <span className="text-sm text-white/80 truncate pr-2">{r.city}</span>
            <span className="text-sm text-white/80 truncate pr-2">{r.phone}</span>
            <div className="flex items-center justify-start">
              <button
                type="button"
                onClick={() => toggleActive(r)}
                title={r.isActive !== false ? 'Active (click to deactivate)' : 'Deactive (click to activate)'}
                className="inline-flex items-center cursor-pointer focus:outline-none select-none group"
              >
                <span className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 border ${
                  r.isActive !== false
                    ? 'bg-emerald-500/30 border-emerald-400/50 group-hover:bg-emerald-500/40'
                    : 'bg-slate-700/60 border-slate-500/40 group-hover:bg-slate-700/80'
                }`}>
                  <span className={`w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-200 ${
                    r.isActive !== false ? 'translate-x-4 bg-emerald-400' : 'translate-x-0 bg-slate-400'
                  }`} />
                </span>
              </button>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <button
                onClick={() => openView(r)}
                title="View Details"
                className="p-1.5 rounded-lg text-sky-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => openEdit(r)}
                title="Edit Subscriber"
                className="p-1.5 rounded-lg text-indigo-300 hover:text-indigo-200 hover:bg-white/10 transition-colors"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => openDelete(r)}
                title="Delete Subscriber"
                className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Card List – shown only on mobile */}
      <div className="sm:hidden space-y-2">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={cardStyle} className="p-4 rounded-xl skeleton h-28" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-white/70 py-4">No subscribers found.</p>
        ) : rows.map(r => (
          <div key={r._id} style={cardStyle} className="rounded-xl p-4 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{r.name}</p>
                <p className="text-xs text-sky-100/90 truncate">{r.email}</p>
              </div>
              <span className="text-xs text-sky-200 bg-white/10 border border-white/15 px-2.5 py-0.5 rounded-full shrink-0 font-medium">{r.city}</span>
            </div>
            <p className="text-xs text-white/90 font-mono font-medium">{r.phone}</p>
            <div className="flex items-center justify-between pt-2.5 border-t border-white/10">
              <button
                type="button"
                onClick={() => toggleActive(r)}
                title={r.isActive !== false ? 'Active (click to deactivate)' : 'Deactive (click to activate)'}
                className="inline-flex items-center cursor-pointer focus:outline-none"
              >
                <span className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors duration-200 border ${
                  r.isActive !== false ? 'bg-emerald-500/30 border-emerald-400/50' : 'bg-slate-700/60 border-slate-500/40'
                }`}>
                  <span className={`w-3 h-3 rounded-full shadow-md transform transition-transform duration-200 ${
                    r.isActive !== false ? 'translate-x-3.5 bg-emerald-400' : 'translate-x-0 bg-slate-400'
                  }`} />
                </span>
              </button>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openView(r)}
                  title="View Details"
                  className="p-1.5 rounded-lg text-sky-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => openEdit(r)}
                  title="Edit Subscriber"
                  className="p-1.5 rounded-lg text-indigo-300 hover:text-indigo-200 hover:bg-white/10 transition-colors"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => openDelete(r)}
                  title="Delete Subscriber"
                  className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-sky-100 font-medium pt-2">
        <span className="text-sky-100/90 font-semibold">{total} total</span>
        <div className="flex gap-1.5 items-center">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 rounded-lg text-white font-medium border border-white/15 bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:border-white/5 disabled:bg-transparent transition-all"
          >
            ← Prev
          </button>
          <span className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-white font-bold">{page} / {pages || 1}</span>
          <button
            disabled={page >= pages}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 rounded-lg text-white font-medium border border-white/15 bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:border-white/5 disabled:bg-transparent transition-all"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Modals */}
      {(modal === 'create' || modal === 'edit') && (
        <Modal title={modal === 'create' ? 'New Subscriber' : 'Edit Subscriber'} onClose={closeModal}>
          <div className="space-y-3">
            {['name', 'email', 'city', 'phone'].map(f => (
              <div key={f} className="space-y-1">
                <label className="text-xs text-sky-200 font-semibold uppercase tracking-wider capitalize">{f}</label>
                <input value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
                  placeholder={f === 'phone' ? '+91XXXXXXXXXX' : `Enter ${f}`}
                  className={inputCls} style={inputStyle} />
              </div>
            ))}
            
            <div className="flex items-center justify-between pt-1">
              <label className="text-xs text-sky-200 font-semibold uppercase tracking-wider">Status</label>
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                title={form.isActive ? 'Active (click to deactivate)' : 'Deactive (click to activate)'}
                className="inline-flex items-center cursor-pointer focus:outline-none select-none"
              >
                <span className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-colors duration-200 border ${
                  form.isActive ? 'bg-emerald-500/30 border-emerald-400/50' : 'bg-slate-700/60 border-slate-500/40'
                }`}>
                  <span className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    form.isActive ? 'translate-x-4.5 bg-emerald-400' : 'translate-x-0 bg-slate-400'
                  }`} />
                </span>
              </button>
            </div>

            {formErr && <p className="text-xs text-red-400">{formErr}</p>}
            <div className="flex gap-3 pt-1">
              <button onClick={closeModal} className="flex-1 rounded-lg border border-white/20 text-sm text-white/90 hover:text-white py-2.5 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 transition-colors">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'view' && selected && (
        <Modal title="Subscriber Details" onClose={closeModal}>
          <div className="space-y-0 divide-y divide-white/10">
            {[
              ['Name', selected.name],
              ['Email', selected.email],
              ['Status', selected.isActive !== false ? 'Active' : 'Deactive'],
              ['City', selected.city],
              ['Phone', selected.phone],
              ['Created By', selected.createdBy || 'User'],
              ['Created At', fmt(selected.createdAt)],
              ['Updated By', selected.updatedBy || 'User'],
              ['Updated At', fmt(selected.updatedAt || selected.createdAt)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2.5">
                <span className="text-xs text-sky-200/90 font-semibold w-24 shrink-0">{k}</span>
                <span className={`text-sm text-right break-all ${
                  k === 'Status'
                    ? (v === 'Active' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold')
                    : 'text-white'
                }`}>{v}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { closeModal(); openEdit(selected); }}
              className="flex-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 transition-colors">Edit</button>
            <button onClick={() => { closeModal(); openDelete(selected); }}
              className="flex-1 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm py-2.5 transition-colors">Delete</button>
          </div>
        </Modal>
      )}

      {modal === 'delete' && selected && (
        <Modal title="Delete Subscriber" onClose={closeModal}>
          <p className="text-sm text-white/90">Remove <span className="text-white font-medium">{selected.name}</span>? This cannot be undone.</p>
          {formErr && <p className="text-xs text-red-400">{formErr}</p>}
          <div className="flex gap-3">
            <button onClick={closeModal} className="flex-1 rounded-lg border border-white/20 text-sm text-white/90 hover:text-white py-2.5 transition-colors">Cancel</button>
            <button onClick={handleDelete} disabled={saving}
              className="flex-1 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 transition-colors">
              {saving ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── Messages Tab ───────────────────────────────────────────── */
function MessagesTab({ token }) {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Email Reply Modal State
  const [replyModal, setReplyModal] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replyResult, setReplyResult] = useState(null);

  const limit = 8;
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ search, category: catFilter, page, limit });
      const res = await axios.get(`/api/admin/messages?${q}`, auth);
      if (res.data?.success) { setRows(res.data.data.messages); setTotal(res.data.data.total); }
    } catch { } finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, catFilter, page, token]);

  useEffect(() => { load(); }, [load]);

  const openView = (r) => { setSelected(r); setModal('view'); };
  const openDelete = (r) => { setSelected(r); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const openReplyModal = (r) => {
    setReplyTarget(r);
    setReplyText('');
    setReplyResult(null);
    setReplyModal(true);
  };
  const closeReplyModal = () => {
    setReplyModal(false);
    setReplyTarget(null);
    setReplyText('');
    setReplyResult(null);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      setReplyResult({ success: false, message: 'Please enter a reply message.' });
      return;
    }
    setSendingReply(true);
    setReplyResult(null);
    try {
      const res = await axios.post(
        '/api/admin/reply-message',
        {
          messageId: replyTarget._id,
          toEmail: replyTarget.email,
          name: replyTarget.name,
          category: replyTarget.category,
          originalMessage: replyTarget.message,
          replyText: replyText.trim(),
        },
        auth
      );

      setReplyResult({
        success: res.data?.success,
        message: res.data?.message || 'Reply email sent successfully!',
      });

      if (res.data?.success) {
        load();
        setTimeout(() => {
          closeReplyModal();
        }, 1500);
      }
    } catch (e) {
      setReplyResult({
        success: false,
        message: e.response?.data?.message || 'Failed to send reply email.',
      });
    } finally {
      setSendingReply(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await axios.delete(`/api/admin/messages?id=${selected._id}`, auth); closeModal(); load(); }
    catch { } finally { setDeleting(false); }
  };


  const pages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <input
          placeholder="Search name, email or message…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className={`${inputCls} flex-1`}
          style={inputStyle}
        />
        <select
          value={catFilter}
          onChange={e => { setCatFilter(e.target.value); setPage(1); }}
          className={`${inputCls} sm:w-auto`}
          style={inputStyle}
        >
          <option value="" style={{ background: '#1e3b72', color: '#ffffff' }}>All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#1e3b72', color: '#ffffff' }}>{c}</option>)}
        </select>
      </div>

      {/* Desktop Table – hidden on mobile */}
      <div style={cardStyle} className="rounded-xl overflow-hidden hidden sm:block">
        <div className="grid grid-cols-[1fr_1fr_1.5fr_auto] text-xs text-sky-200/90 font-semibold uppercase tracking-wider px-4 py-2.5 border-b border-white/10">
          <span>Name</span><span>Category</span><span>Email</span><span className="text-right">Actions</span>
        </div>
        {loading ? (
          <div className="divide-y divide-white/5">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1.5fr_auto] items-center px-4 py-3.5">
                <div className="h-4 bg-white/10 rounded-md skeleton w-3/4" />
                <div className="h-4 bg-white/10 rounded-md skeleton w-2/3" />
                <div className="h-4 bg-white/10 rounded-md skeleton w-4/5" />
                <div className="flex gap-2 justify-end">
                  <div className="h-5 bg-white/10 rounded-md skeleton w-5" />
                  <div className="h-5 bg-white/10 rounded-md skeleton w-5" />
                  <div className="h-5 bg-white/10 rounded-md skeleton w-5" />
                </div>
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-white/70 px-4 py-6">No messages found.</p>
        ) : rows.map(r => (
          <div key={r._id} className="grid grid-cols-[1fr_1fr_1.5fr_auto] items-center px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors">
            <span className="text-sm text-white font-medium truncate pr-2">{r.name}</span>
            <span className="text-xs text-indigo-300 font-medium truncate pr-2">{r.category}</span>
            <span className="text-sm text-white/80 truncate pr-2">{r.email}</span>
            <div className="flex items-center gap-1.5 justify-end">
              {r.isReplied ? (
                <span title="Replied" className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle size={13} /> Replied
                </span>
              ) : (
                <button
                  onClick={() => openReplyModal(r)}
                  title="Reply via Email"
                  className="p-1.5 rounded-lg text-indigo-300 hover:text-indigo-200 hover:bg-white/10 transition-colors"
                >
                  <Send size={16} />
                </button>
              )}
              <button
                onClick={() => openView(r)}
                title="View Message Details"
                className="p-1.5 rounded-lg text-sky-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => openDelete(r)}
                title="Delete Message"
                className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Card List – shown only on mobile */}
      <div className="sm:hidden space-y-2">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={cardStyle} className="p-4 rounded-xl skeleton h-32" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-white/70 py-4">No messages found.</p>
        ) : rows.map(r => (
          <div key={r._id} style={cardStyle} className="rounded-xl p-4 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{r.name}</p>
                <p className="text-xs text-sky-100/90 truncate">{r.email}</p>
              </div>
              <span className="text-xs text-indigo-200 bg-white/10 border border-white/15 px-2.5 py-0.5 rounded-full shrink-0 text-right font-medium">{r.category}</span>
            </div>
            {r.message && (
              <p className="text-xs text-white/90 leading-relaxed line-clamp-2">{r.message}</p>
            )}
            <div className="flex items-center justify-between pt-2.5 border-t border-white/10">
              {r.isReplied ? (
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle size={12} /> Replied
                </span>
              ) : (
                <button
                  onClick={() => openReplyModal(r)}
                  title="Reply via Email"
                  className="p-1.5 rounded-lg text-indigo-300 hover:text-indigo-200 hover:bg-white/10 transition-colors"
                >
                  <Send size={16} />
                </button>
              )}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openView(r)}
                  title="View Message Details"
                  className="p-1.5 rounded-lg text-sky-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => openDelete(r)}
                  title="Delete Message"
                  className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-sky-100 font-medium pt-2">
        <span className="text-sky-100/90 font-semibold">{total} total</span>
        <div className="flex gap-1.5 items-center">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 rounded-lg text-white font-medium border border-white/15 bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:border-white/5 disabled:bg-transparent transition-all"
          >
            ← Prev
          </button>
          <span className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-white font-bold">{page} / {pages || 1}</span>
          <button
            disabled={page >= pages}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 rounded-lg text-white font-medium border border-white/15 bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:border-white/5 disabled:bg-transparent transition-all"
          >
            Next →
          </button>
        </div>
      </div>

      {/* View Modal */}
      {modal === 'view' && selected && (
        <Modal title="Contact Message" onClose={closeModal}>
          <div className="space-y-0 divide-y divide-white/5">
            {[['Name', selected.name], ['Email', selected.email], ['Category', selected.category], ['Date', fmt(selected.createdAt)]].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2.5 gap-3">
                <span className="text-xs text-gray-600 shrink-0 w-20">{k}</span>
                <span className="text-sm text-white text-right break-all">{v}</span>
              </div>
            ))}
            <div className="py-3">
              <p className="text-xs text-gray-600 mb-1.5">Message</p>
              <p className="text-sm text-gray-300 leading-relaxed">{selected.message}</p>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            {selected.isReplied ? (
              <button disabled className="flex-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-sm font-medium py-2.5 cursor-not-allowed">
                ✓ Already Replied
              </button>
            ) : (
              <button
                onClick={() => {
                  const msg = selected;
                  closeModal();
                  openReplyModal(msg);
                }}
                className="flex-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 transition-colors"
              >
                Reply
              </button>
            )}
            <button
              onClick={() => { closeModal(); openDelete(selected); }}
              className="flex-1 rounded-lg border border-red-500/25 text-red-400 hover:bg-red-500/10 text-sm py-2.5 transition-colors"
            >
              Delete Message
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && selected && (
        <Modal title="Delete Message" onClose={closeModal}>
          <p className="text-sm text-gray-400">Delete message from <span className="text-white font-medium">{selected.name}</span>? This cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={closeModal} className="flex-1 rounded-lg border border-white/10 text-sm text-gray-400 hover:text-white py-2.5 transition-colors">Cancel</button>
            <button onClick={handleDelete} disabled={deleting}
              className="flex-1 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 transition-colors">
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}

      {/* Email Reply Prompt Modal */}
      {replyModal && replyTarget && (
        <Modal title="Reply to Contact Message" onClose={closeReplyModal}>
          <div className="space-y-3.5">
            {/* Recipient Header Info */}
            <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} className="rounded-xl p-3 text-xs space-y-1">
              <p className="text-sky-200"><span className="text-white/60">To:</span> <strong className="text-white font-medium">{replyTarget.name}</strong> ({replyTarget.email})</p>
              <p className="text-sky-200"><span className="text-white/60">Category:</span> <strong className="text-indigo-300 font-medium">{replyTarget.category}</strong></p>
            </div>

            {/* Original Message Quote */}
            {replyTarget.message && (
              <div className="bg-black/20 border-l-2 border-indigo-400 p-2.5 rounded text-xs text-white/80 space-y-1">
                <p className="text-[10px] text-white/50 uppercase font-semibold">Original Message:</p>
                <p className="italic line-clamp-3">{replyTarget.message}</p>
              </div>
            )}

            {/* Textarea for Reply Message */}
            <div className="space-y-1">
              <label className="text-xs text-sky-200 font-medium">Reply Message (Sent via Email)</label>
              <textarea
                value={replyText}
                onChange={(e) => { setReplyText(e.target.value); setReplyResult(null); }}
                placeholder="Type your reply message here…"
                rows={5}
                className={`${inputCls} resize-none leading-relaxed`}
                style={inputStyle}
                autoFocus
              />
            </div>

            {/* Result banner */}
            {replyResult && (
              <div
                style={{
                  background: replyResult.success ? 'rgba(52,211,153,0.12)' : 'rgba(239,68,68,0.12)',
                  border: `1px solid ${replyResult.success ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'}`,
                }}
                className="rounded-lg px-3 py-2 text-xs flex items-center gap-2"
              >
                <span className={replyResult.success ? 'text-emerald-300 font-medium' : 'text-red-300 font-medium'}>
                  {replyResult.message}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-1">
              <button onClick={closeReplyModal} className="flex-1 rounded-lg border border-white/20 text-sm text-white/80 hover:text-white py-2.5 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSendReply}
                disabled={sendingReply || !replyText.trim()}
                className="flex-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 transition-colors shadow-md shadow-indigo-900/30"
              >
                {sendingReply ? 'Sending Email…' : 'Send Reply'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── Broadcast Tab ──────────────────────────────────────────── */
function BroadcastTab({ token, initialSelectedSub, initialSearch, initialMessage, initialTarget }) {
  const [target, setTarget] = useState('all_active');
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [subscribers, setSubscribers] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (initialTarget) setTarget(initialTarget);
    if (initialSelectedSub) {
      setSelectedSub(initialSelectedSub);
      setDropdownOpen(false);
    }
    if (initialSearch) { setSubscriberSearch(initialSearch); setDropdownOpen(true); }
    if (initialMessage) setMessage(initialMessage);
  }, [initialSelectedSub, initialSearch, initialMessage, initialTarget]);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (target !== 'specific') { setSubscribers([]); setSelectedSub(null); setSubscriberSearch(''); return; }
    let canceled = false;
    const fetch = async () => {
      setLoadingSubs(true);
      try {
        const q = new URLSearchParams({ search: subscriberSearch, page: 1, limit: 20 });
        const res = await axios.get(`/api/admin/subscribers?${q}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!canceled && res.data?.success) setSubscribers(res.data.data.subscribers);
      } catch { }
      finally { if (!canceled) setLoadingSubs(false); }
    };
    fetch();
    return () => { canceled = true; };
  }, [target, subscriberSearch, token]);

  const handleSend = async () => {
    if (!message.trim()) { setResult({ success: false, message: 'Please enter a message.' }); return; }
    if (target === 'specific' && !selectedSub) { setResult({ success: false, message: 'Please select a subscriber.' }); return; }
    setSending(true); setResult(null);
    try {
      const payload = {
        message: message.trim(),
        target,
        ...(target === 'specific' ? { subscriberId: selectedSub._id } : {}),
      };
      const res = await axios.post('/api/admin/broadcast', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResult({ success: res.data.success, message: res.data.message });
      if (res.data.success) setMessage('');
    } catch (e) {
      setResult({ success: false, message: e.response?.data?.message || 'Failed to send message.' });
    } finally { setSending(false); }
  };

  return (
    <div className="space-y-5 sm:space-y-6 w-full sm:max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white">Send Message</h2>
        <p className="text-sm text-sky-100/90 mt-0.5">Send a custom WhatsApp message to a subscriber or all subscribers. Use <code className="text-sky-300 bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono">{'{name}'}</code> to personalise with their name.</p>
      </div>

      {/* Target selector */}
      <div style={cardStyle} className="rounded-xl p-4 sm:p-5 space-y-4 relative z-20">
        <p className="text-xs text-sky-200/90 uppercase tracking-widest font-semibold">Recipients</p>
        <div className="flex flex-row gap-2 sm:gap-3">
          {[
            ['all_active', 'All Active'],
            ['all_deactive', 'All Deactive'],
            ['specific', 'Specific Subscriber']
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => { setTarget(val); setResult(null); }}
              className={`flex-1 py-2.5 px-2.5 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-all border ${target === val
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/40'
                  : 'border-white/15 text-white/70 hover:text-white hover:bg-white/10'
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Specific subscriber picker */}
        {target === 'specific' && (
          <div className="space-y-2" ref={dropdownRef}>
            <label className="text-xs text-sky-200">Search subscriber</label>
            <div className="relative">
              <input
                value={selectedSub ? `${selectedSub.name} — ${selectedSub.phone}${selectedSub.isActive === false ? ' (Deactive)' : ''}` : subscriberSearch}
                onChange={e => { setSubscriberSearch(e.target.value); setSelectedSub(null); setDropdownOpen(true); }}
                onFocus={() => setDropdownOpen(true)}
                placeholder="Search by name or phone…"
                className={inputCls}
                style={inputStyle}
              />
              {selectedSub && (
                <button
                  onClick={() => { setSelectedSub(null); setSubscriberSearch(''); setDropdownOpen(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-xs transition-colors"
                >✕</button>
              )}

              {dropdownOpen && !selectedSub && (
                <div
                  style={{ background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.25)' }}
                  className="absolute z-50 top-full mt-1.5 w-full rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                >
                  {loadingSubs ? (
                    <p className="text-xs text-white/70 px-4 py-3">Loading…</p>
                  ) : subscribers.length === 0 ? (
                    <p className="text-xs text-white/70 px-4 py-3">No subscribers found.</p>
                  ) : subscribers.map(s => (
                    <button
                      key={s._id}
                      onClick={() => { setSelectedSub(s); setDropdownOpen(false); setSubscriberSearch(''); }}
                      className={`w-full text-left px-4 py-3 text-sm border-b border-white/5 last:border-0 transition-colors flex justify-between items-center gap-2 ${
                        s.isActive === false
                          ? 'bg-rose-950/20 hover:bg-rose-900/40 text-rose-100'
                          : 'text-white/90 hover:bg-indigo-600/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium text-white truncate">{s.name}</span>
                        {s.isActive === false ? (
                          <span className="text-[10px] uppercase font-bold text-rose-300 bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded-full shrink-0">Deactive</span>
                        ) : (
                          <span className="text-[10px] uppercase font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">Active</span>
                        )}
                      </div>
                      <span className={`text-xs font-mono shrink-0 ${s.isActive === false ? 'text-rose-300/80' : 'text-sky-300'}`}>{s.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedSub && (
              <div
                style={{
                  background: selectedSub.isActive === false ? 'rgba(244, 63, 94, 0.12)' : 'rgba(255,255,255,0.12)',
                  border: selectedSub.isActive === false ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(255,255,255,0.2)',
                }}
                className="rounded-lg px-4 py-3 flex flex-wrap justify-between items-center gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-white font-medium">{selectedSub.name}</p>
                    {selectedSub.isActive === false ? (
                      <span className="text-[10px] uppercase font-bold text-rose-300 bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded-full shrink-0">Deactive</span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">Active</span>
                    )}
                  </div>
                  <p className="text-xs text-sky-300 truncate">{selectedSub.email} · {selectedSub.phone}</p>
                </div>
                <span className="text-xs text-indigo-200 bg-indigo-500/20 px-2 py-0.5 rounded-full shrink-0 font-medium">{selectedSub.city}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Message composer */}
      <div style={cardStyle} className="rounded-xl p-4 sm:p-5 space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <p className="text-xs text-sky-200/90 uppercase tracking-widest font-semibold">Message</p>
          <span className={`text-xs ${message.length > 1500 ? 'text-red-400' : 'text-white/80'}`}>{message.length} / 1600</span>
        </div>
        <textarea
          value={message}
          onChange={e => { setMessage(e.target.value); setResult(null); }}
          placeholder={`Hi {name},\n\nType your custom message here…`}
          rows={6}
          maxLength={1600}
          className={`${inputCls} resize-none leading-relaxed`}
          style={inputStyle}
        />
        <p className="text-xs text-sky-100/80">Tip: <code className="text-sky-300 font-mono">{'{name}'}</code> will be replaced with each subscriber's name automatically.</p>
      </div>

      {/* Result banner */}
      {result && (
        <div
          style={{
            background: result.success ? 'rgba(52,211,153,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${result.success ? 'rgba(52,211,153,0.25)' : 'rgba(239,68,68,0.25)'}`,
          }}
          className="rounded-xl px-4 py-3 flex items-start gap-3"
        >
          {result.success
            ? <CheckCircle size={18} className="text-emerald-400 mt-0.5 shrink-0" />
            : <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />}
          <p className={`text-sm ${result.success ? 'text-emerald-300' : 'text-red-300'}`}>{result.message}</p>
        </div>
      )}

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={sending || !message.trim() || (target === 'specific' && !selectedSub)}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 transition-all shadow-lg shadow-indigo-900/30"
      >
        <Send size={16} />
        {sending
          ? 'Sending…'
          : target === 'all_deactive'
          ? 'Send to All Deactive Subscribers'
          : target === 'specific'
          ? 'Send to Selected Subscriber'
          : 'Send to All Active Subscribers'}
      </button>
    </div>
  );
}

/* ─── Admins Tab ─────────────────────────────────────────────── */
function AdminsTab({ token, currentUser }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [formErr, setFormErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/admins', { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.success) setAdmins(res.data.data);
    } catch { } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.username.trim() || !form.password.trim()) { setFormErr('Username and password are required.'); return; }
    if (form.password.length < 6) { setFormErr('Password must be at least 6 characters.'); return; }
    setSaving(true); setFormErr('');
    try {
      await axios.post('/api/admin/admins', form, { headers: { Authorization: `Bearer ${token}` } });
      setModal(false);
      setForm({ username: '', email: '', password: '' });
      load();
    } catch (e) { setFormErr(e.response?.data?.message || 'Error creating admin.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`/api/admin/admins?id=${deleteTarget._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setDeleteTarget(null);
      load();
    } catch (e) { alert(e.response?.data?.message || 'Error deleting admin.'); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">Admin Accounts</h2>
          <p className="text-xs text-sky-100/80 mt-0.5">Manage who has access to this dashboard.</p>
        </div>
        <button
          onClick={() => { setForm({ username: '', email: '', password: '' }); setFormErr(''); setModal(true); }}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium p-2.5 sm:px-4 sm:py-2 transition-colors shrink-0 shadow-lg shadow-indigo-900/30"
          title="Add Admin"
          aria-label="Add Admin"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Admin</span>
        </button>
      </div>

      {/* Table */}
      <div style={cardStyle} className="rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_1.2fr_1fr_auto] text-xs text-sky-200/90 font-semibold uppercase tracking-wider px-4 py-2.5 border-b border-white/10">
          <span>Username</span>
          <span className="hidden sm:block">Email</span>
          <span className="hidden md:block">Created By</span>
          <span className="text-right">Actions</span>
        </div>
        {loading ? (
          <div className="divide-y divide-white/5">
            {[1, 2, 3].map(i => (
              <div key={i} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_1.2fr_1fr_auto] items-center px-4 py-3.5 gap-2">
                <div className="h-4 bg-white/10 rounded-md skeleton w-3/4" />
                <div className="h-4 bg-white/10 rounded-md skeleton w-4/5 hidden sm:block" />
                <div className="h-4 bg-white/10 rounded-md skeleton w-1/2 hidden md:block" />
                <div className="flex justify-end">
                  <div className="h-5 bg-white/10 rounded-md skeleton w-5" />
                </div>
              </div>
            ))}
          </div>
        ) : admins.length === 0 ? (
          <p className="text-sm text-white/70 px-4 py-6">No admins found.</p>
        ) : admins.map(a => (
          <div key={a._id} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_1.2fr_1fr_auto] items-center px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors gap-2">
            <div className="flex items-center gap-2 truncate pr-2">
              <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                <UserCog size={13} className="text-indigo-300" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 truncate">
                <span className="text-sm text-white font-medium truncate">{a.username}</span>
                {a.username === currentUser && (
                  <span className="text-[10px] sm:text-xs text-indigo-200 bg-indigo-500/20 px-2 py-0.5 rounded-full w-fit font-medium">You</span>
                )}
                {a.email && (
                  <span className="text-xs text-white/70 sm:hidden truncate">{a.email}</span>
                )}
              </div>
            </div>
            <span className="text-xs text-white/85 truncate pr-2 hidden sm:block">{a.email || '—'}</span>
            <span className="text-xs text-white/80 truncate pr-2 hidden md:block">{a.createdBy}</span>
            <div className="flex items-center justify-end">
              {a.username !== currentUser ? (
                <button
                  onClick={() => setDeleteTarget(a)}
                  title="Remove Admin Account"
                  className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              ) : (
                <span className="text-xs text-white/40 pr-2">—</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Admin Modal */}
      {modal && (
        <Modal title="Add New Admin" onClose={() => setModal(false)}>
          <p className="text-xs text-white/80 -mt-1">The new admin will be able to log in with their username or email.</p>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-sky-200 font-medium">Username</label>
              <input
                value={form.username}
                onChange={e => { setForm(p => ({ ...p, username: e.target.value })); setFormErr(''); }}
                placeholder="e.g. john_doe"
                className={inputCls} style={inputStyle}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-sky-200 font-medium">Email Address (Optional)</label>
              <input
                type="email"
                value={form.email}
                onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setFormErr(''); }}
                placeholder="e.g. admin@example.com"
                className={inputCls} style={inputStyle}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-sky-200 font-medium">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setFormErr(''); }}
                placeholder="Min. 6 characters"
                className={inputCls} style={inputStyle}
              />
            </div>
            {formErr && <p className="text-xs text-red-400">{formErr}</p>}
            <div className="flex gap-3 pt-1">
              <button onClick={() => setModal(false)} className="flex-1 rounded-lg border border-white/20 text-sm text-white/80 hover:text-white py-2.5 transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={saving}
                className="flex-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 transition-colors">
                {saving ? 'Creating…' : 'Create Admin'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <Modal title="Remove Admin" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-white/80">Remove <span className="text-white font-medium">{deleteTarget.username}</span> from admin access? They will no longer be able to log in.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteTarget(null)} className="flex-1 rounded-lg border border-white/20 text-sm text-white/80 hover:text-white py-2.5 transition-colors">Cancel</button>
            <button onClick={handleDelete} disabled={deleting}
              className="flex-1 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 transition-colors">
              {deleting ? 'Removing…' : 'Remove'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── Dashboard Shell ─────────────────────────────────────────── */

const TABS = [
  { key: 'overview', label: 'Overview', Icon: LayoutDashboard },
  { key: 'subscribers', label: 'Users', Icon: Users },
  { key: 'messages', label: 'Contact Messages', Icon: MessageSquare },
  { key: 'broadcast', label: 'Send Message', Icon: Radio },
  { key: 'admins', label: 'Admin Accounts', Icon: ShieldCheck },
];

function DashboardShell({ onLock, token, username }) {
  const [tab, setTab] = useState('overview');
  const [replySub, setReplySub] = useState(null);
  const [replySearch, setReplySearch] = useState('');
  const [replyMsg, setReplyMsg] = useState('');

  const handleReplyToMessage = async (msg) => {
    try {
      const res = await axios.get(`/api/admin/subscribers?search=${encodeURIComponent(msg.email)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const foundSubs = res.data?.data?.subscribers || [];
      const matched = foundSubs.find(s => s.email?.toLowerCase() === msg.email?.toLowerCase()) || foundSubs[0] || null;

      if (matched) {
        setReplySub(matched);
        setReplySearch('');
      } else {
        setReplySub(null);
        setReplySearch(msg.email || msg.name || '');
      }

      const nameToUse = matched ? '{name}' : msg.name;
      setReplyMsg(`Hi ${nameToUse},\n\nRegarding your message about "${msg.category}":\n\n`);
    } catch {
      setReplySub(null);
      setReplySearch(msg.email || msg.name || '');
      setReplyMsg(`Hi ${msg.name},\n\nRegarding your message about "${msg.category}":\n\n`);
    }
    setTab('broadcast');
  };

  return (
    <div className="min-h-screen py-8 sm:py-14 px-3 sm:px-4 text-white">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-indigo-300 font-semibold uppercase tracking-widest mb-1">Admin</p>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <UserCog size={13} className="text-sky-300" />
              <span className="text-xs text-white font-medium">{username}</span>
            </div>
            <button
              onClick={onLock}
              className="flex items-center gap-1.5 text-xs text-white/90 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/20 hover:border-white/30 bg-white/10 hover:bg-white/20"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>

        {/* Tab bar – scrollable on mobile */}
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <div className="flex gap-0 border-b border-white/10 pb-0 min-w-max sm:min-w-0 px-3 sm:px-0">
            {TABS.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                title={label}
                aria-label={label}
                className={`flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${tab === key ? 'border-indigo-400 text-white font-semibold' : 'border-transparent text-white/70 hover:text-white'
                  }`}
              >
                <Icon size={18} className="shrink-0 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="pb-8">
          {tab === 'overview' && <OverviewTab token={token} />}
          {tab === 'subscribers' && <SubscribersTab token={token} />}
          {tab === 'messages' && <MessagesTab token={token} />}
          {tab === 'broadcast' && <BroadcastTab token={token} />}
          {tab === 'admins' && <AdminsTab token={token} currentUser={username} />}
        </div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function DashboardPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [checking, setChecking] = useState(true);

  // On mount: try to restore session from stored JWT
  useEffect(() => {
    const storedToken = sessionStorage.getItem('admin_token');
    const storedUsername = sessionStorage.getItem('admin_username');
    if (!storedToken) { setChecking(false); return; }

    // Verify stored token is still valid
    axios.get('/api/admin/me', { headers: { Authorization: `Bearer ${storedToken}` } })
      .then(res => {
        if (res.data?.success) {
          setToken(storedToken);
          setUsername(storedUsername || res.data.username);
          setUnlocked(true);
        }
      })
      .catch(() => {
        sessionStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_username');
      })
      .finally(() => setChecking(false));
  }, []);

  const handleUnlock = (jwt, uname) => {
    setToken(jwt);
    setUsername(uname);
    setUnlocked(true);
  };

  const lock = () => {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_username');
    setToken('');
    setUsername('');
    setUnlocked(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!unlocked) return <LoginGate onUnlock={handleUnlock} />;
  return <DashboardShell onLock={lock} token={token} username={username} />;
}
