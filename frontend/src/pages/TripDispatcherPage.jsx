/**
 * TripDispatcherPage — TransitOps Trip Dispatcher
 * Kanban-style trip management board with status columns
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';

const TRIPS_DATA = [
  { id: 'TR-001', vehicle: 'VAN-05',  driver: 'Alex Kumar',    origin: 'Warehouse A',    dest: 'Downtown Hub',   status: 'on-trip',    eta: '45 min',   distance: '18.2 km', priority: 'high' },
  { id: 'TR-002', vehicle: 'TRX-12',  driver: 'Sam Patel',     origin: 'City Depot',     dest: 'Airport T2',     status: 'completed',  eta: '--',       distance: '32.5 km', priority: 'normal' },
  { id: 'TR-003', vehicle: 'MINI-08', driver: 'Priya Mehta',   origin: 'North Hub',      dest: 'Industrial Zone',status: 'dispatched', eta: '3h 10m',   distance: '45.1 km', priority: 'normal' },
  { id: 'TR-004', vehicle: 'VAN-03',  driver: 'Suresh Rao',    origin: 'East Terminal',  dest: 'Central Market', status: 'draft',      eta: '—',        distance: '12.0 km', priority: 'low' },
  { id: 'TR-005', vehicle: 'TRX-15',  driver: 'Alex Kumar',    origin: 'South Depot',    dest: 'Tech Park',      status: 'on-trip',    eta: '1h 22m',   distance: '28.7 km', priority: 'high' },
  { id: 'TR-006', vehicle: 'VAN-09',  driver: 'John Fernandez', origin: 'West Hub',      dest: 'Port Gate 3',    status: 'delayed',    eta: '25 min',   distance: '55.0 km', priority: 'high' },
  { id: 'TR-007', vehicle: 'BUS-02',  driver: 'Rita Singh',    origin: 'Garage B',       dest: 'School Zone 4',  status: 'dispatched', eta: '2h 05m',   distance: '14.3 km', priority: 'normal' },
  { id: 'TR-008', vehicle: 'VAN-01',  driver: 'Arjun Nair',    origin: 'Main Depot',     dest: 'City Hospital',  status: 'draft',      eta: '—',        distance: '9.8 km',  priority: 'high' },
];

const STATUS_CONFIG = {
  'draft':      { label: 'Draft',      cls: 'status-draft',      icon: 'edit_note' },
  'dispatched': { label: 'Dispatched', cls: 'status-dispatched', icon: 'directions_car' },
  'on-trip':    { label: 'On Trip',    cls: 'status-on-trip',    icon: 'navigation' },
  'completed':  { label: 'Completed',  cls: 'status-completed',  icon: 'check_circle' },
  'delayed':    { label: 'Delayed',    cls: 'status-delayed',    icon: 'schedule' },
};

const PRIORITY_CONFIG = {
  high:   { cls: 'bg-error-container text-on-error-container',     label: 'High'   },
  normal: { cls: 'bg-secondary-container/40 text-on-secondary-container', label: 'Normal' },
  low:    { cls: 'bg-surface-container-high text-secondary',       label: 'Low'    },
};

const COLUMNS = ['draft', 'dispatched', 'on-trip', 'completed'];

const cardVariants = {
  hidden:  { opacity: 0, y: 12 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.3 } }),
};

function TripCard({ trip, index }) {
  const sc = STATUS_CONFIG[trip.status];
  const pc = PRIORITY_CONFIG[trip.priority];

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="card p-md space-y-sm cursor-pointer hover:border-primary transition-colors hover:shadow-sm group"
    >
      {/* Trip ID + Priority */}
      <div className="flex items-center justify-between">
        <span className="data-mono text-[13px] font-bold text-primary">{trip.id}</span>
        <span className={`status-chip text-[10px] ${pc.cls}`}>{pc.label}</span>
      </div>

      {/* Route */}
      <div className="space-y-1">
        <div className="flex items-center gap-xs text-body-sm text-on-surface">
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: '14px' }}>trip_origin</span>
          <span className="truncate">{trip.origin}</span>
        </div>
        <div className="flex items-center gap-xs text-body-sm text-on-surface">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px' }}>location_on</span>
          <span className="truncate">{trip.dest}</span>
        </div>
      </div>

      {/* Vehicle + Driver */}
      <div className="flex items-center justify-between pt-xs border-t border-outline-variant/60">
        <div className="flex items-center gap-xs">
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: '14px' }}>local_shipping</span>
          <span className="text-label-caps font-bold text-on-surface">{trip.vehicle}</span>
        </div>
        <div className="flex items-center gap-xs">
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: '14px' }}>person</span>
          <span className="text-body-sm text-on-surface-variant">{trip.driver}</span>
        </div>
      </div>

      {/* ETA + Distance */}
      <div className="flex items-center justify-between text-label-caps text-secondary">
        <span>ETA: <span className="data-mono text-on-surface">{trip.eta}</span></span>
        <span className="data-mono text-on-surface">{trip.distance}</span>
      </div>
    </motion.div>
  );
}

