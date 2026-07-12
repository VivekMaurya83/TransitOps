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
  open:   { cls: 'status-on-trip',    label: 'In Progress' },
  closed: { cls: 'status-completed',  label: 'Completed'   },
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
  const [showModal, setShowModal]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState(null);

  const [form, setForm] = useState({
    vehicle_id: '', maintenance_type: '', description: '', cost: '',
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
      };
      const res = await fetch(`${BASE_URL}/maintenance/`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify(payload) });
      if (res.ok) {
        showToast('✓ Maintenance job scheduled');
        setShowModal(false);
        setForm({ vehicle_id: '', maintenance_type: '', description: '', cost: '' });
        fetchJobs();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.detail || 'Failed to schedule job', 'error');
      }
    } catch { showToast('Network error', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleClose = async (jobId) => {
    if (!window.confirm('Mark this maintenance job as completed?')) return;
    try {
      const res = await fetch(`${BASE_URL}/maintenance/${jobId}/close`, { method: 'POST', headers: jsonHeaders });
      if (res.ok) { showToast('✓ Job closed'); fetchJobs(); }
      else { const err = await res.json().catch(() => ({})); showToast(err.detail || 'Failed to close job', 'error'); }
    } catch { showToast('Network error', 'error'); }
  };

  const filtered = jobs.filter(j => filter === 'all' || j.status === filter);

  const counts = {
    open: jobs.filter(j => j.status === 'open').length,
    closed: jobs.filter(j => j.status === 'closed').length,
  };

  const maintenanceVehicles = vehicles.filter(v => v.status === 'available' || v.status === 'maintenance');

  const MAINTENANCE_TYPES = [
    'Oil & Filter Change', 'Tyre Rotation', 'Brake Replacement', 'Engine Overhaul',
    'AC Service', 'Suspension Check', 'Annual Inspection', 'Battery Replacement', 'Other',
  ];

  return (
    <DashboardLayout pageTitle="Maintenance">
      <div className="space-y-lg">

        {/* Header */}
        <div className="page-header">
          <div>
            <h2 className="page-title">Maintenance</h2>
            <p className="page-subtitle">Schedule & track all fleet maintenance jobs</p>
          </div>
          {canEdit && (
            <button onClick={() => setShowModal(true)} className="btn-primary" id="schedule-job-btn">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
              Schedule Job
            </button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          {[
            { label: 'In Progress', value: counts.open,         icon: 'build',         color: 'text-on-tertiary-container' },
            { label: 'Completed',   value: counts.closed,       icon: 'check_circle',  color: 'text-odoo-teal'             },
            { label: 'Total Fleet', value: vehicles.length,     icon: 'local_shipping',color: 'text-primary'               },
            { label: 'In Maintenance', value: vehicles.filter(v => v.status === 'maintenance').length, icon: 'warning', color: 'text-error' },
          ].map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="stat-card">
              <div className="flex items-center justify-between">
                <span className="text-label-caps font-bold text-secondary uppercase opacity-70">{card.label}</span>
                <span className={`material-symbols-outlined ${card.color}`} style={{ fontSize: '20px' }}>{card.icon}</span>
              </div>
              <span className={`text-display-lg data-mono font-bold mt-xs block ${card.color}`}>{String(card.value).padStart(2, '0')}</span>
            </motion.div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-xs">
          {[
            { key: 'all',    label: 'All' },
            { key: 'open',   label: 'In Progress' },
            { key: 'closed', label: 'Completed' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={`px-sm py-1.5 rounded-full text-label-caps font-bold uppercase transition-all ${
                filter === tab.key ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-secondary hover:bg-surface-container-highest'
              }`}>{tab.label}</button>
          ))}
        </div>

        {/* Jobs Table */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
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
                    <th className="table-header-cell">Type</th>
                    <th className="table-header-cell">Technician</th>
                    <th className="table-header-cell">Opened</th>
                    <th className="table-header-cell">Scheduled</th>
                    <th className="table-header-cell text-right">Est. Cost</th>
                    <th className="table-header-cell">Status</th>
                    {canEdit && <th className="table-header-cell" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filtered.map((job, i) => {
                    const sc = STATUS_CONFIG[job.status] || { label: job.status, cls: 'status-draft' };
                    const vehicle = vehicles.find(v => v.id === job.vehicle_id);
                    return (
                      <motion.tr key={job.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="table-row">
                        <td className="table-cell"><span className="data-mono text-[13px] font-bold text-on-surface">{vehicle?.name || vehicle?.registration_number || '—'}</span></td>
                        <td className="table-cell text-body-sm text-on-surface">{job.maintenance_type}</td>
                        <td className="table-cell text-body-sm text-on-surface">{job.technician || '—'}</td>
                        <td className="table-cell text-body-sm text-on-surface-variant">{job.opened_at ? new Date(job.opened_at).toLocaleDateString() : '—'}</td>
                        <td className="table-cell text-body-sm text-on-surface-variant">{job.scheduled_date || '—'}</td>
                        <td className="table-cell text-right"><span className="data-mono text-[13px] font-bold">{job.estimated_cost ? `₹${Number(job.estimated_cost).toLocaleString()}` : '—'}</span></td>
                        <td className="table-cell"><span className={sc.cls}>{sc.label}</span></td>
                        {canEdit && (
                          <td className="table-cell">
                            {job.status === 'open' && (
                              <button onClick={() => handleClose(job.id)}
                                className="px-sm py-0.5 text-[10px] font-bold rounded bg-odoo-teal text-white hover:opacity-90 transition-opacity">
                                Close Job
                              </button>
                            )}
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
                  <p className="text-body-sm text-secondary mt-2">{jobs.length === 0 ? 'No maintenance jobs yet.' : 'No jobs match this filter.'}</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Schedule Job Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 24 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
              <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant w-full max-w-lg pointer-events-auto max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center px-lg py-md border-b border-outline-variant sticky top-0 bg-surface-container-lowest">
                  <h3 className="text-headline-sm font-bold text-on-surface">Schedule Maintenance Job</h3>
                  <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                  </button>
                </div>
                <form onSubmit={handleOpen} className="p-lg space-y-md">
                  <div>
                    <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Vehicle *</label>
                    <select required value={form.vehicle_id} onChange={e => setForm(f => ({ ...f, vehicle_id: e.target.value }))}
                      className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low">
                      <option value="">Select vehicle...</option>
                      {maintenanceVehicles.map(v => <option key={v.id} value={v.id}>{v.name} — {v.registration_number}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Maintenance Type *</label>
                    <select required value={form.maintenance_type} onChange={e => setForm(f => ({ ...f, maintenance_type: e.target.value }))}
                      className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low">
                      <option value="">Select type...</option>
                      {MAINTENANCE_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Description</label>
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Additional details..." rows={2}
                      className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low resize-none" />
                  </div>

                  <div>
                    <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Estimated Cost (₹)</label>
                    <input type="number" step="0.01" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
                      placeholder="5000" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low" />
                  </div>

                  <div className="flex gap-sm pt-xs">
                    <button type="button" onClick={() => setShowModal(false)}
                      className="flex-1 py-sm px-md rounded-lg border border-outline-variant text-body-sm font-bold text-on-surface-variant hover:bg-surface-container-high">Cancel</button>
                    <button type="submit" disabled={submitting} className="flex-1 btn-primary disabled:opacity-60" id="submit-job-btn">
                      {submitting ? <span className="flex items-center justify-center gap-xs"><span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>autorenew</span>Saving...</span> : 'Schedule Job'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>{toast && <Toast toast={toast} />}</AnimatePresence>
    </DashboardLayout>
  );
}
