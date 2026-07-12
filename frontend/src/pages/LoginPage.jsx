/**
 * LoginPage — TransitOps Sign In
 * Split card: purple left panel + white right form, medium size, centered on page.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 'admin',             label: 'Admin'            },
  { value: 'fleet_manager',     label: 'Fleet Manager'    },
  { value: 'dispatcher',        label: 'Dispatcher'       },
  { value: 'safety_officer',    label: 'Safety Officer'   },
  { value: 'financial_analyst', label: 'Financial Analyst'},
];

const ROLE_ICONS = {
  fleet_manager:     'local_shipping',
  dispatcher:        'route',
  safety_officer:    'shield',
  financial_analyst: 'analytics',
  admin:             'admin_panel_settings',
};

export default function LoginPage() {
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [form, setForm]             = useState({ email: '', password: '', role: 'dispatcher', remember: false });
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [isLocked, setIsLocked]     = useState(false);
  const [lockMinutes, setLockMinutes] = useState(0);
  const [showPass, setShowPass]     = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLocked(false);
    setLoading(true);
    try {
      const result = await login({ email: form.email, password: form.password, role: form.role });
      if (result.mustChangePassword) {
        navigate('/change-password');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err?.message || 'Invalid credentials. Please try again.';
      const lockedMatch = msg.match(/(\d+)\s*minute/);
      if (msg.toLowerCase().includes('locked') && lockedMatch) {
        setIsLocked(true);
        setLockMinutes(parseInt(lockedMatch[1], 10));
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #f3eff2 0%, #edf4f5 60%, #e8f3f3 100%)' }}
    >
      {/* Soft background blobs */}
      <div className="absolute top-[-120px] left-[-80px] w-80 h-80 rounded-full opacity-25 blur-3xl pointer-events-none" style={{ backgroundColor: '#714b67' }} />
      <div className="absolute bottom-[-80px] right-[-60px] w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ backgroundColor: '#017E84' }} />

      {/* ── Card wrapper ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full flex rounded-2xl overflow-hidden shadow-2xl"
        style={{ maxWidth: '900px', minHeight: '540px', border: '1px solid #ddd0d8' }}
      >

        {/* ── Left: Purple Brand Panel ─────────────────────────── */}
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0,   opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.05, ease: 'easeOut' }}
          className="hidden sm:flex flex-col justify-between p-8 w-[42%] flex-shrink-0"
          style={{ background: 'linear-gradient(160deg, #714b67 0%, #5a3851 100%)' }}
        >
          {/* Logo */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #f3a344 0%, #e08c2c 100%)' }}
              >
                <span
                  className="material-symbols-outlined text-white"
                  style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24" }}
                >
                  local_shipping
                </span>
              </div>
              <div>
                <h1 className="text-[26px] font-black text-white tracking-tight leading-none">TransitOps</h1>
                <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Fleet Operations
                </p>
              </div>
            </div>

            {/* Tagline */}
            <h2 className="text-[17px] font-bold text-white/90 leading-snug mb-5">
              One platform.<br />Every role. Full control.
            </h2>

            {/* Role list */}
            <ul className="space-y-2.5">
              {ROLES.filter(r => r.value !== 'admin').map((r, i) => (
                <motion.li
                  key={r.value}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.07 }}
                  className="flex items-center gap-2.5"
                >
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
                    <span className="material-symbols-outlined text-white/80" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 1" }}>
                      {ROLE_ICONS[r.value]}
                    </span>
                  </div>
                  <span className="text-[15px] font-semibold text-white/85">{r.label}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
            TransitOps © 2026
          </p>
        </motion.div>

        {/* ── Right: Sign In Form ───────────────────────────────── */}
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0,  opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="flex-1 flex flex-col justify-center px-8 py-8 bg-white"
        >
          {/* Mobile logo */}
          <div className="flex sm:hidden items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#714b67' }}>
              <span className="material-symbols-outlined text-white" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>
                local_shipping
              </span>
            </div>
            <span className="text-[18px] font-black" style={{ color: '#714b67' }}>TransitOps</span>
          </div>

          {/* Heading */}
          <div className="mb-5">
            <h2 className="text-[24px] font-black text-gray-900 leading-tight">Sign in to your account</h2>
            <p className="text-[14px] font-medium mt-1" style={{ color: '#80747a' }}>Enter your credentials to continue</p>
          </div>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-4 overflow-hidden"
              >
                <div
                  className="p-3 rounded-xl border flex items-start gap-2"
                  style={{
                    background: isLocked ? '#fff7ed' : '#fef2f2',
                    borderColor: isLocked ? '#fdba74' : '#fca5a5',
                  }}
                >
                  <span className="material-symbols-outlined mt-0.5 flex-shrink-0"
                    style={{ fontSize: '15px', color: isLocked ? '#c2410c' : '#dc2626' }}>
                    {isLocked ? 'lock' : 'error'}
                  </span>
                  <div>
                    <p className="text-[11px] font-bold" style={{ color: isLocked ? '#c2410c' : '#dc2626' }}>
                      {isLocked ? `Account Locked — Try again in ${lockMinutes} min` : 'Login Failed'}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: isLocked ? '#9a3412' : '#991b1b' }}>{error}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest mb-1" style={{ color: '#4e444a' }}>
                Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ fontSize: '15px', color: '#80747a' }}>mail</span>
                <input
                  id="email" name="email" type="email" required
                  value={form.email} onChange={handleChange}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-[13px] font-medium outline-none transition-all"
                  style={{ border: '1.5px solid #d1c3ca', background: '#faf7f9', color: '#181c20' }}
                  onFocus={e => { e.target.style.borderColor = '#714b67'; e.target.style.boxShadow = '0 0 0 3px rgba(113,75,103,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#d1c3ca'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest mb-1" style={{ color: '#4e444a' }}>
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ fontSize: '15px', color: '#80747a' }}>lock</span>
                <input
                  id="password" name="password" type={showPass ? 'text' : 'password'} required
                  value={form.password} onChange={handleChange}
                  placeholder="Enter password"
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg text-[13px] font-medium outline-none transition-all"
                  style={{ border: '1.5px solid #d1c3ca', background: '#faf7f9', color: '#181c20' }}
                  onFocus={e => { e.target.style.borderColor = '#714b67'; e.target.style.boxShadow = '0 0 0 3px rgba(113,75,103,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#d1c3ca'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                  style={{ color: '#80747a' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                    {showPass ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest mb-1" style={{ color: '#4e444a' }}>
                Role (RBAC)
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ fontSize: '15px', color: '#80747a' }}>badge</span>
                <select
                  id="role" name="role" value={form.role} onChange={handleChange}
                  className="w-full pl-9 pr-8 py-2.5 rounded-lg text-[13px] font-semibold outline-none transition-all appearance-none"
                  style={{ border: '1.5px solid #d1c3ca', background: '#faf7f9', color: '#181c20' }}
                  onFocus={e => { e.target.style.borderColor = '#714b67'; }}
                  onBlur={e => { e.target.style.borderColor = '#d1c3ca'; }}
                >
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ fontSize: '15px', color: '#80747a' }}>expand_more</span>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input name="remember" type="checkbox" checked={form.remember} onChange={handleChange}
                  className="w-3.5 h-3.5 rounded" style={{ accentColor: '#714b67' }} />
                <span className="text-[13px] font-medium" style={{ color: '#4e444a' }}>Remember me</span>
              </label>
              <button type="button" onClick={() => navigate('/forgot-password')}
                className="text-[13px] font-bold hover:underline transition-colors"
                style={{ color: '#714b67' }}>
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading || isLocked}
              whileHover={!loading && !isLocked ? { scale: 1.015, boxShadow: '0 6px 20px rgba(113,75,103,0.4)' } : {}}
              whileTap={!loading && !isLocked ? { scale: 0.985 } : {}}
              className="w-full flex justify-center items-center gap-2 py-3 rounded-xl text-[15px] font-black tracking-wide text-white transition-all disabled:opacity-60"
              style={{
                background: isLocked ? '#9ca3af' : 'linear-gradient(90deg, #714b67 0%, #5f3b56 100%)',
                boxShadow: isLocked ? 'none' : '0 4px 14px rgba(113,75,103,0.3)',
              }}
            >
              {loading ? (
                <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>progress_activity</span>Signing in...</>
              ) : isLocked ? (
                <><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lock</span>Account Locked</>
              ) : (
                <>Sign In <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>arrow_forward</span></>
              )}
            </motion.button>

            {/* Sign up */}
            <p className="text-center text-[13px] font-medium" style={{ color: '#80747a' }}>
              Don't have an account?{' '}
              <button type="button" onClick={() => navigate('/signup')}
                className="font-bold hover:underline transition-colors" style={{ color: '#714b67' }}>
                Sign up
              </button>
            </p>
          </form>
        </motion.div>
      </motion.div>
    </main>
  );
}
