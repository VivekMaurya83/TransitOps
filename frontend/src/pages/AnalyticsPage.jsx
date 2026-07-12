/**
 * AnalyticsPage — TransitOps Reports & Analytics
 * KPI summary + trend bars + category breakdown charts
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';

const KPI_CARDS = [
  { label: 'Total Trips (Jun)',    value: '384',       delta: '+12%', up: true,  icon: 'route',            color: 'text-primary'    },
  { label: 'Fleet Utilization',   value: '81%',        delta: '+5%',  up: true,  icon: 'speed',            color: 'text-odoo-teal'  },
  { label: 'On-Time Delivery',    value: '93.2%',      delta: '-1.2%',up: false, icon: 'schedule',         color: 'text-secondary'  },
  { label: 'Total Fuel Cost',     value: '₹1.24L',     delta: '+8%',  up: false, icon: 'local_gas_station',color: 'text-tertiary'   },
  { label: 'Avg Trip Distance',   value: '28.4 km',    delta: '+3%',  up: true,  icon: 'map',              color: 'text-primary'    },
  { label: 'Safety Incidents',    value: '2',          delta: '-66%', up: true,  icon: 'shield',           color: 'text-odoo-teal'  },
];

const MONTHLY_TRIPS = [
  { month: 'Jan', trips: 280 },
  { month: 'Feb', trips: 310 },
  { month: 'Mar', trips: 295 },
  { month: 'Apr', trips: 340 },
  { month: 'May', trips: 362 },
  { month: 'Jun', trips: 384 },
];

const TOP_ROUTES = [
  { route: 'Warehouse A → Downtown Hub',    trips: 58, km: '18 km', pct: 90 },
  { route: 'City Depot → Airport T2',       trips: 45, km: '32 km', pct: 70 },
  { route: 'North Hub → Industrial Zone',   trips: 38, km: '45 km', pct: 59 },
  { route: 'South Depot → Tech Park',       trips: 34, km: '29 km', pct: 53 },
  { route: 'East Terminal → Central Market',trips: 28, km: '12 km', pct: 43 },
];

const DRIVER_PERFORMANCE = [
  { name: 'Priya Mehta',     trips: 72, safetyScore: 97, onTime: '98%' },
  { name: 'Alex Kumar',      trips: 65, safetyScore: 94, onTime: '95%' },
  { name: 'Sam Patel',       trips: 54, safetyScore: 88, onTime: '92%' },
  { name: 'Rita Singh',      trips: 48, safetyScore: 91, onTime: '96%' },
  { name: 'Suresh Rao',      trips: 42, safetyScore: 72, onTime: '85%' },
];

const MAX_TRIPS = Math.max(...MONTHLY_TRIPS.map(m => m.trips));

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30d');

  return (
    <DashboardLayout pageTitle="Analytics">
      <div className="space-y-lg">

        {/* Header */}
        <div className="page-header">
          <div>
            <h2 className="page-title">Reports & Analytics</h2>
            <p className="page-subtitle">Performance insights across your fleet</p>
          </div>
          <div className="flex items-center gap-sm">
            <div className="flex bg-surface-container-high rounded-lg p-0.5">
              {['7d', '30d', '90d'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-sm py-1 rounded text-label-caps font-bold uppercase transition-all ${
                    period === p ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-secondary'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button className="btn-secondary flex items-center gap-xs">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
              Export
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-md">
          {KPI_CARDS.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-xs">
                <span className="text-label-caps font-bold text-secondary uppercase opacity-70 text-[10px] leading-tight">{kpi.label}</span>
                <span className={`material-symbols-outlined ${kpi.color}`} style={{ fontSize: '18px' }}>{kpi.icon}</span>
              </div>
              <div>
                <p className={`data-mono text-headline-sm font-bold ${kpi.color}`}>{kpi.value}</p>
                <p className={`text-label-caps font-bold mt-xs ${kpi.up ? 'text-odoo-teal' : 'text-error'}`}>
                  {kpi.delta} vs prev period
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">

          {/* Monthly Trip Volume Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-7 card p-md"
          >
            <div className="flex justify-between items-center mb-lg">
              <h3 className="text-headline-sm font-bold text-on-surface">Monthly Trip Volume</h3>
              <span className="text-label-caps text-secondary font-bold">Jan–Jun 2024</span>
            </div>
            <div className="flex items-end gap-md h-48">
              {MONTHLY_TRIPS.map((m, i) => {
                const heightPct = (m.trips / MAX_TRIPS) * 100;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-xs">
                    <span className="data-mono text-[11px] text-on-surface">{m.trips}</span>
                    <div className="w-full relative" style={{ height: '160px', display: 'flex', alignItems: 'flex-end' }}>
                      <motion.div
                        className="w-full bg-primary rounded-t-lg"
                        style={{ height: `${heightPct}%` }}
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPct}%` }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-label-caps text-secondary font-bold">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Driver Performance */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="lg:col-span-5 card p-md"
          >
            <div className="flex justify-between items-center mb-md">
              <h3 className="text-headline-sm font-bold text-on-surface">Driver Performance</h3>
              <span className="text-label-caps text-secondary font-bold">Jun 2024</span>
            </div>
            <div className="space-y-sm">
              {DRIVER_PERFORMANCE.map((d, i) => (
                <motion.div
                  key={d.name}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="flex items-center gap-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-primary">
                      {d.name.split(' ').map(w => w[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-0.5">
                      <span className="text-body-sm text-on-surface">{d.name}</span>
                      <span className="data-mono text-[12px] text-odoo-teal font-bold">{d.onTime}</span>
                    </div>
                    <div className="progress-bar-track">
                      <motion.div
                        className="progress-bar-fill bg-odoo-teal"
                        initial={{ width: 0 }}
                        animate={{ width: `${d.safetyScore}%` }}
                        transition={{ delay: 0.5 + i * 0.08, duration: 0.6 }}
                      />
                    </div>
                  </div>
                  <span className="data-mono text-[12px] text-on-surface w-8 text-right">{d.trips}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Top Routes */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="card p-md"
        >
          <h3 className="text-headline-sm font-bold text-on-surface mb-md">Top Routes by Volume</h3>
          <div className="space-y-sm">
            {TOP_ROUTES.map((r, i) => (
              <div key={r.route} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-on-surface">{r.route}</span>
                  <div className="flex items-center gap-md text-label-caps font-bold text-secondary">
                    <span>{r.km}</span>
                    <span className="data-mono text-on-surface">{r.trips} trips</span>
                  </div>
                </div>
                <div className="progress-bar-track">
                  <motion.div
                    className="progress-bar-fill bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${r.pct}%` }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.7 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
