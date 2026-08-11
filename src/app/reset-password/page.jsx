'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Lock, Eye, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setMessage('Invalid or missing password reset token.');
      setIsSuccess(false);
      return;
    }
    if (!password) {
      setMessage('Please enter your new password.');
      setIsSuccess(false);
      return;
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      setIsSuccess(false);
      return;
    }
    if (!confirmPassword) {
      setMessage('Please confirm your new password.');
      setIsSuccess(false);
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await axios.post('/api/admin/reset-password', { token, password });
      if (res.data?.success) {
        setIsSuccess(true);
        setMessage(res.data.message || 'Your password has been reset successfully!');
      } else {
        setIsSuccess(false);
        setMessage(res.data?.message || 'Failed to reset password.');
      }
    } catch (err) {
      setIsSuccess(false);
      setMessage(err.response?.data?.message || 'Invalid or expired password reset token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      display: 'flex',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #38bdf8 100%)',
      fontFamily: "'Inter', 'Segoe UI', -apple-system, sans-serif",
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes rp-spin { to { transform: rotate(360deg); } }
        .rp-input { outline: none; transition: all 0.2s; }
        .rp-input::placeholder { color: rgba(255,255,255,0.65) !important; }
        .rp-input:focus { border-color: rgba(255,255,255,0.5) !important; background: rgba(255,255,255,0.2) !important; }
        .rp-input:-webkit-autofill,
        .rp-input:-webkit-autofill:hover,
        .rp-input:-webkit-autofill:focus,
        .rp-input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #1e3b72 inset !important;
          box-shadow: 0 0 0 1000px #1e3b72 inset !important;
          -webkit-text-fill-color: #ffffff !important;
          caret-color: #ffffff;
          transition: background-color 99999s ease-in-out 0s;
        }
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

      {/* Right 50%: Centered Reset Password Form */}
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

            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <h1 style={{
                fontSize: '1.4rem',
                fontWeight: '600',
                color: '#ffffff',
                margin: '0 0 0.5rem',
              }}>
                Reset Password
              </h1>
              <p style={{
                fontSize: '0.85rem',
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: '1.5',
                margin: 0,
              }}>
                Enter your new admin password below.
              </p>
            </div>

            {!token ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', justifyContent: 'center', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                  <AlertCircle size={18} /> Invalid or missing reset token link.
                </div>
                <Link
                  href="/forgot-password"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    background: '#4f46e5',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    textDecoration: 'none',
                  }}
                >
                  Request New Reset Link
                </Link>
              </div>
            ) : isSuccess ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(52,211,153,0.15)',
                  border: '1px solid rgba(52,211,153,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}>
                  <CheckCircle size={24} style={{ color: '#34d399' }} />
                </div>
                <p style={{ fontSize: '0.9rem', color: '#ffffff', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                  {message}
                </p>
                <Link
                  href="/dashboard"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    background: '#4f46e5',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    textDecoration: 'none',
                    boxShadow: '0 4px 16px rgba(79,70,229,0.4)',
                  }}
                >
                  Go to Admin Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* New Password */}
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#ffffff', opacity: 0.85, pointerEvents: 'none' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="New password (min 6 chars)"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setMessage(''); }}
                    className="rp-input"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: message && !isSuccess ? '1px solid rgba(239, 68, 68, 0.6)' : '1px solid rgba(255, 255, 255, 0.25)',
                      borderRadius: '12px',
                      padding: '12px 44px 12px 44px',
                      fontSize: '0.9375rem',
                      color: '#ffffff',
                      fontFamily: 'inherit',
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    tabIndex={-1}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#ffffff', opacity: 0.75, display: 'flex', alignItems: 'center' }}
                  >
                    <Eye size={16} />
                  </button>
                </div>

                {/* Confirm Password */}
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#ffffff', opacity: 0.85, pointerEvents: 'none' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setMessage(''); }}
                    className="rp-input"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: message && !isSuccess ? '1px solid rgba(239, 68, 68, 0.6)' : '1px solid rgba(255, 255, 255, 0.25)',
                      borderRadius: '12px',
                      padding: '12px 44px 12px 44px',
                      fontSize: '0.9375rem',
                      color: '#ffffff',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                {/* Error message */}
                {message && !isSuccess && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: '#f87171' }}>
                    <AlertCircle size={14} style={{ flexShrink: 0 }} />
                    {message}
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '13px',
                    background: '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    letterSpacing: '0.05em',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.72 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    fontFamily: 'inherit',
                    boxShadow: '0 4px 16px rgba(79,70,229,0.4)',
                  }}
                >
                  {loading ? (
                    <>
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'rp-spin 0.7s linear infinite' }} />
                      Resetting password...
                    </>
                  ) : 'Reset Password'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                  <Link
                    href="/dashboard"
                    style={{ fontSize: '0.8125rem', color: '#ffffff', opacity: 0.8, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <ArrowLeft size={14} /> Back to Admin Login
                  </Link>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #38bdf8 100%)', color: 'white' }}>
        Loading...
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