export default function TripDispatcherPage() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState('kanban');

  const filteredTrips = TRIPS_DATA.filter((t) =>
    t.id.toLowerCase().includes(search.toLowerCase()) ||
    t.driver.toLowerCase().includes(search.toLowerCase()) ||
    t.vehicle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout pageTitle="Trips">
      <div className="space-y-lg">

        {/* Page Header */}
        <div className="page-header">
          <div>
            <h2 className="page-title">Trip Dispatcher</h2>
            <p className="page-subtitle">{TRIPS_DATA.length} trips today — {TRIPS_DATA.filter(t => t.status === 'on-trip').length} active</p>
          </div>
          <div className="flex items-center gap-sm">
            {/* View Toggle */}
            <div className="flex bg-surface-container-high rounded-lg p-0.5">
              {['kanban', 'list'].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-sm py-1 rounded text-label-caps font-bold uppercase transition-all ${
                    view === v ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-secondary'
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    {v === 'kanban' ? 'view_kanban' : 'view_list'}
                  </span>
                </button>
              ))}
            </div>
            <button className="btn-primary">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
              New Trip
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '16px' }}>search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trip, driver or vehicle..."
            className="search-input"
          />
        </div>

        {/* Kanban View */}
        {view === 'kanban' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-md">
            {COLUMNS.map((col) => {
              const colTrips = filteredTrips.filter((t) => t.status === col);
              const sc = STATUS_CONFIG[col];
              return (
                <div key={col} className="space-y-sm">
                  {/* Column Header */}
                  <div className="flex items-center gap-xs px-sm">
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '16px' }}>{sc.icon}</span>
                    <span className="text-label-caps font-bold text-on-surface uppercase tracking-wider">{sc.label}</span>
                    <span className="ml-auto w-5 h-5 bg-surface-container-high rounded-full flex items-center justify-center text-[10px] font-bold text-secondary">
                      {colTrips.length}
                    </span>
                  </div>
                  {/* Cards */}
                  <div className="space-y-sm min-h-[120px]">
                    {colTrips.map((trip, i) => (
                      <TripCard key={trip.id} trip={trip} index={i} />
                    ))}
                    {colTrips.length === 0 && (
                      <div className="h-20 border-2 border-dashed border-outline-variant rounded-xl flex items-center justify-center text-body-sm text-outline">
                        No trips
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card overflow-hidden"
          >
            <div className="p-md border-b border-outline-variant bg-surface-container-low">
              <h3 className="text-headline-sm font-bold text-on-surface">All Trips</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-high">
                    <th className="table-header-cell">Trip ID</th>
                    <th className="table-header-cell">Route</th>
                    <th className="table-header-cell">Vehicle</th>
                    <th className="table-header-cell">Driver</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell text-right">ETA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filteredTrips.map((trip, i) => {
                    const sc = STATUS_CONFIG[trip.status];
                    return (
                      <motion.tr
                        key={trip.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="table-row"
                      >
                        <td className="table-cell"><span className="data-mono text-[13px] text-primary">{trip.id}</span></td>
                        <td className="table-cell text-body-sm">
                          <span className="text-on-surface">{trip.origin}</span>
                          <span className="text-outline mx-1">→</span>
                          <span className="text-on-surface">{trip.dest}</span>
                        </td>
                        <td className="table-cell text-body-sm">{trip.vehicle}</td>
                        <td className="table-cell text-body-sm">{trip.driver}</td>
                        <td className="table-cell"><span className={sc.cls}>{sc.label}</span></td>
                        <td className="table-cell text-right"><span className="data-mono text-[13px]">{trip.eta}</span></td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
