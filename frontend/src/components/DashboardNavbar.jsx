/**
 * DashboardNavbar — TransitOps top header bar
 * Stitch design: sticky h-16, search left, profile/notifications/dispatch CTA right
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function DashboardNavbar({ onSearch, pageTitle = 'Dashboard' }) {
  const [searchVal, setSearchVal]       = useState('');
  const [profileOpen, setProfileOpen]   = useState(false);
  const [notifOpen, setNotifOpen]       = useState(false);
  const profileRef = useRef(null);
  const notifRef   = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    setSearchVal(e.target.value);
    onSearch?.(e.target.value);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handle = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const roleLabel = {
    admin:             'Fleet Manager',
    dispatcher:        'Dispatcher',
    safety_officer:    'Safety Officer',
    financial_analyst: 'Financial Analyst',
  }[user?.role] || user?.role || 'User';

  const initials = (user?.full_name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const NOTIFICATIONS = [
    { id: 1, icon: 'warning',       color: 'text-on-tertiary-container', text: 'VAN-05 fuel level critical', time: '2 min ago' },
    { id: 2, icon: 'build',         color: 'text-secondary',             text: 'TRX-12 maintenance due',     time: '1 hr ago' },
    { id: 3, icon: 'check_circle',  color: 'text-odoo-teal',             text: 'Trip TR002 completed',        time: '3 hr ago' },
  ];

  return (
    <header className="h-16 bg-surface-container-lowest border-b border-outline-variant flex justify-between items-center px-lg sticky top-0 z-40">

      {/* ── Left: Search (desktop) + Page title (mobile) ─────── */}
      <div className="flex items-center gap-md flex-1">
        {/* Desktop search */}
        <div className="relative w-full max-w-md hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '18px' }}>
            search
          </span>
          <input
            value={searchVal}
            onChange={handleSearchChange}
            className="search-input"
            placeholder="Search vehicle, driver or trip ID..."
            type="text"
          />
        </div>
        {/* Mobile page title */}
        <h2 className="md:hidden text-headline-sm font-black text-primary">{pageTitle}</h2>
      </div>

      {/* ── Right: Notifications + Dispatch CTA + Profile ────── */}
      <div className="flex items-center gap-sm">

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(v => !v); setProfileOpen(false); }}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors relative"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '20px' }}>
              notifications
            </span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-surface-container-lowest" />
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 w-80 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-50 overflow-hidden"
              >
                <div className="px-md py-sm border-b border-outline-variant flex justify-between items-center">
                  <span className="text-headline-sm font-headline-sm text-on-surface">Alerts</span>
                  <span className="text-label-caps text-primary cursor-pointer hover:underline">Mark all read</span>
                </div>
                {NOTIFICATIONS.map((n) => (
                  <div key={n.id} className="flex items-start gap-sm px-md py-sm hover:bg-surface-container-low border-b border-outline-variant/50 last:border-0 cursor-pointer">
                    <span className={`material-symbols-outlined mt-0.5 ${n.color}`} style={{ fontSize: '18px' }}>{n.icon}</span>
                    <div className="flex-1">
                      <p className="text-body-sm text-on-surface">{n.text}</p>
                      <p className="text-label-caps text-secondary mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dispatch CTA */}
        <button className="btn-primary hidden md:flex" id="dispatch-btn">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
          Dispatch
        </button>

        {/* Divider */}
        <div className="h-7 w-px bg-outline-variant mx-xs hidden md:block" />

        {/* Profile Avatar Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); }}
            className="flex items-center gap-xs cursor-pointer group"
            aria-label="User profile"
            id="profile-btn"
          >
            <div className="w-8 h-8 bg-primary-fixed rounded-full flex items-center justify-center border-2 border-primary/30 group-hover:border-primary transition-colors">
              <span className="text-body-sm font-bold text-primary">{initials}</span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-body-sm font-bold text-on-surface leading-tight truncate max-w-[100px]">
                {user?.full_name || 'User'}
              </p>
              <p className="text-label-caps text-secondary opacity-80" style={{ fontSize: '10px' }}>{roleLabel}</p>
            </div>
            <span className="material-symbols-outlined text-outline hidden md:block" style={{ fontSize: '16px' }}>
              expand_more
            </span>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 w-56 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-50 overflow-hidden"
              >
                <div className="px-md py-sm border-b border-outline-variant">
                  <p className="text-body-sm font-bold text-on-surface">{user?.full_name || 'User'}</p>
                  <p className="text-label-caps text-secondary mt-0.5">{roleLabel}</p>
                </div>
                <div className="py-xs">
                  <button
                    onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                    className="w-full flex items-center gap-sm px-md py-2 text-body-sm text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>settings</span>
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-sm px-md py-2 text-body-sm text-error hover:bg-error-container/30 transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
