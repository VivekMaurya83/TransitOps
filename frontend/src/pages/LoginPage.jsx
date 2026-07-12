/**
 * LoginPage — TransitOps Sign In
 * Stitch design: split layout, plum sidebar with role list, right form with RBAC role dropdown
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 'dispatcher',        label: 'Dispatcher' },
  { value: 'admin',             label: 'Fleet Manager' },
  { value: 'safety_officer',    label: 'Safety Officer' },
  { value: 'financial_analyst', label: 'Financial Analyst' },
];

const ROLE_ACCESS = [
  { role: 'Fleet Manager',      access: 'Fleet, Maintenance' },
  { role: 'Dispatcher',         access: 'Dashboard, Trips' },
  { role: 'Safety Officer',     access: 'Drivers, Compliance' },
  { role: 'Financial Analyst',  access: 'Fuel & Expenses, Analytics' },
];

const sidebarVariants = {
  hidden:  { x: -60, opacity: 0 },
  visible: { x: 0,   opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

const formVariants = {
  hidden:  { x: 60, opacity: 0 },
  visible: { x: 0,  opacity: 1, transition: { duration: 0.5, ease: 'easeOut', delay: 0.1 } },
};

export default function LoginPage() {
  const navigate   = useNavigate();
  const { login }  = useAuth();

  const [form, setForm] = useState({ email: '', password: '', role: 'dispatcher', remember: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login({ email: form.email, password: form.password, role: form.role });
      // If backend sets must_change_password, force the user to change their password first
      if (result.mustChangePassword) {
        navigate('/change-password');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="flex min-h-screen">

      {/* ── Left: Brand Sidebar ──────────────────────────────── */}
      <motion.section
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className="hidden md:flex w-[40%] flex-col justify-between p-12"
        style={{ backgroundColor: '#714b67' }}
      >
        {/* Top */}
        <div className="space-y-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded flex items-center justify-center" style={{ backgroundColor: '#f3a344' }}>
              <span className="material-symbols-outlined text-white" style={{ fontSize: '28px', fontVariationSettings: "'FILL' 1" }}>
                local_shipping
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">TransitOps</h1>
              <p className="text-sm text-white/60 italic">Smart Transport Operations Platform</p>
            </div>
          </div>

          {/* Roles */}
          <div className="pt-8">
            <h2 className="text-lg font-medium text-white mb-5">One login, four roles:</h2>
            <ul className="space-y-4">
              {['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'].map((role, i) => (
                <motion.li
                  key={role}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#f3a344' }} />
                  <span className="text-lg text-white/80">{role}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-white/40 uppercase tracking-widest">
          TransitOps © 2024 — RBAC Enabled
        </div>
      </motion.section>

      {/* ── Right: Sign In Form ──────────────────────────────── */}
      <motion.section
        variants={formVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 bg-white flex flex-col justify-center items-center p-8 md:p-16"
      >
        {/* Mobile logo */}
        <div className="flex md:hidden items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: '#714b67' }}>
            <span className="material-symbols-outlined text-white" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>
              local_shipping
            </span>
          </div>
          <span className="text-headline-sm font-black text-primary">TransitOps</span>
        </div>

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-800">Sign in to your account</h2>
            <p className="text-gray-500 mt-2">Enter your credentials to continue</p>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-error-container rounded-xl border border-error/30 flex items-start gap-3"
            >
              <span className="material-symbols-outlined text-error mt-0.5" style={{ fontSize: '18px' }}>error</span>
              <p className="text-body-sm text-on-error-container">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="name@company.com"
                className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors text-gray-700 outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors text-gray-700 outline-none"
              />
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1" htmlFor="role">
                Role (RBAC)
              </label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors text-gray-700 outline-none bg-white"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  name="remember"
                  type="checkbox"
                  checked={form.remember}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 accent-primary"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm font-medium text-blue-500 hover:text-blue-600 hover:underline"
              >
                Forgot password?
              </button>

            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded text-base font-semibold text-white transition-all hover:opacity-90 focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60"
              style={{ backgroundColor: '#714b67' }}
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>progress_activity</span>
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Access Scope legend */}
          <div className="mt-10 pt-6 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 mb-2">Access is scoped by role after login:</p>
            <ul className="space-y-1">
              {ROLE_ACCESS.map((r) => (
                <li key={r.role} className="text-xs text-gray-400">
                  <span className="font-medium text-gray-500">{r.role}</span> → {r.access}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
