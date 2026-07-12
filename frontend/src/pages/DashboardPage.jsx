/**
 * DashboardPage — TransitOps Fleet Dashboard
 * Exact Stitch design: 6-stat grid, 12-col layout, recent trips table,
 * vehicle status bars, live fleet board map placeholder.
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';

// ─── Mock Data ────────────────────────────────────────────────────
const STATS = [
  { label: 'Total Fleet',    value: '53', accent: 'text-on-surface' },
  { label: 'Available',      value: '42', accent: 'text-on-surface' },
  { label: 'In Maintenance', value: '05', accent: 'text-tertiary',   highlight: false },
  { label: 'Active Trips',   value: '18', accent: 'text-primary',    border: 'border-primary/40' },
  { label: 'Pending Trips',  value: '09', accent: 'text-on-surface' },
  { label: 'Utilization',    value: '81%',accent: 'text-on-surface' },
];

const TRIPS = [
  { id: 'TR001', vehicle: 'VAN-05',  driver: 'Alex',   status: 'on-trip',    eta: '45 min'        },
  { id: 'TR002', vehicle: 'TRX-12',  driver: 'Sam',    status: 'completed',  eta: '--'            },
  { id: 'TR003', vehicle: 'MINI-08', driver: 'Priya',  status: 'dispatched', eta: '3h 10m'        },
  { id: 'TR004', vehicle: 'VAN-03',  driver: 'Suresh', status: 'draft',      eta: 'Awaiting vehicle' },
  { id: 'TR005', vehicle: 'TRX-15',  driver: 'Alex',   status: 'on-trip',    eta: '1h 22m'        },
  { id: 'TR006', vehicle: 'VAN-09',  driver: 'John',   status: 'delayed',    eta: '25 min'        },
];

const VEHICLE_STATUS = [
  { label: 'Available', count: 26, pct: 49, color: 'bg-odoo-teal' },
  { label: 'On Trip',   count: 18, pct: 34, color: 'bg-primary' },
  { label: 'In Shop',   count: 5,  pct: 9,  color: 'bg-on-tertiary-container' },
  { label: 'Retired',   count: 4,  pct: 8,  color: 'bg-outline' },
];

const STATUS_CONFIG = {
  'on-trip':    { label: 'On Trip',    cls: 'status-on-trip' },
  'completed':  { label: 'Completed',  cls: 'status-completed' },
  'dispatched': { label: 'Dispatched', cls: 'status-dispatched' },
  'draft':      { label: 'Draft',      cls: 'status-draft' },
  'delayed':    { label: 'Delayed',    cls: 'status-delayed' },
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
function StatCard({ stat, index }) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={`stat-card ${stat.border || ''}`}
    >
      <span className="text-label-caps font-bold text-secondary uppercase opacity-70 tracking-wider">
        {stat.label}
      </span>
      <div className="mt-xs">
        <span className={`text-display-lg data-mono font-bold ${stat.accent}`}>
          {stat.value}
        </span>
      </div>
    </motion.div>
  );
}

function TripStatusChip({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'status-draft' };
  return <span className={cfg.cls}>{cfg.label}</span>;
}

function VehicleStatusBar({ item, index }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(item.pct), 400 + index * 150);
    return () => clearTimeout(t);
  }, [item.pct, index]);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-label-caps font-bold text-secondary uppercase">
        <span>{item.label}</span>
        <span className="data-mono text-on-surface">{item.count}</span>
      </div>
      <div className="progress-bar-track">
        <div
          className={`progress-bar-fill ${item.color}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');

  const filteredTrips = filter === 'all'
    ? TRIPS
    : TRIPS.filter((t) => t.status === filter);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout pageTitle="Dashboard">
      <div className="space-y-lg">

        {/* ── Page Header ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-headline-md font-bold text-on-surface">
            {greeting()}, {user?.full_name?.split(' ')[0] || 'Dispatcher'}
          </h2>
          <p className="text-body-sm text-secondary mt-1">
            Here's your fleet overview for today.
          </p>
        </motion.div>

        {/* ── 6-Card Stat Grid ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-md">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
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
              <h3 className="text-headline-sm font-bold text-on-surface">Recent Trips</h3>
              <div className="flex items-center gap-sm">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-transparent border-none text-label-caps font-bold text-secondary focus:ring-0 cursor-pointer outline-none text-xs uppercase tracking-wider"
                >
                  <option value="all">Status: All</option>
                  <option value="on-trip">On Trip</option>
                  <option value="completed">Completed</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="delayed">Delayed</option>
                </select>
                <button className="text-primary text-label-caps font-bold hover:underline text-xs uppercase tracking-wider">
                  View All
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high">
                    <th className="table-header-cell">Trip ID</th>
                    <th className="table-header-cell">Vehicle</th>
                    <th className="table-header-cell">Driver</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell text-right">ETA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filteredTrips.map((trip, i) => (
                    <motion.tr
                      key={trip.id}
                      custom={i}
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="visible"
                      className="table-row"
                    >
                      <td className="table-cell">
                        <span className="data-mono text-[13px] text-on-surface">{trip.id}</span>
                      </td>
                      <td className="table-cell text-body-sm text-on-surface">{trip.vehicle}</td>
                      <td className="table-cell text-body-sm text-on-surface">{trip.driver}</td>
                      <td className="table-cell">
                        <TripStatusChip status={trip.status} />
                      </td>
                      <td className="table-cell text-right">
                        {trip.status === 'draft' ? (
                          <span className="text-body-sm text-outline italic">{trip.eta}</span>
                        ) : (
                          <span className="data-mono text-[13px] text-on-surface">{trip.eta}</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Right column — 4 cols */}
          <div className="lg:col-span-4 space-y-lg">

            {/* Vehicle Status */}
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
                {VEHICLE_STATUS.map((item, i) => (
                  <VehicleStatusBar key={item.label} item={item} index={i} />
                ))}
              </div>
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
                <p className="text-[10px] text-secondary mt-0.5">18 vehicles active across routes</p>
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
