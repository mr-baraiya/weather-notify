'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Eye, Download, Mail, Share2, Calendar, ArrowLeft, Loader2, Check } from 'lucide-react';

export default function PublicReportPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { city: rawCity, date: rawDate } = params;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const city = decodeURIComponent(rawCity || 'rajkot');
  const dateStr = rawDate || new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchReportData();
  }, [city, dateStr]);

  const fetchReportData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/weather/report?city=${encodeURIComponent(city)}&date=${dateStr}&format=json`);
      const data = await res.json();
      if (data.success && data.data) {
        setReport(data.data);
      } else {
        setError(data.message || 'Could not load weather report.');
      }
    } catch (err) {
      setError('Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleDownloadPdf = () => {
    window.open(`/api/weather/report?city=${encodeURIComponent(city)}&date=${dateStr}&format=pdf`, '_blank');
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailInput) return;
    setEmailSending(true);
    try {
      const res = await fetch('/api/weather/report/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, city, date: dateStr }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Report sent to your email!');
        setEmailModalOpen(false);
      } else {
        alert(data.message || 'Failed to send email.');
      }
    } catch (err) {
      alert('Error sending email.');
    } finally {
      setEmailSending(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = `Today's Weather Report — ${report?.city || city}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url: shareUrl });
        return;
      } catch (err) {
        // Fallback to copy link
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Report link copied to clipboard!');
    } catch (err) {
      showToast('Share URL: ' + shareUrl);
    }
  };

  return (
    <div className="min-h-screen text-white antialiased py-8 px-4 sm:px-6 relative overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          }}
          className="fixed bottom-6 right-6 z-50 text-white px-5 py-3.5 rounded-2xl border border-sky-400/30 flex items-center space-x-2.5 text-xs sm:text-sm font-semibold animate-fade-in"
        >
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-slate-100">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Home
          </Link>
          <span className="text-xs font-semibold text-sky-300 uppercase tracking-wider bg-white/10 border border-white/20 px-3 py-1 rounded-full backdrop-blur-md">
            Official Bulletin
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
            <Loader2 className="w-10 h-10 text-sky-400 animate-spin mb-3" />
            <p className="text-slate-200 font-semibold text-sm tracking-wide">Generating Weather Report...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
            <p className="text-red-400 font-semibold text-sm mb-4">{error}</p>
            <button onClick={fetchReportData} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all">
              Retry
            </button>
          </div>
        )}

        {/* Main Report View */}
        {report && !loading && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
            }}
            className="rounded-2xl text-white shadow-2xl overflow-hidden max-w-4xl mx-auto"
          >
            {/* Header Toolbar */}
            <div className="bg-white/5 p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-xs text-sky-400 font-extrabold uppercase tracking-wider">Weather Notify · Official Bulletin</span>
                <h1 className="text-2xl font-extrabold text-white mt-0.5">{report.city}{report.state ? `, ${report.state}` : ''}</h1>
                <p className="text-xs text-slate-300 font-medium mt-0.5">{report.dateStr}</p>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2">
                <button onClick={handleDownloadPdf} title="Download PDF" className="inline-flex items-center justify-center p-2.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all">
                  <Download className="w-3.5 h-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Download PDF</span>
                </button>
                <button onClick={() => setEmailModalOpen(true)} title="Email Report" className="inline-flex items-center justify-center p-2.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition-all backdrop-blur-md">
                  <Mail className="w-3.5 h-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Email Report</span>
                </button>
                <button onClick={handleShare} title="Share Report" className="inline-flex items-center justify-center p-2.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition-all backdrop-blur-md">
                  <Share2 className="w-3.5 h-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Today's Weather Overview Grid */}
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-sky-200/90 mb-3 border-l-2 border-sky-400 pl-2">Today's Weather</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                    <p className="text-[10px] font-medium text-sky-200/80 uppercase">Condition</p>
                    <p className="text-sm font-extrabold text-white mt-0.5">{report.condition}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                    <p className="text-[10px] font-medium text-sky-200/80 uppercase">Temperature</p>
                    <p className="text-sm font-extrabold text-white font-mono mt-0.5">{report.low}°C – {report.high}°C</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                    <p className="text-[10px] font-medium text-sky-200/80 uppercase">Feels Like</p>
                    <p className="text-sm font-extrabold text-white font-mono mt-0.5">{report.feelsLike}°C</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                    <p className="text-[10px] font-medium text-sky-200/80 uppercase">Humidity</p>
                    <p className="text-sm font-extrabold text-white font-mono mt-0.5">{report.humidity}%</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                    <p className="text-[10px] font-medium text-sky-200/80 uppercase">Wind</p>
                    <p className="text-sm font-extrabold text-white font-mono mt-0.5">{report.windKmh} km/h</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                    <p className="text-[10px] font-medium text-sky-200/80 uppercase">Rain Chance</p>
                    <p className="text-sm font-extrabold text-white font-mono mt-0.5">{report.pop}%</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                    <p className="text-[10px] font-medium text-sky-200/80 uppercase">Visibility</p>
                    <p className="text-sm font-extrabold text-white font-mono mt-0.5">{report.visibilityKm} km</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                    <p className="text-[10px] font-medium text-sky-200/80 uppercase">AQI Index</p>
                    <p className="text-sm font-extrabold text-white font-mono mt-0.5">Level {report.aqi}</p>
                  </div>
                </div>
              </div>

              {/* Weather Summary */}
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-sky-200/90 mb-2 border-l-2 border-sky-400 pl-2">Weather Summary</h2>
                <div className="bg-blue-950/60 border border-blue-800/60 rounded-xl p-4 text-xs sm:text-sm text-sky-100 leading-relaxed font-medium">
                  {report.summary}
                </div>
              </div>

              {/* Hourly Forecast Table */}
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-sky-200/90 mb-3 border-l-2 border-sky-400 pl-2">Hourly Forecast</h2>
                <div className="overflow-x-auto border border-white/10 rounded-xl">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="bg-white/10 text-sky-200 font-semibold border-b border-white/10">
                          <th className="py-3 px-3.5 font-mono">Time</th>
                          <th className="py-3 px-3.5 font-mono">Temperature</th>
                          <th className="py-3 px-3.5">Condition</th>
                          <th className="py-3 px-3.5 text-right font-mono hidden sm:table-cell">Rain Chance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10 text-slate-100 font-mono">
                        {report.hourly && report.hourly.length > 0 ? (
                          report.hourly.map((h, i) => (
                            <tr key={i} className={i % 2 === 1 ? 'bg-white/5' : 'bg-transparent'}>
                              <td className="py-3 px-3.5">{h.time}</td>
                              <td className="py-3 px-3.5 font-bold text-white">{h.temp}°C</td>
                              <td className="py-3 px-3.5 font-sans font-medium text-slate-200">{h.condition}</td>
                              <td className="py-3 px-3.5 text-right font-bold text-sky-300 hidden sm:table-cell">{h.pop}%</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="py-4 text-center text-slate-400 font-sans">No hourly data available.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                </div>
              </div>

              {/* 5-Day Outlook Table */}
              {report.forecast && report.forecast.length > 0 && (
                <div>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-sky-200/90 mb-3 border-l-2 border-sky-400 pl-2">5-Day Outlook</h2>
                  <div className="overflow-x-auto border border-white/10 rounded-xl">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="bg-white/10 text-sky-200 font-semibold border-b border-white/10">
                          <th className="py-2.5 px-2.5 sm:py-3 sm:px-3.5 font-mono whitespace-nowrap">Day & Date</th>
                          <th className="py-2.5 px-2.5 sm:py-3 sm:px-3.5 font-mono whitespace-nowrap">Temp Range</th>
                          <th className="py-2.5 px-2.5 sm:py-3 sm:px-3.5 whitespace-nowrap">Condition</th>
                          <th className="py-2.5 px-2.5 sm:py-3 sm:px-3.5 text-right font-mono whitespace-nowrap hidden sm:table-cell">Rain Chance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10 text-slate-100 font-mono">
                        {report.forecast.map((f, i) => (
                          <tr key={i} className={i % 2 === 1 ? 'bg-white/5' : 'bg-transparent'}>
                            <td className="py-2.5 px-2.5 sm:py-3 sm:px-3.5 align-middle whitespace-nowrap">
                              <span className="block font-bold text-white">{f.day}</span>
                              {f.date && <span className="block text-[10px] text-sky-200/70 font-medium mt-0.5">{f.date}</span>}
                            </td>
                            <td className="py-2.5 px-2.5 sm:py-3 sm:px-3.5 align-middle whitespace-nowrap font-semibold text-slate-200">{f.min}°C – {f.max}°C</td>
                            <td className="py-2.5 px-2.5 sm:py-3 sm:px-3.5 align-middle whitespace-nowrap font-sans font-medium text-slate-200">{f.condition}</td>
                            <td className="py-2.5 px-2.5 sm:py-3 sm:px-3.5 align-middle whitespace-nowrap text-right font-bold text-sky-300 hidden sm:table-cell">{f.pop}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Footer Attribution */}
              <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
                <span>Weather Notify Bulletin</span>
                <span>Data provided by OpenWeather</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Email Modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Email Weather Report</h3>
            <p className="text-xs text-slate-600 mt-1 mb-4">Send the 1-page A4 PDF report for {report?.city || city} directly to your email address.</p>
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="yourname@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex items-center justify-end space-x-2">
                <button type="button" onClick={() => setEmailModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={emailSending} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center space-x-1.5">
                  {emailSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                  <span>{emailSending ? 'Sending...' : 'Send Report'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
