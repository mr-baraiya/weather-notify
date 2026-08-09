'use client';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Mail } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = ['General Inquiry','Bug Report','Feature Request','WhatsApp Connection Issue','Alert / Notification Issue','Other'];

/* ─── helpers ──────────────────────────────────────────────────── */
const cardStyle = { background: '#0f1629', border: '1px solid rgba(255,255,255,0.07)' };
const inputStyle = { background: '#080e1f', border: '1px solid rgba(255,255,255,0.08)' };
const inputCls = 'w-full rounded-lg px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none';

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

/* ─── Password Gate ──────────────────────────────────────────── */
function PasswordGate({ onUnlock }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!pw.trim()) { setErr('Enter your password.'); return; }
    setLoading(true); setErr('');
    try {
      const res = await axios.post('/api/admin/verify', { password: pw });
      if (res.data?.success) { 
        sessionStorage.setItem('admin_auth', '1'); 
        onUnlock(pw); // pass password up to be used for api calls 
      }
      else setErr('Incorrect password.');
    } catch { setErr('Incorrect password.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-white">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-2">Admin</p>
          <h1 className="text-2xl font-bold">Dashboard access</h1>
          <p className="text-sm text-gray-500 mt-1">Enter the admin password to continue.</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            name="password"
            id="admin-password"
            placeholder="Password"
            value={pw}
            autoFocus
            autoComplete="current-password"
            onChange={e => { setPw(e.target.value); setErr(''); }}
            className={inputCls}
            style={{ ...inputStyle, border: `1px solid ${err ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}` }}
          />
          {err && <p className="text-xs text-red-400">{err}</p>}
          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 transition-colors">
            {loading ? 'Verifying…' : 'Access Dashboard'}
          </button>
        </form>
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Not an admin?{' '}
            <Link href="/contact" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Contact the admin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal ──────────────────────────────────────────────────── */
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div style={cardStyle} className="w-full max-w-md rounded-2xl p-6 text-white space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-300 text-lg leading-none transition-colors">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── Overview Tab ───────────────────────────────────────────── */
function OverviewTab({ password }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let canceled = false;
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('/api/admin/analytics', {
          headers: { Authorization: `Bearer ${password}` }
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
  }, [password]);

  if (loading) {
    return <p className="text-sm text-gray-400 py-10">Loading analytics...</p>;
  }

  if (!data) {
    return <p className="text-sm text-red-400 py-10">Failed to load analytics data.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div style={cardStyle} className="p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Total Subscribers</p>
            <p className="text-3xl font-bold text-white">{data.totalSubscribers}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Users size={24} />
          </div>
        </div>
        <div style={cardStyle} className="p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Total Messages</p>
            <p className="text-3xl font-bold text-white">{data.totalMessages}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
            <Mail size={24} />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Growth Line Chart */}
        <div style={cardStyle} className="p-6 rounded-xl space-y-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-white">Platform Growth (Last 14 Days)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.growth} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f1629', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="newSubscribers" name="New Subs" stroke="#ffffff" strokeWidth={3} dot={{ r: 4, fill: '#ffffff', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="newMessages" name="New Messages" stroke="#9ca3af" strokeWidth={3} dot={{ r: 4, fill: '#9ca3af', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Cities Bar Chart */}
        <div style={cardStyle} className="p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-semibold text-white">Top Cities</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topCities} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#0f1629', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Bar dataKey="subscribers" name="Subscribers" fill="#60a5fa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Message Categories Bar Chart */}
        <div style={cardStyle} className="p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-semibold text-white">Message Categories</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.messagesByCategory} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#0f1629', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
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
function SubscribersTab() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // 'create' | 'edit' | 'view' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', city: '', phone: '', email: '' });
  const [formErr, setFormErr] = useState('');
  const [saving, setSaving] = useState(false);
  const limit = 8;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ search, city: cityFilter, page, limit });
      const res = await axios.get(`/api/admin/subscribers?${q}`);
      if (res.data?.success) { setRows(res.data.data.subscribers); setTotal(res.data.data.total); }
    } catch { } finally { setLoading(false); }
  }, [search, cityFilter, page]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm({ name: '', city: '', phone: '', email: '' }); setFormErr(''); setModal('create'); };
  const openEdit   = (r) => { setSelected(r); setForm({ name: r.name, city: r.city, phone: r.phone, email: r.email }); setFormErr(''); setModal('edit'); };
  const openView   = (r) => { setSelected(r); setModal('view'); };
  const openDelete = (r) => { setSelected(r); setModal('delete'); };
  const closeModal = ()  => { setModal(null); setSelected(null); };

  const handleSave = async () => {
    if (!form.name || !form.city || !form.phone || !form.email) { setFormErr('All fields are required.'); return; }
    setSaving(true); setFormErr('');
    try {
      if (modal === 'create') {
        await axios.post('/api/admin/subscribers', form);
      } else {
        await axios.put('/api/admin/subscribers', { id: selected._id, ...form });
      }
      closeModal(); load();
    } catch (e) { setFormErr(e.response?.data?.message || 'Error saving.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await axios.delete(`/api/admin/subscribers?id=${selected._id}`); closeModal(); load(); }
    catch (e) { setFormErr(e.response?.data?.message || 'Error deleting.'); }
    finally { setSaving(false); }
  };

  const pages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input placeholder="Search name or phone…" value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className={`${inputCls} flex-1`} style={inputStyle} />
        <input placeholder="Filter by city…" value={cityFilter}
          onChange={e => { setCityFilter(e.target.value); setPage(1); }}
          className={`${inputCls} w-40`} style={inputStyle} />
        <button onClick={openCreate}
          className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 transition-colors whitespace-nowrap">
          + New User
        </button>
      </div>

      {/* Table */}
      <div style={cardStyle} className="rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr_auto] text-xs text-gray-600 uppercase tracking-wider px-4 py-2.5 border-b border-white/5">
          <span>Name</span><span>Email</span><span>City</span><span>Phone</span><span className="text-right">Actions</span>
        </div>
        {loading ? (
          <p className="text-sm text-gray-600 px-4 py-6">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-600 px-4 py-6">No subscribers found.</p>
        ) : rows.map(r => (
          <div key={r._id} className="grid grid-cols-[1fr_1.5fr_1fr_1fr_auto] items-center px-4 py-3 border-b border-white/4 hover:bg-white/2 transition-colors">
            <span className="text-sm text-white truncate">{r.name}</span>
            <span className="text-sm text-gray-400 truncate">{r.email}</span>
            <span className="text-sm text-gray-400 truncate">{r.city}</span>
            <span className="text-sm text-gray-400 truncate">{r.phone}</span>
            <div className="flex gap-3 justify-end">
              <button onClick={() => openView(r)} className="text-xs text-gray-500 hover:text-white transition-colors">View</button>
              <button onClick={() => openEdit(r)} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Edit</button>
              <button onClick={() => openDelete(r)} className="text-xs text-red-500 hover:text-red-400 transition-colors">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>{total} total</span>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 rounded disabled:opacity-30 hover:text-white transition-colors">← Prev</button>
          <span className="px-2 py-1">{page} / {pages || 1}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 rounded disabled:opacity-30 hover:text-white transition-colors">Next →</button>
        </div>
      </div>

      {/* Modals */}
      {(modal === 'create' || modal === 'edit') && (
        <Modal title={modal === 'create' ? 'New Subscriber' : 'Edit Subscriber'} onClose={closeModal}>
          <div className="space-y-3">
            {['name','email','city','phone'].map(f => (
              <div key={f} className="space-y-1">
                <label className="text-xs text-gray-600 capitalize">{f}</label>
                <input value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
                  placeholder={f === 'phone' ? '+91XXXXXXXXXX' : `Enter ${f}`}
                  className={inputCls} style={inputStyle} />
              </div>
            ))}
            {formErr && <p className="text-xs text-red-400">{formErr}</p>}
            <div className="flex gap-3 pt-1">
              <button onClick={closeModal} className="flex-1 rounded-lg border border-white/10 text-sm text-gray-400 hover:text-white py-2 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium py-2 transition-colors">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'view' && selected && (
        <Modal title="Subscriber Details" onClose={closeModal}>
          <div className="space-y-2 divide-y divide-white/5">
            {[['Name', selected.name], ['Email', selected.email], ['City', selected.city], ['Phone', selected.phone], ['Joined', fmt(selected.createdAt)]].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2">
                <span className="text-xs text-gray-600">{k}</span>
                <span className="text-sm text-white">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { closeModal(); openEdit(selected); }}
              className="flex-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2 transition-colors">Edit</button>
            <button onClick={() => { closeModal(); openDelete(selected); }}
              className="flex-1 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm py-2 transition-colors">Delete</button>
          </div>
        </Modal>
      )}

      {modal === 'delete' && selected && (
        <Modal title="Delete Subscriber" onClose={closeModal}>
          <p className="text-sm text-gray-400">Remove <span className="text-white font-medium">{selected.name}</span>? This cannot be undone.</p>
          {formErr && <p className="text-xs text-red-400">{formErr}</p>}
          <div className="flex gap-3">
            <button onClick={closeModal} className="flex-1 rounded-lg border border-white/10 text-sm text-gray-400 hover:text-white py-2 transition-colors">Cancel</button>
            <button onClick={handleDelete} disabled={saving}
              className="flex-1 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium py-2 transition-colors">
              {saving ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── Messages Tab ───────────────────────────────────────────── */
function MessagesTab() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const limit = 8;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ search, category: catFilter, page, limit });
      const res = await axios.get(`/api/admin/messages?${q}`);
      if (res.data?.success) { setRows(res.data.data.messages); setTotal(res.data.data.total); }
    } catch { } finally { setLoading(false); }
  }, [search, catFilter, page]);

  useEffect(() => { load(); }, [load]);

  const openView   = (r) => { setSelected(r); setModal('view'); };
  const openDelete = (r) => { setSelected(r); setModal('delete'); };
  const closeModal = ()  => { setModal(null); setSelected(null); };

  const handleDelete = async () => {
    setDeleting(true);
    try { await axios.delete(`/api/admin/messages?id=${selected._id}`); closeModal(); load(); }
    catch { } finally { setDeleting(false); }
  };

  const pages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input placeholder="Search name, email or message…" value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className={`${inputCls} flex-1`} style={inputStyle} />
        <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }}
          className={`${inputCls} w-auto`} style={inputStyle}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={cardStyle} className="rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_1.5fr_auto] text-xs text-gray-600 uppercase tracking-wider px-4 py-2.5 border-b border-white/5">
          <span>Name</span><span>Category</span><span>Email</span><span className="text-right">Actions</span>
        </div>
        {loading ? (
          <p className="text-sm text-gray-600 px-4 py-6">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-600 px-4 py-6">No messages found.</p>
        ) : rows.map(r => (
          <div key={r._id} className="grid grid-cols-[1fr_1fr_1.5fr_auto] items-center px-4 py-3 border-b border-white/4 hover:bg-white/2 transition-colors">
            <span className="text-sm text-white truncate">{r.name}</span>
            <span className="text-xs text-indigo-300 truncate">{r.category}</span>
            <span className="text-sm text-gray-400 truncate">{r.email}</span>
            <div className="flex gap-3 justify-end">
              <button onClick={() => openView(r)} className="text-xs text-gray-500 hover:text-white transition-colors">View</button>
              <button onClick={() => openDelete(r)} className="text-xs text-red-500 hover:text-red-400 transition-colors">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>{total} total</span>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 rounded disabled:opacity-30 hover:text-white transition-colors">← Prev</button>
          <span className="px-2 py-1">{page} / {pages || 1}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 rounded disabled:opacity-30 hover:text-white transition-colors">Next →</button>
        </div>
      </div>

      {/* View Modal */}
      {modal === 'view' && selected && (
        <Modal title="Contact Message" onClose={closeModal}>
          <div className="space-y-0 divide-y divide-white/5">
            {[['Name', selected.name], ['Email', selected.email], ['Category', selected.category], ['Date', fmt(selected.createdAt)]].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2.5">
                <span className="text-xs text-gray-600 shrink-0 w-20">{k}</span>
                <span className="text-sm text-white text-right">{v}</span>
              </div>
            ))}
            <div className="py-3">
              <p className="text-xs text-gray-600 mb-1.5">Message</p>
              <p className="text-sm text-gray-300 leading-relaxed">{selected.message}</p>
            </div>
          </div>
          <button onClick={() => { closeModal(); openDelete(selected); }}
            className="w-full rounded-lg border border-red-500/25 text-red-400 hover:bg-red-500/10 text-sm py-2 transition-colors">
            Delete Message
          </button>
        </Modal>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && selected && (
        <Modal title="Delete Message" onClose={closeModal}>
          <p className="text-sm text-gray-400">Delete message from <span className="text-white font-medium">{selected.name}</span>? This cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={closeModal} className="flex-1 rounded-lg border border-white/10 text-sm text-gray-400 hover:text-white py-2 transition-colors">Cancel</button>
            <button onClick={handleDelete} disabled={deleting}
              className="flex-1 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium py-2 transition-colors">
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── Dashboard Shell ─────────────────────────────────────────── */
function DashboardShell({ onLock, password }) {
  const [tab, setTab] = useState('overview');

  return (
    <div className="min-h-screen py-14 px-4 text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-1">Admin</p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          </div>
          <button onClick={onLock} className="text-xs text-gray-600 hover:text-gray-300 transition-colors mt-1">Lock →</button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 border-b border-white/6 pb-0">
          {[['overview', 'Overview'], ['subscribers', 'Users'], ['messages', 'Contact Messages']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === key ? 'border-indigo-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'overview' && <OverviewTab password={password} />}
        {tab === 'subscribers' && <SubscribersTab />}
        {tab === 'messages' && <MessagesTab />}
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function DashboardPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  useEffect(() => {
    // Restore session if previously authenticated in this browser session
    const stored = sessionStorage.getItem('admin_auth_pw');
    if (stored) {
      setAdminPassword(stored);
      setUnlocked(true);
    }
  }, []);

  const handleUnlock = (pw) => {
    // Store in sessionStorage so a page refresh doesn't log out the admin
    sessionStorage.setItem('admin_auth_pw', pw);
    setAdminPassword(pw);
    setUnlocked(true);
  };

  const lock = () => {
    sessionStorage.removeItem('admin_auth_pw');
    setAdminPassword('');
    setUnlocked(false);
  };

  if (!unlocked) return <PasswordGate onUnlock={handleUnlock} />;
  return <DashboardShell onLock={lock} password={adminPassword} />;
}
