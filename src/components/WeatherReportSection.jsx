'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Eye, Download, Mail, Share2, Calendar, Loader2, Check, X, ChevronLeft, ChevronRight, ExternalLink, Sparkles } from 'lucide-react';
import LocationSelector from './LocationSelector';

/* ─── Custom Glassmorphism DatePicker Popover ───────────────── */
function GlassDatePicker({ value, onChange, minDate, maxDate }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parsed initial date or today
  const selectedDateObj = useMemo(() => {
    if (!value) return new Date();
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [value]);

  const [viewDate, setViewDate] = useState(selectedDateObj);

  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split('-').map(Number);
      setViewDate(new Date(y, m - 1, d));
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Calendar Grid Math
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonthDays = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    prevMonthDays.push(daysInPrevMonth - i);
  }

  const currentMonthDays = [];
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    const isoStr = `${year}-${mStr}-${dStr}`;
    currentMonthDays.push({ day: d, isoStr });
  }

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  // Formatted date string for input display (DD - MM - YYYY)
  const displayFormattedDate = useMemo(() => {
    if (!value) return '';
    const [y, m, d] = value.split('-');
    return `${d}-${m}-${y}`;
  }, [value]);

  const todayIso = new Date().toISOString().split('T')[0];

  return (
    <div ref={containerRef} className={`relative w-full sm:w-[220px] ${isOpen ? 'z-50' : 'z-10'}`}>
      <label className="block text-[11px] font-bold text-sky-200/90 mb-1.5 flex items-center uppercase tracking-wider">
        <Calendar className="w-3.5 h-3.5 mr-1.5 text-sky-300" />
        REPORT DATE
      </label>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full bg-white/15 hover:bg-white/20 focus:bg-white/25 border border-white/25 rounded-xl py-3 px-3.5 text-white text-xs sm:text-sm font-mono flex items-center justify-between shadow-md focus:outline-none focus:ring-2 focus:ring-white/40 transition-all cursor-pointer select-none"
      >
        <span>{displayFormattedDate || 'Select Date'}</span>
        <span className="text-white/70 text-xs ml-2">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Sleek Custom Glassmorphism Calendar Popover */}
      {isOpen && (
        <div
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          className="absolute top-full left-0 mt-2 z-[100] w-72 bg-slate-900/95 border border-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-4 text-white text-sans overflow-hidden animate-fade-in"
        >
          {/* Header Month Year & Prev / Next */}
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="font-bold text-sm text-sky-100 tracking-wide">
              {monthNames[month]}, {year}
            </span>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {daysOfWeek.map((d) => (
              <span key={d} className="text-[11px] font-bold text-sky-300/80 uppercase">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Previous Month Padding Days */}
            {prevMonthDays.map((d, i) => (
              <span key={'prev-' + i} className="py-2 text-slate-600 select-none opacity-40">
                {d}
              </span>
            ))}

            {/* Current Month Days */}
            {currentMonthDays.map(({ day, isoStr }) => {
              const isSelected = isoStr === value;
              const isToday = isoStr === todayIso;
              const isDisabled = (minDate && isoStr < minDate) || (maxDate && isoStr > maxDate);

              return (
                <button
                  key={isoStr}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    onChange(isoStr);
                    setIsOpen(false);
                  }}
                  className={`py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center relative ${isSelected
                      ? 'bg-gradient-to-r from-indigo-600 to-sky-500 text-white font-bold shadow-lg shadow-indigo-500/40 scale-105'
                      : isDisabled
                        ? 'text-slate-600 opacity-30 cursor-not-allowed'
                        : isToday
                          ? 'bg-white/10 text-sky-200 border border-sky-400/50 font-bold hover:bg-white/20'
                          : 'text-slate-200 hover:bg-white/15 hover:text-white'
                    }`}
                >
                  {day}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 bg-sky-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                onChange(todayIso);
                setViewDate(new Date());
                setIsOpen(false);
              }}
              className="text-sky-300 hover:text-white transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-white/10"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main WeatherReportSection Component ───────────────────── */
export default function WeatherReportSection({ initialCity = 'Rajkot' }) {
  const [mounted, setMounted] = useState(false);
  const [location, setLocation] = useState({ country: '', state: '', city: '' });
  const [locationErrors, setLocationErrors] = useState({ country: '', state: '', city: '' });
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

  const validateLocation = () => {
    let hasErr = false;
    const errors = { country: '', state: '', city: '' };
    if (!location.country) { errors.country = 'Country is Required'; hasErr = true; }
    if (!location.state) { errors.state = 'State is Required'; hasErr = true; }
    if (!location.city) { errors.city = 'City is Required'; hasErr = true; }

    setLocationErrors(errors);
    return !hasErr;
  };

  const fetchReport = async () => {
    if (!validateLocation()) return null;
    setLoading(true);
    try {
      const res = await fetch(`/api/weather/report?city=${encodeURIComponent(location.city)}&state=${encodeURIComponent(location.state || '')}&country=${encodeURIComponent(location.country || '')}&date=${selectedDate}&format=json`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch report data');
      }
      const actualReport = data.data || data;
      setReportData(actualReport);
      return actualReport;
    } catch (err) {
      const isOffline = !navigator.onLine || err.message?.includes('Failed to fetch');
      showToast(isOffline ? 'No internet connection. Please try again.' : (err.message || 'Error fetching report'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async () => {
    if (!validateLocation()) return;
    setPreviewModalOpen(true);
    await fetchReport();
  };

  const handleDownloadPDF = async () => {
    if (!validateLocation()) return;
    setDownloading(true);
    try {
      const pdfUrl = `/api/weather/report?city=${encodeURIComponent(location.city)}&state=${encodeURIComponent(location.state || '')}&country=${encodeURIComponent(location.country || '')}&date=${selectedDate}&format=pdf`;
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weather-report-${location.city.toLowerCase()}-${selectedDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('PDF downloaded successfully!');
    } catch (err) {
      const isOffline = !navigator.onLine || err.message?.includes('Failed to fetch');
      showToast(isOffline ? 'No internet connection. Please try again.' : (err.message || 'Error downloading PDF'));
    } finally {
      setDownloading(false);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailAddress) return;
    setEmailSending(true);
    try {
      const res = await fetch('/api/weather/report/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailAddress,
          city: location.city,
          date: selectedDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send email');
      }
      showToast('Report sent to ' + emailAddress);
      setEmailModalOpen(false);
      setEmailAddress('');
    } catch (err) {
      showToast(err.message || 'Error sending email');
    } finally {
      setEmailSending(false);
    }
  };

  const handleShare = async () => {
    if (!validateLocation()) return;
    const shareUrl = `${window.location.origin}/reports/${encodeURIComponent(location.city.toLowerCase())}/${selectedDate}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Weather Report - ${location.city} (${selectedDate})`,
          text: `Check out today's weather report for ${location.city}`,
          url: shareUrl,
        });
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

  if (!mounted) {
    return (
      <div className="glass-card rounded-2xl md:rounded-4xl p-4 sm:p-6 md:p-8 max-w-6xl mx-auto text-white my-8 font-sans relative text-left overflow-visible animate-pulse">
        <div className="mb-6 space-y-2">
          <div className="h-6 w-48 bg-white/10 rounded-md" />
          <div className="h-3.5 w-3/4 max-w-lg bg-white/10 rounded-md" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="h-12 bg-white/10 rounded-xl" />
          <div className="h-12 bg-white/10 rounded-xl" />
          <div className="h-12 bg-white/10 rounded-xl" />
        </div>

        <div className="h-10 w-44 bg-white/10 rounded-xl mb-6" />

        <div className="grid grid-cols-4 sm:flex sm:items-center gap-2 sm:gap-3 mb-6">
          <div className="h-10 sm:w-28 bg-white/10 rounded-xl" />
          <div className="h-10 sm:w-32 bg-white/10 rounded-xl" />
          <div className="h-10 sm:w-28 bg-white/10 rounded-xl" />
          <div className="h-10 sm:w-28 bg-white/10 rounded-xl" />
        </div>

        <div className="pt-4 border-t border-white/10 space-y-2">
          <div className="h-4 w-48 bg-white/10 rounded" />
          <div className="h-3 w-full bg-white/5 rounded" />
          <div className="h-3 w-4/5 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  return (
    <section id="weather-report" className="glass-card rounded-2xl md:rounded-4xl p-4 sm:p-6 md:p-8 max-w-6xl mx-auto text-white my-8 font-sans relative text-left overflow-visible">
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

      {/* Header Title */}
      <div className="mb-6 space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white border-l-2 border-slate-400 pl-3 py-0.5">
          Daily Weather Bulletin
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 pl-3.5">
          Get instant, comprehensive daily weather bulletins and downloadable 1-page A4 PDF summaries tailored for your specific city and date.
        </p>
      </div>

      {/* Controls Container */}
      <div className="space-y-4 mb-6 relative z-30">
        <LocationSelector
          country={location.country}
          state={location.state}
          city={location.city}
          onChange={({ country, state, city }) => {
            setLocation({ country, state, city });
            setLocationErrors({ country: '', state: '', city: '' });
          }}
          errors={locationErrors}
          layout="horizontal"
          showLabels={true}
        />

        <div className="flex items-center justify-between pt-3 border-t border-white/10 relative z-30">
          <GlassDatePicker
            value={selectedDate}
            onChange={(d) => setSelectedDate(d)}
            minDate={minDateStr}
            maxDate={maxDateStr}
          />
        </div>
      </div>

      {/* Action Row */}
      <div className="grid grid-cols-4 sm:flex sm:items-center gap-2 sm:gap-3 mb-6">
        <button
          onClick={handleViewReport}
          disabled={loading}
          suppressHydrationWarning
          title="View Report"
          aria-label="View Report"
          className="inline-flex items-center justify-center p-2.5 sm:px-4 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-semibold border border-white/10 transition-all backdrop-blur-md disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 shrink-0 sm:mr-2 animate-spin text-slate-300" />
          ) : (
            <Eye className="w-4 h-4 shrink-0 sm:mr-2 text-slate-300" />
          )}
          <span className="hidden sm:inline">View Report</span>
        </button>

        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          suppressHydrationWarning
          title="Download PDF"
          aria-label="Download PDF"
          className="inline-flex items-center justify-center p-2.5 sm:px-4 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-semibold border border-white/10 transition-all backdrop-blur-md disabled:opacity-50"
        >
          {downloading ? (
            <Loader2 className="w-4 h-4 shrink-0 sm:mr-2 animate-spin text-slate-300" />
          ) : (
            <Download className="w-4 h-4 shrink-0 sm:mr-2 text-slate-300" />
          )}
          <span className="hidden sm:inline">Download PDF</span>
        </button>

        <button
          onClick={() => {
            if (validateLocation()) setEmailModalOpen(true);
          }}
          suppressHydrationWarning
          title="Email Report"
          aria-label="Email Report"
          className="inline-flex items-center justify-center p-2.5 sm:px-4 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-semibold border border-white/10 transition-all backdrop-blur-md"
        >
          <Mail className="w-4 h-4 shrink-0 sm:mr-2 text-slate-300" />
          <span className="hidden sm:inline">Email Report</span>
        </button>

        <button
          onClick={handleShare}
          suppressHydrationWarning
          title="Share Report"
          aria-label="Share Report"
          className="inline-flex items-center justify-center p-2.5 sm:px-4 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-semibold border border-white/10 transition-all backdrop-blur-md"
        >
          <Share2 className="w-4 h-4 shrink-0 sm:mr-2 text-slate-300" />
          <span className="hidden sm:inline">Share Report</span>
        </button>
      </div>

      {/* Why Daily Weather Reports Matter */}
      <div className="pt-4 border-t border-white/10 space-y-1.5 mb-6">
        <h4 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">
          Why Daily Weather Reports Matter
        </h4>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          Whether you are planning travel, scheduling outdoor work, organizing events, or monitoring daily agricultural activities, having a clear and verifiable weather bulletin gives you the exact insight you need. Our reports compile accurate hourly forecasts, air quality index details, sunrise and sunset schedules, and severe weather warnings into an easy-to-read layout.
        </p>
      </div>

      {/* Preview Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 md:p-6 animate-fade-in">
          <div className="bg-slate-900 border border-white/20 rounded-2xl sm:rounded-3xl max-w-5xl w-full h-[92vh] sm:h-[90vh] flex flex-col shadow-2xl overflow-hidden text-left backdrop-blur-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/90">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Official Weather Bulletin</span>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-sky-400 shrink-0" />
                  {reportData ? `${reportData.city}${reportData.state ? `, ${reportData.state}` : ''}${reportData.countryName ? `, ${reportData.countryName}` : (reportData.country ? `, ${reportData.country}` : '')} (${reportData.dateStr || reportData.date || selectedDate})` : 'Loading Weather Bulletin...'}
                </h3>
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {loading || !reportData ? (
                /* Skeleton Loading View */
                <div className="space-y-6 animate-pulse">
                  <div>
                    <div className="h-4 w-32 bg-white/10 rounded mb-3" />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-3 rounded-xl h-16 flex flex-col justify-between">
                          <div className="h-2.5 w-16 bg-white/10 rounded" />
                          <div className="h-4 w-24 bg-white/20 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="h-4 w-36 bg-white/10 rounded mb-2" />
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 h-20 flex flex-col justify-center space-y-2">
                      <div className="h-3 w-full bg-white/10 rounded" />
                      <div className="h-3 w-3/4 bg-white/10 rounded" />
                    </div>
                  </div>

                  <div>
                    <div className="h-4 w-32 bg-white/10 rounded mb-3" />
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 h-36 flex flex-col justify-between">
                      <div className="h-4 w-full bg-white/10 rounded" />
                      <div className="h-3 w-full bg-white/5 rounded" />
                      <div className="h-3 w-full bg-white/5 rounded" />
                    </div>
                  </div>

                  <div>
                    <div className="h-4 w-32 bg-white/10 rounded mb-3" />
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 h-36 flex flex-col justify-between">
                      <div className="h-4 w-full bg-white/10 rounded" />
                      <div className="h-3 w-full bg-white/5 rounded" />
                      <div className="h-3 w-full bg-white/5 rounded" />
                    </div>
                  </div>

                  <div>
                    <div className="h-4 w-36 bg-white/10 rounded mb-3" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-3.5 rounded-xl h-16 flex flex-col justify-between">
                          <div className="h-2.5 w-14 bg-white/10 rounded" />
                          <div className="h-4 w-20 bg-white/20 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Today's Weather Overview Grid */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 border-l-2 border-slate-400 pl-2">Today's Weather</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                        <p className="text-[10px] font-medium text-slate-400 uppercase">Condition</p>
                        <p className="text-sm font-semibold text-white mt-0.5 capitalize">{reportData.condition || 'Clear'}</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                        <p className="text-[10px] font-medium text-slate-400 uppercase">Temperature</p>
                        <p className="text-sm font-semibold text-white font-mono mt-0.5">
                          {reportData.low !== undefined ? `${reportData.low}°C – ${reportData.high}°C` : `${reportData.temp || 30}°C`}
                        </p>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                        <p className="text-[10px] font-medium text-slate-400 uppercase">Feels Like</p>
                        <p className="text-sm font-semibold text-white font-mono mt-0.5">{reportData.feelsLike !== undefined ? `${reportData.feelsLike}°C` : `${reportData.temp || 30}°C`}</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                        <p className="text-[10px] font-medium text-slate-400 uppercase">Humidity</p>
                        <p className="text-sm font-semibold text-white font-mono mt-0.5">{reportData.humidity || 60}%</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                        <p className="text-[10px] font-medium text-slate-400 uppercase">Wind Speed</p>
                        <p className="text-sm font-semibold text-white font-mono mt-0.5">{reportData.windKmh || 15} km/h</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                        <p className="text-[10px] font-medium text-slate-400 uppercase">Rain Chance</p>
                        <p className="text-sm font-semibold text-white font-mono mt-0.5">{reportData.pop || 0}%</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                        <p className="text-[10px] font-medium text-slate-400 uppercase">Visibility</p>
                        <p className="text-sm font-semibold text-white font-mono mt-0.5">{reportData.visibilityKm || '10.0'} km</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                        <p className="text-[10px] font-medium text-slate-400 uppercase">AQI Index</p>
                        <p className="text-sm font-semibold text-white font-mono mt-0.5">Level {reportData.aqi || 1}</p>
                      </div>
                    </div>
                  </div>

                  {/* Weather Summary Tip */}
                  {reportData.summary && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 border-l-2 border-slate-400 pl-2">Weather Summary</h4>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                        {reportData.summary}
                      </div>
                    </div>
                  )}

                  {/* Weather Alerts & Advisory */}
                  {reportData.alertAdvisory && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 border-l-2 border-slate-400 pl-2">Weather Advisory</h4>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                        <span className="font-semibold text-white">Notice: </span>
                        {reportData.alertAdvisory}
                      </div>
                    </div>
                  )}

                  {/* Hourly Forecast Table */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 border-l-2 border-slate-400 pl-2">Hourly Forecast</h4>
                    <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-white/5 text-slate-300">
                          <tr>
                            <th className="p-2.5 font-semibold">Time</th>
                            <th className="p-2.5 font-semibold">Temp</th>
                            <th className="p-2.5 font-semibold">Condition</th>
                            <th className="p-2.5 text-right font-semibold">Rain Chance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10 text-slate-200">
                          {((reportData.hourly && reportData.hourly.length > 0)
                            ? reportData.hourly
                            : [{ time: 'Current', temp: reportData.temp, condition: reportData.condition, pop: reportData.pop }]
                          ).map((h, i) => (
                            <tr key={i} className="hover:bg-white/5">
                              <td className="p-2.5 font-mono">{h.time || h.hour || '12:00 PM'}</td>
                              <td className="p-2.5 font-semibold text-white">{h.temp !== undefined ? h.temp : (reportData.temp || 30)}°C</td>
                              <td className="p-2.5 capitalize font-normal text-slate-200">{h.condition || reportData.condition || 'Clear'}</td>
                              <td className="p-2.5 text-right font-semibold text-slate-300">{h.pop !== undefined ? h.pop : (reportData.pop || 0)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 5-Day Outlook Table */}
                  {reportData.forecast && reportData.forecast.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 border-l-2 border-slate-400 pl-2">5-Day Outlook</h4>
                      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-white/5 text-slate-300">
                            <tr>
                              <th className="p-2.5 font-semibold">Day & Date</th>
                              <th className="p-2.5 font-semibold">Temp Range</th>
                              <th className="p-2.5 font-semibold">Condition</th>
                              <th className="p-2.5 text-right font-semibold">Rain Chance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10 text-slate-200">
                            {reportData.forecast.map((f, i) => (
                              <tr key={i} className="hover:bg-white/5">
                                <td className="p-2.5">
                                  <span className="font-semibold text-white block">{f.day}</span>
                                  {f.date && <span className="text-[10px] text-slate-400 font-normal">{f.date}</span>}
                                </td>
                                <td className="p-2.5 font-medium text-slate-200">{f.min}°C – {f.max}°C</td>
                                <td className="p-2.5 capitalize font-normal text-slate-200">{f.condition}</td>
                                <td className="p-2.5 text-right font-semibold text-slate-300">{f.pop}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Sun & Air Details */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 border-l-2 border-slate-400 pl-2">Sun & Air Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                        <p className="text-[10px] font-medium text-slate-400 uppercase">Sunrise</p>
                        <p className="text-sm font-semibold text-white font-mono mt-0.5">{reportData.sunriseStr || '04:41 AM'}</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                        <p className="text-[10px] font-medium text-slate-400 uppercase">Sunset</p>
                        <p className="text-sm font-semibold text-white font-mono mt-0.5">{reportData.sunsetStr || '05:50 PM'}</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                        <p className="text-[10px] font-medium text-slate-400 uppercase">Air Quality</p>
                        <p className="text-sm font-semibold text-white font-mono mt-0.5">{reportData.aqiText || `Level ${reportData.aqi || 1} — Good`}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer with Actions */}
            <div className="p-4 border-t border-white/10 flex items-center justify-end space-x-2 bg-slate-900/90">
              <button
                onClick={() => {
                  setPreviewModalOpen(false);
                  handleDownloadPDF();
                }}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition-colors flex items-center"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Download PDF
              </button>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/10 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-slate-900 border border-white/20 rounded-2xl max-w-md w-full p-6 shadow-2xl text-left">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center">
                <Mail className="w-4 h-4 mr-2 text-sky-400" />
                Email Weather Report
              </h3>
              <button
                onClick={() => setEmailModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-xs text-sky-200 font-semibold uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-white/50 focus:outline-none focus:border-sky-400"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={emailSending}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {emailSending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                  Send Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
