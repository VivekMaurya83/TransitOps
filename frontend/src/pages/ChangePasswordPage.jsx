/**
 * ChangePasswordPage — TransitOps forced password change
 * Shown after login when must_change_password === true.
 * Backend: POST /api/auth/change-password
 * Cannot be skipped — user must change before accessing dashboard.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const containerVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

function PasswordStrength({ password }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const bars = [
    { min: 1, color: 'bg-error',     label: 'Weak' },
    { min: 2, color: 'bg-tertiary',  label: 'Fair' },
    { min: 3, color: 'bg-secondary', label: 'Good' },
    { min: 4, color: 'bg-odoo-teal', label: 'Strong' },
  ];

  if (!password) return null;
  const current = bars.filter((b) => score >= b.min).pop() || bars[0];

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-all duration-300 ${score >= i ? current.color : 'bg-surface-container-high'}`}
          />
        ))}
      </div>
      <p className={`text-[11px] font-semibold ${current.color.replace('bg-', 'text-')}`}>
        {current.label}
      </p>
    </div>
  );
}

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, logout, clearMustChangePassword } = useAuth();

  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [showPass, setShowPass] = useState({ current: false, newPass: false, confirm: false });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error,  setError]  = useState('');

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const toggleShow = (field) => setShowPass((p) => ({ ...p, [field]: !p[field] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPass !== form.confirm) {
      setError('New passwords do not match.');
      return;
    }
    if (form.newPass.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    setStatus('loading');
    try {
      await authService.changePassword(form.current, form.newPass);
      clearMustChangePassword();
      setStatus('success');
      // Redirect to dashboard after a brief success animation
      setTimeout(() => navigate('/dashboard'), 1800);
    } catch (err) {
      setError(err?.message || 'Failed to change password. Please try again.');
      setStatus('error');
    } finally {
      if (status !== 'success') setStatus('idle');
    }
  };

  const PasswordField = ({ name, label, placeholder }) => (
    <div>
      <label htmlFor={name} className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '18px' }}>
          lock
        </span>
        <input
          id={name}
          name={name}
          type={showPass[name] ? 'text' : 'password'}
          required
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors text-gray-700 outline-none"
        />
        <button
          type="button"
          onClick={() => toggleShow(name)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            {showPass[name] ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>
      {name === 'newPass' && <PasswordStrength password={form.newPass} />}
    </div>
  );

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
        <div className="card p-8 shadow-xl border border-outline-variant/60">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded flex items-center justify-center" style={{ backgroundColor: '#714b67' }}>
              <span className="material-symbols-outlined text-white" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>
                local_shipping
              </span>
            </div>
            <span className="text-headline-sm font-black text-primary">TransitOps</span>
          </div>

          {/* Success state */}
          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                className="w-16 h-16 bg-secondary-container/30 rounded-full flex items-center justify-center mx-auto"
              >
                <span className="material-symbols-outlined text-odoo-teal" style={{ fontSize: '32px', fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </motion.div>
              <h2 className="text-headline-md font-bold text-on-surface">Password Updated!</h2>
              <p className="text-body-sm text-secondary">Taking you to your dashboard...</p>
              <div className="flex justify-center mt-2">
                <span className="material-symbols-outlined text-primary animate-spin" style={{ fontSize: '20px' }}>progress_activity</span>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Info banner */}
              <div className="bg-primary-fixed/40 border border-primary/20 rounded-xl p-4 flex items-start gap-3 mb-6">
                <span className="material-symbols-outlined text-primary mt-0.5 flex-shrink-0" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>
                  info
                </span>
                <div>
                  <p className="text-body-sm font-bold text-on-surface">Password change required</p>
                  <p className="text-body-sm text-secondary mt-0.5">
                    Hi {user?.full_name?.split(' ')[0] || 'there'}, you're logged in with a temporary password. Please set a new permanent password to continue.
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-error-container rounded-xl border border-error/30 flex items-start gap-3"
                  >
                    <span className="material-symbols-outlined text-error mt-0.5" style={{ fontSize: '18px' }}>error</span>
                    <p className="text-body-sm text-on-error-container">{error}</p>
                  </motion.div>
                )}

                <PasswordField name="current" label="Temporary Password" placeholder="Enter the temporary password" />
                <PasswordField name="newPass" label="New Password" placeholder="Min. 8 characters" />
                <PasswordField name="confirm" label="Confirm New Password" placeholder="Repeat your new password" />

                {/* Password hints */}
                <div className="bg-surface-container-low rounded-xl p-3 border border-outline-variant">
                  <p className="text-label-caps font-bold text-secondary mb-1.5">Password requirements</p>
                  <ul className="space-y-1">
                    {[
                      { check: form.newPass.length >= 8,          text: 'At least 8 characters' },
                      { check: /[A-Z]/.test(form.newPass),        text: 'One uppercase letter' },
                      { check: /[0-9]/.test(form.newPass),        text: 'One number' },
                      { check: /[^A-Za-z0-9]/.test(form.newPass), text: 'One special character' },
                    ].map(({ check, text }) => (
                      <li key={text} className="flex items-center gap-2 text-body-sm">
                        <span
                          className={`material-symbols-outlined transition-colors ${check ? 'text-odoo-teal' : 'text-outline'}`}
                          style={{ fontSize: '14px', fontVariationSettings: check ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          {check ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span className={check ? 'text-on-surface' : 'text-secondary'}>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded text-base font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: '#714b67' }}
                >
                  {status === 'loading' ? (
                    <>
                      <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>progress_activity</span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>lock_reset</span>
                      Set New Password
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { logout(); navigate('/login'); }}
                  className="w-full text-center text-label-caps text-secondary hover:text-error transition-colors py-1"
                >
                  Sign out and try later
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-secondary mt-6">
          TransitOps © 2024 — Secure Fleet Management
        </p>
      </motion.div>
    </main>
  );
}
