/**
 * DashboardPage — TransitOps Fleet Dashboard
 * Fully connected to backend: stats, recent trips, vehicle/driver status breakdown.
 * Falls back to mock data if backend is unreachable.
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/api';

// ─── Status Config ─────────────────────────────────────────────────
const STATUS_CONFIG = {
  'on_trip':    { label: 'On Trip',    cls: 'status-on-trip' },
  'dispatched': { label: 'Dispatched', cls: 'status-dispatched' },
  'completed':  { label: 'Completed',  cls: 'status-completed' },
  'draft':      { label: 'Draft',      cls: 'status-draft' },
  'delayed':    { label: 'Delayed',    cls: 'status-delayed' },
  'cancelled':  { label: 'Cancelled',  cls: 'status-retired' },
};

// ─── Animation Variants ────────────────────────────────────────────
const cardVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35 },
  }),
};

const tableRowVariants = {
  hidden:  { opacity: 0, x: -12 },
  visible: (i) => ({
    opacity: 1, x: 0,
    transition: { delay: 0.3 + i * 0.05, duration: 0.25 },
  }),
};

// ─── Sub-components ───────────────────────────────────────────────
function StatCard({ label, value, accent, border, index, loading, icon }) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={`stat-card p-md min-h-[96px] flex flex-col justify-between ${border || ''}`}
    >
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-black text-secondary uppercase tracking-widest leading-tight">
          {label}
        </span>
        {icon && (
          <span className="material-symbols-outlined text-outline" style={{ fontSize: '18px' }}>{icon}</span>
        )}
      </div>
      <div className="mt-auto pt-sm">
        {loading ? (
          <div className="h-10 w-16 bg-surface-container-high rounded animate-pulse" />
        ) : (
          <span className={`text-[36px] data-mono font-black leading-none ${accent || 'text-on-surface'}`}>
            {value}
          </span>
        )}
      </div>
    </motion.div>
  );
}

function TripStatusChip({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'status-draft' };
  return <span className={cfg.cls}>{cfg.label}</span>;
}

function VehicleStatusBar({ label, count, total, color, index }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 400 + index * 150);
    return () => clearTimeout(t);
  }, [pct, index]);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-label-caps font-bold text-secondary uppercase">
        <span>{label}</span>
        <span className="data-mono text-on-surface">{count}</span>
      </div>
      <div className="progress-bar-track">
        <div className={`progress-bar-fill ${color}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="table-row">
      {[1,2,3,4,5].map(i => (
        <td key={i} className="table-cell">
          <div className="h-4 bg-surface-container-high rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats,         setStats]         = useState(null);
  const [trips,         setTrips]         = useState([]);
  const [vehicleStatus, setVehicleStatus] = useState({});
  const [filter,        setFilter]        = useState('all');
  const [typeFilter,    setTypeFilter]    = useState('all');
  const [regionFilter,  setRegionFilter]  = useState('all');
  const [loading,       setLoading]       = useState(true);
  const [tripsLoading,  setTripsLoading]  = useState(true);

  // Load stats + vehicle breakdown together
  useEffect(() => {
    Promise.all([
      dashboardService.getStats(),
      dashboardService.getVehicleStatusBreakdown(),
    ])
      .then(([s, vs]) => { setStats(s); setVehicleStatus(vs); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Load recent trips
  useEffect(() => {
    dashboardService.getRecentTrips(10)
      .then(setTrips)
      .catch(console.error)
      .finally(() => setTripsLoading(false));
  }, []);

  const filteredTrips = filter === 'all'
    ? trips
    : trips.filter((t) => t.status === filter);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Build stat cards from real API data
  const totalVehicles = stats?.total_vehicles ?? 0;
  const STAT_CARDS = [
    { label: 'Active Vehicles',  value: String(stats?.total_vehicles           ?? '--'), accent: 'text-primary',   icon: 'local_shipping',   border: 'border-primary/30' },
    { label: 'Available',        value: String(stats?.available_vehicles        ?? '--'), accent: 'text-secondary', icon: 'check_circle' },
    { label: 'In Maintenance',   value: String(stats?.vehicles_in_maintenance   ?? '--'), accent: 'text-on-tertiary-container', icon: 'build' },
    { label: 'Active Trips',     value: String(stats?.active_trips              ?? '--'), accent: 'text-primary',   icon: 'route',            border: 'border-primary/40' },
    { label: 'Pending Trips',    value: String(stats?.pending_trips             ?? '--'), accent: 'text-on-surface', icon: 'pending' },
    { label: 'Drivers on Duty',  value: String(stats?.drivers_on_duty           ?? '--'), accent: 'text-secondary', icon: 'person_pin' },
    { label: 'Fleet Utilization',value: stats ? `${stats.fleet_utilization_percent}%` : '--', accent: 'text-primary', icon: 'speed' },
  ];

  // Build vehicle status bars from real breakdown
  const VEHICLE_BARS = [
    { label: 'Available', count: vehicleStatus.available ?? 0, color: 'bg-secondary' },
    { label: 'On Trip',   count: vehicleStatus.on_trip   ?? 0, color: 'bg-primary' },
    { label: 'In Shop',   count: vehicleStatus.in_shop   ?? 0, color: 'bg-on-tertiary-container' },
    { label: 'Retired',   count: vehicleStatus.retired   ?? 0, color: 'bg-outline' },
  ];

  return (
    <DashboardLayout pageTitle="Dashboard">
      <div className="space-y-lg">

        {/* ── Page Header ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap items-end justify-between gap-md"
        >
          <div>
            <h2 className="text-[24px] font-black text-on-surface tracking-tight">
              {greeting()}, {user?.full_name?.split(' ')[0] || 'User'}
            </h2>
            <p className="text-[13px] font-medium text-secondary mt-0.5">
              Here's your fleet overview for today.
            </p>
          </div>

          {/* ── Filters Row (from mockup) ───────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap items-center gap-sm bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-sm shadow-sm"
          >
            <span className="material-symbols-outlined text-outline" style={{ fontSize: '16px' }}>filter_list</span>
            <span className="text-[11px] font-black uppercase tracking-widest text-secondary">Filters:</span>
            {[
              { label: 'Vehicle Type', state: typeFilter,   setter: setTypeFilter,   options: ['All', 'Truck', 'Van', 'Bus', 'Trailer'] },
              { label: 'Status',       state: filter,        setter: setFilter,        options: ['All', 'available', 'on_trip', 'in_shop', 'retired'] },
              { label: 'Region',       state: regionFilter,  setter: setRegionFilter,  options: ['All', 'North', 'South', 'East', 'West', 'Central'] },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-xs">
                <span className="text-[11px] font-bold text-secondary">{f.label}:</span>
                <select
                  value={f.state}
                  onChange={e => f.setter(e.target.value)}
                  className="text-[12px] font-bold border border-outline-variant rounded-lg px-sm py-1 bg-surface-container-low text-on-surface outline-none cursor-pointer hover:border-primary transition-colors"
                  style={{ minWidth: '90px' }}
                >
                  {f.options.map(o => (
                    <option key={o} value={o === 'All' ? 'all' : o}>{o === 'all' ? 'All' : o}</option>
                  ))}
                </select>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── 7-Card Stat Grid ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-md mt-sm">
          {STAT_CARDS.map((stat, i) => (
            <StatCard key={stat.label} {...stat} index={i} loading={loading} />
          ))}
        </div>

        {/* ── Main 12-Col Grid ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">

          {/* Recent Trips Table — 8 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-8 card overflow-hidden flex flex-col"
          >
            {/* Table Header */}
            <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="text-[16px] font-black text-on-surface">Recent Trips</h3>
              <div className="flex items-center gap-sm">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="text-[12px] font-bold border border-outline-variant rounded-lg px-sm py-1 bg-surface-container-lowest text-on-surface outline-none focus:border-primary cursor-pointer"
                >
                  <option value="all">Status: All</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="completed">Completed</option>
                  <option value="draft">Draft</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  className="text-[12px] font-black uppercase tracking-wider px-sm py-1 rounded-lg border border-primary/30 text-primary hover:bg-primary hover:text-on-primary transition-colors"
                >
                  View All
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high">
                    <th className="table-header-cell">Trip #</th>
                    <th className="table-header-cell">From</th>
                    <th className="table-header-cell">To</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {tripsLoading ? (
                    [1,2,3,4,5].map(i => <SkeletonRow key={i} />)
                  ) : filteredTrips.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="table-cell text-center text-secondary py-8">
                        No trips found.
                      </td>
                    </tr>
                  ) : (
                    filteredTrips.map((trip, i) => (
                      <motion.tr
                        key={trip.id}
                        custom={i}
                        variants={tableRowVariants}
                        initial="hidden"
                        animate="visible"
                        className="table-row"
                      >
                        <td className="table-cell">
                          <span className="data-mono text-[13px] text-on-surface">
                            {trip.trip_number || trip.id?.slice(0, 8)}
                          </span>
                        </td>
                        <td className="table-cell text-body-sm text-on-surface">{trip.source || '—'}</td>
                        <td className="table-cell text-body-sm text-on-surface">{trip.destination || '—'}</td>
                        <td className="table-cell">
                          <TripStatusChip status={trip.status} />
                        </td>
                        <td className="table-cell text-right">
                          <span className="data-mono text-[13px] text-secondary">
                            {trip.created_at
                              ? new Date(trip.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                              : '—'}
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Right column — 4 cols */}
          <div className="lg:col-span-4 space-y-lg">

            {/* Vehicle Status Breakdown */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="card p-md space-y-md"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-headline-sm font-bold text-on-surface">Vehicle Status</h3>
                <span className="material-symbols-outlined text-outline" style={{ fontSize: '18px' }}>info</span>
              </div>
              <div className="space-y-sm">
                {loading ? (
                  [1,2,3,4].map(i => (
                    <div key={i} className="space-y-1">
                      <div className="h-3 bg-surface-container-high rounded animate-pulse w-3/4" />
                      <div className="h-2 bg-surface-container-high rounded-full animate-pulse" />
                    </div>
                  ))
                ) : (
                  VEHICLE_BARS.map((item, i) => (
                    <VehicleStatusBar
                      key={item.label}
                      {...item}
                      total={totalVehicles}
                      index={i}
                    />
                  ))
                )}
              </div>

              {/* Quick stats row */}
              {!loading && stats && (
                <div className="pt-sm border-t border-outline-variant grid grid-cols-2 gap-sm">
                  <div className="text-center">
                    <p className="data-mono text-headline-sm font-black text-secondary">{stats.drivers_on_duty ?? '—'}</p>
                    <p className="text-[11px] font-medium text-secondary">Drivers on duty</p>
                  </div>
                  <div className="text-center">
                    <p className="data-mono text-headline-sm font-black text-primary">{stats.completed_trips ?? '—'}</p>
                    <p className="text-[11px] font-medium text-secondary">Trips completed</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Live Fleet Board (Map placeholder) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="card overflow-hidden relative h-[260px]"
            >
              {/* Map grid background */}
              <div
                className="absolute inset-0 bg-surface-container-low"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(113,75,103,0.06) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(113,75,103,0.06) 1px, transparent 1px)
                  `,
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Animated vehicle dots */}
              {[
                { top: '30%', left: '25%', color: '#714b67', delay: 0 },
                { top: '55%', left: '60%', color: '#017E84', delay: 0.5 },
                { top: '45%', left: '40%', color: '#ffc530', delay: 1 },
                { top: '20%', left: '70%', color: '#714b67', delay: 1.5 },
                { top: '70%', left: '30%', color: '#017E84', delay: 0.8 },
              ].map((dot, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full border-2 border-white shadow-md"
                  style={{ top: dot.top, left: dot.left, backgroundColor: dot.color }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ delay: dot.delay, duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                />
              ))}

              {/* Info badge */}
              <div className="absolute top-md left-md bg-surface-container-lowest/90 backdrop-blur-sm border border-outline-variant p-sm rounded-lg shadow-lg z-10">
                <p className="text-label-caps font-bold text-on-surface">Live Fleet Board</p>
                <p className="text-[10px] text-secondary mt-0.5">
                  {stats?.vehicles_on_trip ?? '—'} vehicles active across routes
                </p>
              </div>

              {/* Open Map button */}
              <div className="absolute bottom-md right-md z-10">
                <button className="bg-surface-container-lowest border border-outline-variant px-md py-1 rounded-full text-label-caps font-bold text-primary shadow-md hover:bg-primary hover:text-on-primary transition-colors">
                  Open Map
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
