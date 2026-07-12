/**
 * AnalyticsPage — TransitOps Reports & Analytics
 * Live API integration for KPIs + stunning visual components matching mockup layout
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
      className={`fixed bottom-8 right-8 z-[100] flex items-center gap-sm px-lg py-md rounded-xl shadow-xl border text-body-sm font-semibold ${
        toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'
      }`}>
      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{toast.type === 'error' ? 'error' : 'check_circle'}</span>
      {toast.message}
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/reports/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSummary(await res.json());
      } else {
        showToast('Failed to load reports summary', 'error');
      }
    } catch {
      showToast('Network error loading analytics', 'error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`${BASE_URL}/reports/export/vehicles.csv`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vehicles_report.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        showToast('✓ Vehicles CSV report downloaded');
      } else {
        showToast('Failed to export CSV report', 'error');
      }
    } catch {
      showToast('Network error during export', 'error');
    } finally {
      setExporting(false);
    }
  };

  // Extract variables safely with mock fallback
  const fuelEfficiency = summary ? `${summary.fuel_efficiency_km_per_liter} km/l` : '0 km/l';
  const fleetUtilization = summary ? `${summary.fleet_utilization_percent}%` : '0%';
  const operationalCost = summary ? `₹${summary.operational_cost.toLocaleString()}` : '₹0';
  const vehicleRoi = summary ? `${summary.fleet_roi_percent}%` : '0%';

  const monthlyRevenue = (summary && summary.monthly_revenue && summary.monthly_revenue.length > 0)
    ? summary.monthly_revenue
    : [
        { month: 'Jan', revenue: 28000 },
        { month: 'Feb', revenue: 31000 },
        { month: 'Mar', revenue: 29500 },
        { month: 'Apr', revenue: 34000 },
        { month: 'May', revenue: 36200 },
        { month: 'Jun', revenue: 38400 },
      ];

  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue)) || 1;

  const topCostliestVehicles = (summary && summary.top_costliest_vehicles && summary.top_costliest_vehicles.length > 0)
    ? summary.top_costliest_vehicles
    : [
        { name: 'TRUCK-11', total_cost: 18500 },
        { name: 'MINI-03',  total_cost: 8200 },
        { name: 'VAN-05',   total_cost: 2100 },
      ];

  const maxVehicleCost = Math.max(...topCostliestVehicles.map(v => v.total_cost)) || 1;

  return (
    <DashboardLayout pageTitle="Analytics">
      <div className="space-y-lg">

        {/* Header */}
        <div className="page-header">
          <div>
            <h2 className="page-title">Reports & Analytics</h2>
            <p className="page-subtitle">Performance insights across your fleet</p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn-secondary flex items-center gap-xs disabled:opacity-60"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
            {exporting ? 'Exporting...' : 'Export'}
          </button>
        </div>

        {/* 4 KPI Cards aligned with mockup */}
        {loading ? (
          <div className="flex justify-center items-center h-28">
            <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '32px' }}>autorenew</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
            {/* Fuel Efficiency */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="card p-md border-l-4 border-l-primary flex flex-col justify-between h-28">
              <span className="text-label-caps font-bold text-secondary uppercase opacity-70">Fuel Efficiency</span>
              <p className="text-display-md font-bold text-on-surface data-mono mt-xs">{fuelEfficiency}</p>
            </motion.div>

            {/* Fleet Utilization */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="card p-md border-l-4 border-l-odoo-teal flex flex-col justify-between h-28">
              <span className="text-label-caps font-bold text-secondary uppercase opacity-70">Fleet Utilization</span>
              <p className="text-display-md font-bold text-on-surface data-mono mt-xs">{fleetUtilization}</p>
            </motion.div>

            {/* Operational Cost */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="card p-md border-l-4 border-l-[#ba1a1a] flex flex-col justify-between h-28">
              <span className="text-label-caps font-bold text-secondary uppercase opacity-70">Operational Cost</span>
              <p className="text-display-md font-bold text-on-surface data-mono mt-xs">{operationalCost}</p>
            </motion.div>

            {/* Vehicle ROI */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="card p-md border-l-4 border-l-on-tertiary-container flex flex-col justify-between h-28">
              <span className="text-label-caps font-bold text-secondary uppercase opacity-70">Vehicle ROI</span>
              <p className="text-display-md font-bold text-on-surface data-mono mt-xs">{vehicleRoi}</p>
            </motion.div>
          </div>
        )}

        {/* ROI formula label from mockup */}
        <div className="text-xs text-secondary font-semibold italic bg-surface-container-high/40 p-sm rounded-xl border border-outline-variant/50 max-w-max">
          ℹ ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">

          {/* Monthly Revenue Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="lg:col-span-7 card p-md"
          >
            <div className="flex justify-between items-center mb-lg">
              <h3 className="text-headline-sm font-bold text-on-surface">Monthly Revenue</h3>
              <span className="text-label-caps text-secondary font-bold">Jan–Jun 2024</span>
            </div>
            <div className="flex items-end gap-md h-48">
              {monthlyRevenue.map((m, i) => {
                const heightPct = (m.revenue / maxRevenue) * 100;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-xs">
                    <span className="data-mono text-[10px] text-on-surface">
                      {m.revenue >= 1000 ? `₹${(m.revenue/1000).toFixed(0)}k` : `₹${m.revenue}`}
                    </span>
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

          {/* Top Costliest Vehicles progress bar block */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="lg:col-span-5 card p-md"
          >
            <div className="flex justify-between items-center mb-md">
              <h3 className="text-headline-sm font-bold text-on-surface">Top Costliest Vehicles</h3>
              <span className="text-label-caps text-secondary font-bold">Total Expenses</span>
            </div>
            <div className="space-y-sm">
              {topCostliestVehicles.map((v, i) => {
                const pct = (v.total_cost / maxVehicleCost) * 100;
                const colors = ['bg-[#ba1a1a]', 'bg-on-tertiary-container', 'bg-primary'];
                const barColor = colors[i % colors.length];
                return (
                  <motion.div
                    key={v.name}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                    className="space-y-1"
                  >
                    <div className="flex justify-between text-body-sm text-on-surface">
                      <span className="font-bold">{v.name}</span>
                      <span className="data-mono text-secondary">₹{v.total_cost.toLocaleString()}</span>
                    </div>
                    <div className="progress-bar-track">
                      <motion.div
                        className={`progress-bar-fill ${barColor}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.5 + i * 0.08, duration: 0.6 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>{toast && <Toast toast={toast} />}</AnimatePresence>
    </DashboardLayout>
  );
}
