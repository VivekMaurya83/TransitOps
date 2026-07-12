/**
 * DashboardSidebar — TransitOps fixed left sidebar
 * Exact replica of Stitch design: logo, nav items, active state, user profile at bottom
 */
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/fleet', icon: 'local_shipping', label: 'Fleet' },
  { to: '/drivers', icon: 'person_pin', label: 'Drivers' },
  { to: '/trips', icon: 'route', label: 'Trips' },
  { to: '/maintenance', icon: 'build', label: 'Maintenance' },
  { to: '/fuel', icon: 'local_gas_station', label: 'Fuel & Expenses' },
  { to: '/analytics', icon: 'bar_chart', label: 'Analytics' },
  { to: '/settings', icon: 'admin_panel_settings', label: 'Settings' },
];

const BOTTOM_NAV = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dash' },
  { to: '/fleet', icon: 'local_shipping', label: 'Fleet' },
  { to: '/trips', icon: 'route', label: 'Trips' },
  { to: '/analytics', icon: 'notifications', label: 'Alerts' },
];

const sidebarVariants = {
  hidden: { x: -240, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
};

const navItemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.04, duration: 0.25 } }),
};

export default function DashboardSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = {
    admin: 'Admin',
    fleet_manager: 'Fleet Manager',
    dispatcher: 'Dispatcher',
    safety_officer: 'Safety Officer',
    financial_analyst: 'Financial Analyst',
  }[user?.role] || user?.role || 'User';

  const initials = (user?.full_name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const isAllowed = (path) => {
    if (user?.role === 'admin') return true;
    switch (path) {
      case '/dashboard':
      case '/settings':
        return true;
      case '/fleet':
      case '/maintenance':
        return ['fleet_manager', 'dispatcher', 'financial_analyst'].includes(user?.role);
      case '/drivers':
        return ['fleet_manager', 'safety_officer'].includes(user?.role);
      case '/trips':
        return ['dispatcher', 'safety_officer'].includes(user?.role);
      case '/fuel':
        return ['financial_analyst'].includes(user?.role);
      case '/analytics':
        return ['fleet_manager', 'financial_analyst'].includes(user?.role);
      default:
        return false;
    }
  };

  const allowedNavItems = NAV_ITEMS.filter(item => isAllowed(item.to));

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────── */}
      <motion.aside
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className="fixed left-0 top-0 h-full w-60 bg-surface-container-lowest border-r border-outline-variant flex flex-col z-50 hidden md:flex"
      >
        {/* Logo */}
        <div className="p-lg flex items-center gap-xs border-b border-outline-variant/50">
          <div className="w-8 h-8 bg-primary flex items-center justify-center rounded flex-shrink-0">
            <span
              className="material-symbols-outlined text-on-primary text-headline-sm icon-filled"
              style={{ fontSize: '20px' }}
            >
              local_shipping
            </span>
          </div>
          <div>
            <h1 className="text-headline-sm font-black text-primary leading-tight">TransitOps</h1>
            <p className="text-label-caps text-secondary opacity-70" style={{ fontSize: '10px' }}>
              Fleet Management
            </p>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 mt-xs overflow-y-auto custom-scrollbar">
          <ul className="space-y-0.5">
            {allowedNavItems.map((item, i) => (
              <motion.li key={item.to} custom={i} variants={navItemVariants} initial="hidden" animate="visible">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    isActive ? 'nav-item-active' : 'nav-item'
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: '20px',
                          fontVariationSettings: isActive
                            ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
                            : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                        }}
                      >
                        {item.icon}
                      </span>
                      <span className="text-body-sm">{item.label}</span>
                    </>
                  )}
                </NavLink>
              </motion.li>
            ))}
          </ul>
        </nav>

        {/* Admin-only: User Management link */}
        {user?.role === 'admin' && (
          <div className="px-sm pb-xs">
            <NavLink
              to="/users"
              className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item'}
            >
              {({ isActive }) => (
                <>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: '20px',
                      fontVariationSettings: isActive
                        ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
                        : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                    }}
                  >
                    manage_accounts
                  </span>
                  <span className="text-body-sm">User Management</span>
                </>
              )}
            </NavLink>
          </div>
        )}

        {/* User Profile + Logout */}
        <div className="p-md border-t border-outline-variant">
          <div className="flex items-center gap-sm mb-sm">
            <div className="w-9 h-9 bg-primary-fixed rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-body-sm font-bold text-primary">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-bold text-on-surface truncate">
                {user?.full_name || 'User'}
              </p>
              <p className="text-label-caps text-secondary opacity-80" style={{ fontSize: '10px' }}>
                {roleLabel}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-xs text-label-caps text-on-surface-variant hover:text-error transition-colors w-full px-xs py-1 rounded hover:bg-error-container/30"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* ── Mobile Bottom Navigation ─────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest border-t border-outline-variant flex items-center justify-around z-50">
        {BOTTOM_NAV.filter(item => isAllowed(item.to)).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 transition-colors ${isActive ? 'text-primary' : 'text-secondary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: '22px',
                    fontVariationSettings: isActive
                      ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
                      : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                  }}
                >
                  {item.icon}
                </span>
                <span className="text-[10px] font-semibold">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
