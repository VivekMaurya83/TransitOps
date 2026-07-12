/**
 * MaintenancePage — fully connected to backend API
 * GET /api/maintenance, POST /api/maintenance (open job), POST /api/maintenance/:id/close
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const STATUS_CONFIG = {
  active:    { cls: 'status-maintenance', label: 'In Shop' },
  open:      { cls: 'status-maintenance', label: 'In Shop' },
  completed: { cls: 'status-completed',   label: 'Completed' },
  closed:    { cls: 'status-completed',   label: 'Completed' },
};

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

export default function MaintenancePage() {
  const { token, user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'fleet_manager';

  const [jobs, setJobs]             = useState([]);
  const [vehicles, setVehicles]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState(null);

  const [form, setForm] = useState({
    vehicle_id: '',
    maintenance_type: '',
    description: '',
    cost: '',
    scheduled_date: new Date().toISOString().split('T')[0],
  });

  const authHeader = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...authHeader, 'Content-Type': 'application/json' };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const [jRes, vRes] = await Promise.all([
        fetch(`${BASE_URL}/maintenance/`, { headers: authHeader }),
        fetch(`${BASE_URL}/vehicles/`, { headers: authHeader }),
      ]);
      if (jRes.ok) setJobs(await jRes.json());
      if (vRes.ok) setVehicles(await vRes.json());
    } catch { showToast('Network error', 'error'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleOpen = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        vehicle_id: form.vehicle_id,
        maintenance_type: form.maintenance_type,
        description: form.description || null,
        cost: form.cost ? form.cost : '0',
        scheduled_date: form.scheduled_date || null,
      };
      const res = await fetch(`${BASE_URL}/maintenance/`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify(payload) });
      if (res.ok) {
        showToast('✓ Maintenance job scheduled');
        setForm({
          vehicle_id: '',
          maintenance_type: '',
          description: '',
          cost: '',
          scheduled_date: new Date().toISOString().split('T')[0],
        });
        fetchJobs();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.detail || 'Failed to schedule job', 'error');
      }
    } catch { showToast('Network error', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleClose = async (jobId) => {
    try {
      const res = await fetch(`${BASE_URL}/maintenance/${jobId}/close`, { method: 'POST', headers: jsonHeaders });
      if (res.ok) { showToast('✓ Job closed'); fetchJobs(); }
      else { const err = await res.json().catch(() => ({})); showToast(err.detail || 'Failed to close job', 'error'); }
    } catch { showToast('Network error', 'error'); }
  };

  const filtered = jobs.filter(j => {
    if (filter === 'all') return true;
    if (filter === 'open') return j.status === 'open' || j.status === 'active';
    if (filter === 'closed') return j.status === 'closed' || j.status === 'completed';
    return j.status === filter;
  });

  const counts = {
    open: jobs.filter(j => j.status === 'open' || j.status === 'active').length,
    closed: jobs.filter(j => j.status === 'closed' || j.status === 'completed').length,
  };

  const maintenanceVehicles = vehicles.filter(v => v.status === 'available' || v.status === 'maintenance');

  const MAINTENANCE_TYPES = [
    'Oil Change', 'Engine Repair', 'Tyre Replace', 'Brake Check', 'AC Service', 'Suspension Check', 'Annual Inspection', 'Battery Replacement', 'Other'
  ];

  return (
    <DashboardLayout pageTitle="Maintenance">
      <div className="space-y-lg">

        {/* Header */}
        <div className="page-header">
          <div>
            <h2 className="page-title text-[24px] font-black">Maintenance</h2>
            <p className="page-subtitle">Schedule & track all fleet maintenance jobs</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          {[
            { label: 'In Progress', value: counts.open,         icon: 'build',         color: 'text-on-tertiary-container' },
            { label: 'Completed',   value: counts.closed,       icon: 'check_circle',  color: 'text-secondary'             },
            { label: 'Total Fleet', value: vehicles.length,     icon: 'local_shipping',color: 'text-primary'               },
            { label: 'In Maintenance', value: vehicles.filter(v => v.status === 'maintenance').length, icon: 'warning', color: 'text-error' },
          ].map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="stat-card p-md min-h-[96px] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-secondary uppercase tracking-widest leading-tight">{card.label}</span>
                <span className={`material-symbols-outlined ${card.color}`} style={{ fontSize: '18px' }}>{card.icon}</span>
              </div>
              <span className={`text-[36px] data-mono font-black leading-none mt-auto pt-sm block ${card.color}`}>{String(card.value).padStart(2, '0')}</span>
            </motion.div>
          ))}
        </div>

        {/* 2-Column Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg mt-md">
          {/* Left Column: Log Service Record Form */}
          <div className="lg:col-span-4 space-y-md">
            <div className="card p-md space-y-md">
              <h3 className="text-[14px] font-black uppercase tracking-widest text-on-surface border-b border-outline-variant pb-xs">
                Log Service Record
              </h3>
              <form onSubmit={handleOpen} className="space-y-md">
                <div>
                  <label className="block text-[11px] font-bold text-secondary uppercase tracking-wider mb-1">Vehicle *</label>
                  <select
                    required
                    value={form.vehicle_id}
                    onChange={e => setForm(f => ({ ...f, vehicle_id: e.target.value }))}
                    className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low text-on-surface font-semibold"
                  >
                    <option value="">Select vehicle...</option>
                    {maintenanceVehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.name} — {v.registration_number}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-secondary uppercase tracking-wider mb-1">Service Type *</label>
                  <select
                    required
                    value={form.maintenance_type}
                    onChange={e => setForm(f => ({ ...f, maintenance_type: e.target.value }))}
                    className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low text-on-surface font-semibold"
                  >
                    <option value="">Select type...</option>
                    {MAINTENANCE_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-secondary uppercase tracking-wider mb-1">Cost *</label>
                  <input
                    type="number"
                    required
                    value={form.cost}
                    onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
                    placeholder="2500"
                    className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low text-on-surface font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-secondary uppercase tracking-wider mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={form.scheduled_date}
                    onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))}
                    className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low text-on-surface font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-secondary uppercase tracking-wider mb-1">Status</label>
                  <input
                    type="text"
                    disabled
                    value="Active"
                    className="w-full px-md py-sm border border-outline-variant rounded-lg text-body-sm bg-surface-container-high text-outline cursor-not-allowed font-bold"
                  />
                </div>

                {canEdit && (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-sm px-md rounded-lg bg-[#a26514] text-white font-black uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-60 text-[12px] flex items-center justify-center gap-xs"
                  >
                    {submitting ? (
                      <>
                        <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>autorenew</span>
                        Saving...
                      </>
                    ) : (
                      'Save'
                    )}
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Right Column: Service Log Table */}
          <div className="lg:col-span-8 space-y-md">
            <div className="card overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '32px' }}>autorenew</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-surface-container-high">
                        <th className="table-header-cell">Vehicle</th>
                        <th className="table-header-cell">Service</th>
                        <th className="table-header-cell text-right">Cost (₹)</th>
                        <th className="table-header-cell">Status</th>
                        {canEdit && <th className="table-header-cell text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {filtered.map((job, i) => {
                        const sc = STATUS_CONFIG[job.status] || { label: job.status, cls: 'status-draft' };
                        const vehicle = vehicles.find(v => v.id === job.vehicle_id);
                        return (
                          <motion.tr
                            key={job.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="table-row hover:bg-surface-container-low/50"
                          >
                            <td className="table-cell">
                              <span className="data-mono text-[13px] font-black text-on-surface">
                                {vehicle?.name || vehicle?.registration_number || '—'}
                              </span>
                            </td>
                            <td className="table-cell text-body-sm text-on-surface font-semibold">
                              {job.maintenance_type}
                            </td>
                            <td className="table-cell text-right">
                              <span className="data-mono text-[13px] font-black">
                                {job.estimated_cost ? `₹${Number(job.estimated_cost).toLocaleString()}` : '—'}
                              </span>
                            </td>
                            <td className="table-cell">
                              <span className={sc.cls}>{sc.label}</span>
                            </td>
                            {canEdit && (
                              <td className="table-cell text-right">
                                {job.status === 'open' || job.status === 'active' ? (
                                  <button
                                    onClick={() => handleClose(job.id)}
                                    className="px-sm py-1 text-[10px] font-black uppercase tracking-wider rounded bg-primary text-on-primary hover:opacity-90 transition-opacity"
                                  >
                                    Close
                                  </button>
                                ) : null}
                              </td>
                            )}
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filtered.length === 0 && (
                    <div className="py-16 text-center">
                      <span className="material-symbols-outlined text-outline" style={{ fontSize: '48px' }}>build</span>
                      <p className="text-body-sm text-secondary mt-2">
                        {jobs.length === 0 ? 'No service logs yet.' : 'No logs match this filter.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>{toast && <Toast toast={toast} />}</AnimatePresence>
    </DashboardLayout>
  );
}
