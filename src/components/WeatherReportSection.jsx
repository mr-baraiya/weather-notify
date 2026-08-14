'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Eye, Download, Mail, Share2, Calendar, Loader2, Check, X } from 'lucide-react';

export default function WeatherReportSection({ initialCity = 'Rajkot' }) {
  const [mounted, setMounted] = useState(false);
  const [cityInput, setCityInput] = useState(initialCity);
  const todayObj = new Date();
  const todayStr = todayObj.toISOString().split('T')[0];

  // Past 10 days
  const minDateObj = new Date(todayObj);
  minDateObj.setDate(minDateObj.getDate() - 10);
  const minDateStr = minDateObj.toISOString().split('T')[0];

  // Future 10 days
  const maxDateObj = new Date(todayObj);
  maxDateObj.setDate(maxDateObj.getDate() + 10);
  const maxDateStr = maxDateObj.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchReportJson = async () => {
    const res = await fetch(`/api/weather/report?city=${encodeURIComponent(cityInput)}&date=${selectedDate}&format=json`);
    const data = await res.json();
    if (data.success && data.data) {
      return data.data;
    }
    throw new Error(data.message || 'Could not fetch weather report data.');
  };

  // 1. Action: View Report (Open Modal Preview)
  const handleViewReport = async () => {
    setLoading(true);
    try {
      const data = await fetchReportJson();
      setReportData(data);
      setPreviewModalOpen(true);
    } catch (err) {
      alert(err.message || 'Error loading report preview.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Action: Download PDF
  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const pdfUrl = `/api/weather/report?city=${encodeURIComponent(cityInput)}&date=${selectedDate}&format=pdf`;
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `Weather-Report-${cityInput}-${selectedDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to download PDF.');
    } finally {
      setTimeout(() => setDownloading(false), 1000);
    }
  };

  // 3. Action: Email Report
  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailAddress) return;
    setEmailSending(true);
    try {
      const res = await fetch('/api/weather/report/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailAddress, city: cityInput, date: selectedDate }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Report sent to your email!');
        setEmailModalOpen(false);
      } else {
        alert(data.message || 'Could not send report email.');
      }
    } catch (err) {
      alert('Error sending email.');
    } finally {
      setEmailSending(false);
    }
  };

  // 4. Action: Share Report
  const handleShareReport = async () => {
    const slug = cityInput.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-') || 'default';
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/reports/${slug}/${selectedDate}`;
    const shareTitle = `Today's Weather Report — ${cityInput}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url: shareUrl });
        return;
      } catch (err) {
        // Fallback to clipboard
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
    <section
      className="glass-card md:rounded-3xl md:p-8 max-w-6xl mx-4 sm:mx-6 lg:mx-auto text-white mt-8 sm:mt-12 mb-16 sm:mb-20 font-sans overflow-hidden py-4 px-2 relative text-left"
    >
      {/* Toast Notification (Portal) */}
      {mounted && toastMessage && createPortal(
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
        </div>,
        document.body
      )}

      {/* Title & Subtitle */}
      <div className="max-w-2xl mb-6 space-y-1">
        <h2 className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-sky-200 via-sky-100 to-white bg-clip-text text-transparent border-l-2 border-sky-400 pl-3 py-0.5">
          Daily Weather Report
        </h2>
        <p className="text-xs sm:text-sm text-slate-200/90 pl-3.5">
          Get today's complete weather summary in a clean, professional one-page report.
        </p>
      </div>

      {/* Controls: City & Date Selector */}
      <div className="flex flex-wrap items-center gap-4 mb-6 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-sky-200/90 mb-1">CITY LOCATION</label>
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="Enter city (e.g. Rajkot)"
            className="w-full px-3.5 py-2 bg-white/10 border border-white/20 rounded-lg text-xs sm:text-sm text-white placeholder-sky-200/50 focus:outline-none focus:border-sky-400 focus:bg-white/15 font-mono"
          />
        </div>

        <div className="w-[180px]">
          <label className="block text-xs font-medium text-sky-200/90 mb-1 flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1 text-sky-300" />
            REPORT DATE
          </label>
          <input
            type="date"
            min={minDateStr}
            max={maxDateStr}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400 focus:bg-white/15 font-mono [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Action Row */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={handleViewReport}
          disabled={loading}
          title="View Report"
          className="inline-flex items-center justify-center p-2.5 sm:px-4 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-semibold border border-white/20 transition-all backdrop-blur-md disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 sm:mr-2 animate-spin text-sky-300" /> : <Eye className="w-4 h-4 sm:mr-2 text-sky-300" />}
          <span className="hidden sm:inline">View Report</span>
        </button>

        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          title="Download PDF"
          className="inline-flex items-center justify-center p-2.5 sm:px-4 sm:py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
        >
          {downloading ? <Loader2 className="w-4 h-4 sm:mr-2 animate-spin text-white" /> : <Download className="w-4 h-4 sm:mr-2" />}
          <span className="hidden sm:inline">Download PDF</span>
        </button>

        <button
          onClick={() => setEmailModalOpen(true)}
          title="Email Report"
          className="inline-flex items-center justify-center p-2.5 sm:px-4 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-semibold border border-white/20 transition-all backdrop-blur-md"
        >
          <Mail className="w-4 h-4 sm:mr-2 text-slate-200" />
          <span className="hidden sm:inline">Email Report</span>
        </button>

        <button
          onClick={handleShareReport}
          title="Share Report"
          className="inline-flex items-center justify-center p-2.5 sm:px-4 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-semibold border border-white/20 transition-all backdrop-blur-md"
        >
          <Share2 className="w-4 h-4 sm:mr-2 text-slate-200" />
          <span className="hidden sm:inline">Share Report</span>
        </button>
      </div>

      {/* IN-APP REPORT PREVIEW MODAL (PORTAL) */}
      {mounted && previewModalOpen && reportData && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
            }}
            className="text-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto text-left [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Weather Notify · Official Bulletin Preview</span>
                <h3 className="text-xl font-extrabold text-white mt-0.5">{reportData.city}{reportData.state ? `, ${reportData.state}` : ''}</h3>
                <p className="text-xs text-slate-300 mt-0.5">{reportData.dateStr}</p>
              </div>
              <button onClick={() => setPreviewModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overview Grid */}
            <div className="mb-6">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-200/90 mb-3 border-l-2 border-sky-400 pl-2">Today's Weather</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                  <span className="block text-[10px] font-medium text-sky-200/80 uppercase">Condition</span>
                  <span className="text-sm font-extrabold text-white">{reportData.condition}</span>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                  <span className="block text-[10px] font-medium text-sky-200/80 uppercase">Temperature</span>
                  <span className="text-sm font-extrabold text-white font-mono">{reportData.low}°C – {reportData.high}°C</span>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                  <span className="block text-[10px] font-medium text-sky-200/80 uppercase">Feels Like</span>
                  <span className="text-sm font-extrabold text-white font-mono">{reportData.feelsLike}°C</span>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                  <span className="block text-[10px] font-medium text-sky-200/80 uppercase">Humidity</span>
                  <span className="text-sm font-extrabold text-white font-mono">{reportData.humidity}%</span>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                  <span className="block text-[10px] font-medium text-sky-200/80 uppercase">Wind</span>
                  <span className="text-sm font-extrabold text-white font-mono">{reportData.windKmh} km/h</span>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                  <span className="block text-[10px] font-medium text-sky-200/80 uppercase">Rain Chance</span>
                  <span className="text-sm font-extrabold text-white font-mono">{reportData.pop}%</span>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                  <span className="block text-[10px] font-medium text-sky-200/80 uppercase">Visibility</span>
                  <span className="text-sm font-extrabold text-white font-mono">{reportData.visibilityKm} km</span>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                  <span className="block text-[10px] font-medium text-sky-200/80 uppercase">AQI Index</span>
                  <span className="text-sm font-extrabold text-white font-mono">Level {reportData.aqi}</span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mb-6">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-200/90 mb-2 border-l-2 border-sky-400 pl-2">Weather Summary</h4>
              <div className="bg-blue-950/60 border border-blue-800/60 rounded-xl p-4 text-xs sm:text-sm text-sky-100 leading-relaxed font-medium">
                {reportData.summary}
              </div>
            </div>

            {/* Hourly Table */}
            <div className="mb-6">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-200/90 mb-3 border-l-2 border-sky-400 pl-2">Hourly Forecast</h4>
              <div className="overflow-x-auto border border-white/10 rounded-xl">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-white/10 text-sky-200 font-semibold border-b border-white/10">
                      <th className="p-3 font-mono">Time</th>
                      <th className="p-3 font-mono">Temp</th>
                      <th className="p-3">Condition</th>
                      <th className="p-3 text-right font-mono hidden sm:table-cell">Rain Chance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-slate-100 font-mono">
                    {reportData.hourly?.map((h, i) => (
                      <tr key={i} className={i % 2 === 1 ? 'bg-white/5' : 'bg-transparent'}>
                        <td className="p-3">{h.time}</td>
                        <td className="p-3 font-bold text-white">{h.temp}°C</td>
                        <td className="p-3 font-sans font-medium text-slate-200">{h.condition}</td>
                        <td className="p-3 text-right font-bold text-sky-300 hidden sm:table-cell">{h.pop}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5-Day Outlook Table */}
            {reportData.forecast && reportData.forecast.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-200/90 mb-3 border-l-2 border-sky-400 pl-2">5-Day Outlook</h4>
                <div className="overflow-x-auto border border-white/10 rounded-xl">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="bg-white/10 text-sky-200 font-semibold border-b border-white/10">
                        <th className="py-2.5 px-2.5 sm:p-3 font-mono whitespace-nowrap">Day & Date</th>
                        <th className="py-2.5 px-2.5 sm:p-3 font-mono whitespace-nowrap">Temp Range</th>
                        <th className="py-2.5 px-2.5 sm:p-3 whitespace-nowrap">Condition</th>
                        <th className="py-2.5 px-2.5 sm:p-3 text-right font-mono whitespace-nowrap hidden sm:table-cell">Rain Chance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-slate-100 font-mono">
                      {reportData.forecast.map((f, i) => (
                        <tr key={i} className={i % 2 === 1 ? 'bg-white/5' : 'bg-transparent'}>
                          <td className="py-2.5 px-2.5 sm:p-3 align-middle whitespace-nowrap">
                            <span className="block font-bold text-white">{f.day}</span>
                            {f.date && <span className="block text-[10px] text-sky-200/70 font-medium mt-0.5">{f.date}</span>}
                          </td>
                          <td className="py-2.5 px-2.5 sm:p-3 align-middle whitespace-nowrap font-semibold text-slate-200">{f.min}°C – {f.max}°C</td>
                          <td className="py-2.5 px-2.5 sm:p-3 align-middle whitespace-nowrap font-sans font-medium text-slate-200">{f.condition}</td>
                          <td className="py-2.5 px-2.5 sm:p-3 align-middle whitespace-nowrap text-right font-bold text-sky-300 hidden sm:table-cell">{f.pop}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Actions Footer */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-end space-x-3">
              <button onClick={() => setPreviewModalOpen(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold text-white transition-colors flex items-center space-x-1.5">
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Close Preview</span>
              </button>
              <button onClick={handleDownloadPdf} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-1.5">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download A4 PDF</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* EMAIL PROMPT MODAL (PORTAL) */}
      {mounted && emailModalOpen && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
            }}
            className="text-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-left"
          >
            <h3 className="text-lg font-bold text-white">Email Weather Report</h3>
            <p className="text-xs text-slate-300 mt-1 mb-4">Send the 1-page A4 PDF report for {cityInput} directly to your inbox.</p>
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-sky-200/90 mb-1">EMAIL ADDRESS</label>
                <input
                  type="email"
                  required
                  placeholder="yourname@example.com"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white/10 border border-white/20 rounded-xl text-xs sm:text-sm text-white placeholder-sky-200/50 focus:outline-none focus:border-sky-400 font-mono"
                />
              </div>
              <div className="flex items-center justify-end space-x-2">
                <button type="button" onClick={() => setEmailModalOpen(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold text-white transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={emailSending} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-1.5">
                  {emailSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  <span>{emailSending ? 'Sending...' : 'Send Report'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
