/**
 * ForgotPasswordPage — TransitOps
 * Sends a temporary password to the user's email.
 * Backend: POST /api/auth/forgot-password
 * Always returns a neutral message to prevent email enumeration.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/api';

const containerVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email,     setEmail]     = useState('');
  const [status,    setStatus]    = useState('idle'); // idle | loading | success | error
  const [message,   setMessage]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await authService.forgotPassword(email);
      setMessage(res?.message || 'If this email is registered, a temporary password has been sent.');
      setStatus('success');
    } catch (err) {
      setMessage(err?.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">

      {/* Background decoration */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 20% 30%, rgba(113,75,103,0.08) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 70%, rgba(1,126,132,0.06) 0%, transparent 70%)',
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative"
      >
        {/* Card */}
        <div className="card p-8 shadow-xl border border-outline-variant/60">

          {/* Logo + Back */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded flex items-center justify-center" style={{ backgroundColor: '#714b67' }}>
                <span
                  className="material-symbols-outlined text-white"
                  style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}
                >
                  local_shipping
                </span>
              </div>
              <span className="text-headline-sm font-black text-primary">TransitOps</span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1 text-label-caps text-secondary hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
              Back to Sign In
            </button>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center mb-4">
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}
              >
                lock_reset
              </span>
            </div>
            <h1 className="text-headline-md font-bold text-on-surface">Forgot your password?</h1>
            <p className="text-body-sm text-secondary mt-2">
              Enter your work email address. We'll send you a temporary password to get back in.
            </p>
          </div>

          {/* Success state */}
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="bg-secondary-container/20 border border-secondary/30 rounded-xl p-5 flex items-start gap-4">
                  <span
                    className="material-symbols-outlined text-odoo-teal mt-0.5 flex-shrink-0"
                    style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}
                  >
                    mark_email_read
                  </span>
                  <div>
                    <p className="text-body-sm font-bold text-on-surface">Check your inbox</p>
                    <p className="text-body-sm text-secondary mt-1">{message}</p>
                  </div>
                </div>

                <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant">
                  <p className="text-label-caps font-bold text-secondary mb-2">Next steps</p>
                  <ol className="space-y-2">
                    {[
                      'Check your email for the temporary password',
                      'Sign in using your email and temporary password',
                      'You\'ll be prompted to set a new permanent password',
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-body-sm text-on-surface">
                        <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                <button
                  onClick={() => navigate('/login')}
                  className="btn-primary w-full justify-center py-3"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>login</span>
                  Go to Sign In
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Error banner */}
                <AnimatePresence>
                  {status === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-4 bg-error-container rounded-xl border border-error/30 flex items-start gap-3"
                    >
                      <span className="material-symbols-outlined text-error mt-0.5" style={{ fontSize: '18px' }}>error</span>
                      <p className="text-body-sm text-on-error-container">{message}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email field */}
                <div>
                  <label htmlFor="fp-email" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                    Work Email
                  </label>
                  <div className="relative">
                    <span
                      className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline"
                      style={{ fontSize: '18px' }}
                    >
                      mail
                    </span>
                    <input
                      id="fp-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors text-gray-700 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading' || !email}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded text-base font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: '#714b67' }}
                >
                  {status === 'loading' ? (
                    <>
                      <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>progress_activity</span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
                      Send Temporary Password
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-secondary">
                  Remembered your password?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-primary font-semibold hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-secondary mt-6">
          TransitOps © 2024 — Secure Fleet Management
        </p>
      </motion.div>
    </main>
  );
}
