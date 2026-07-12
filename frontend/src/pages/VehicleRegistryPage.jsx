/**
 * VehicleRegistryPage — fully connected to backend API
 * GET /api/vehicles, POST /api/vehicles, DELETE /api/vehicles/:id
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const STATUS_CONFIG = {
  available:   { label: 'Available',   cls: 'status-available',   icon: 'check_circle'   },
  on_trip:     { label: 'On Trip',     cls: 'status-on-trip',     icon: 'navigation'     },
  maintenance: { label: 'Maintenance', cls: 'status-maintenance', icon: 'build'          },
  retired:     { label: 'Retired',     cls: 'status-retired',     icon: 'do_not_disturb' },
};

const FILTER_TABS = [
  { key: 'all',         label: 'All'         },
  { key: 'available',   label: 'Available'   },
  { key: 'on_trip',     label: 'On Trip'     },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'retired',     label: 'Retired'     },
];

function FuelBar({ pct }) {
  const color = pct > 50 ? '#017E84' : pct > 25 ? '#f59e0b' : '#dc2626';
  return (
    <div className="flex items-center gap-xs">
      <div className="w-16 bg-surface-container-high h-1.5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="data-mono text-[11px] text-on-surface">{pct}%</span>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
      className={`fixed bottom-8 right-8 z-[100] flex items-center gap-sm px-lg py-md rounded-xl shadow-xl border text-body-sm font-semibold ${
        toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'
      }`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
        {toast.type === 'error' ? 'error' : 'check_circle'}
      </span>
      {toast.message}
    </motion.div>
  );
}

export default function VehicleRegistryPage() {
  const { token, user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'fleet_manager';

  const [vehicles, setVehicles]     = useState([]);
  const [vtypes, setVtypes]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('all');
  const [search, setSearch]         = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState(null);

  const [form, setForm] = useState({
    registration_number: '', name: '', manufacturer: '', model: '',
    manufacturing_year: '', max_load_capacity: '', odometer: '0',
    acquisition_cost: '0', vehicle_type_id: '',
  });

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/vehicles/`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setVehicles(await res.json());
      else showToast('Failed to load vehicles', 'error');
    } catch { showToast('Network error loading vehicles', 'error'); }
    finally { setLoading(false); }
  }, [token]);

  const fetchVehicleTypes = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/vehicle-types/`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setVtypes(await res.json());
    } catch {}
  }, [token]);

  useEffect(() => { fetchVehicles(); fetchVehicleTypes(); }, [fetchVehicles, fetchVehicleTypes]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        manufacturing_year: form.manufacturing_year ? parseInt(form.manufacturing_year) : null,
        max_load_capacity: parseFloat(form.max_load_capacity),
        odometer: parseFloat(form.odometer || 0),
        acquisition_cost: form.acquisition_cost || '0',
      };
      const res = await fetch(`${BASE_URL}/vehicles/`, { method: 'POST', headers, body: JSON.stringify(payload) });
      if (res.ok) {
        showToast(`✓ Vehicle "${form.name}" added`);
        setShowModal(false);
        setForm({ registration_number: '', name: '', manufacturer: '', model: '', manufacturing_year: '', max_load_capacity: '', odometer: '0', acquisition_cost: '0', vehicle_type_id: '' });
        fetchVehicles();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.detail || 'Failed to add vehicle', 'error');
      }
    } catch { showToast('Network error', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleRetire = async (id, name) => {
    if (!window.confirm(`Retire vehicle "${name}"? This will mark it as retired.`)) return;
    try {
      const res = await fetch(`${BASE_URL}/vehicles/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { showToast(`${name} retired`); fetchVehicles(); }
      else { const err = await res.json().catch(() => ({})); showToast(err.detail || 'Failed to retire', 'error'); }
    } catch { showToast('Network error', 'error'); }
  };

  const filtered = vehicles.filter(v => {
    const matchStatus = filter === 'all' || v.status === filter;
    const matchSearch = v.registration_number?.toLowerCase().includes(search.toLowerCase()) ||
                        v.name?.toLowerCase().includes(search.toLowerCase()) ||
                        v.manufacturer?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <DashboardLayout pageTitle="Fleet">
      <div className="space-y-lg">

        {/* Header */}
        <div className="page-header">
          <div>
            <h2 className="page-title">Vehicle Registry</h2>
            <p className="page-subtitle">{vehicles.length} vehicles in fleet</p>
          </div>
          {canEdit && (
            <button onClick={() => setShowModal(true)} className="btn-primary" id="add-vehicle-btn">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
              Add Vehicle
            </button>
          )}
        </div>

        {/* Filter Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-sm">
          <div className="flex gap-xs overflow-x-auto pb-1">
            {FILTER_TABS.map((tab) => {
              const cnt = tab.key === 'all' ? vehicles.length : vehicles.filter(v => v.status === tab.key).length;
              return (
                <button key={tab.key} onClick={() => setFilter(tab.key)}
                  className={`flex-shrink-0 flex items-center gap-xs px-sm py-1.5 rounded-full text-label-caps font-bold uppercase transition-all ${
                    filter === tab.key ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-secondary hover:bg-surface-container-highest'
                  }`}
                >
                  {tab.label}
                  <span className={`text-[10px] rounded-full px-1 ${filter === tab.key ? 'bg-white/20 text-white' : 'bg-outline/20 text-secondary'}`}>{cnt}</span>
                </button>
              );
            })}
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '16px' }}>search</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vehicle or reg#..." className="search-input pl-9 w-56" />
          </div>
        </div>

        {/* Table */}
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
                    <th className="table-header-cell">Reg. No.</th>
                    <th className="table-header-cell">Name</th>
                    <th className="table-header-cell">Make / Model</th>
                    <th className="table-header-cell">Capacity (T)</th>
                    <th className="table-header-cell">Odometer</th>
                    <th className="table-header-cell">Status</th>
                    {canEdit && <th className="table-header-cell" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filtered.map((v, i) => {
                    const sc = STATUS_CONFIG[v.status] || { label: v.status, cls: 'status-draft' };
                    return (
                      <motion.tr key={v.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }} className="table-row group">
                        <td className="table-cell"><span className="data-mono text-[13px] font-bold text-primary">{v.registration_number}</span></td>
                        <td className="table-cell text-body-sm font-bold text-on-surface">{v.name}</td>
                        <td className="table-cell text-body-sm text-on-surface-variant">{[v.manufacturer, v.model, v.manufacturing_year].filter(Boolean).join(' · ')}</td>
                        <td className="table-cell text-body-sm text-on-surface">{v.max_load_capacity}T</td>
                        <td className="table-cell"><span className="data-mono text-[13px]">{v.odometer?.toLocaleString()} km</span></td>
                        <td className="table-cell"><span className={sc.cls}>{sc.label}</span></td>
                        {canEdit && (
                          <td className="table-cell">
                            {v.status !== 'retired' && (
                              <button onClick={() => handleRetire(v.id, v.name)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50"
                                title="Retire vehicle">
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>archive</span>
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
                  <span className="material-symbols-outlined text-outline" style={{ fontSize: '48px' }}>local_shipping</span>
                  <p className="text-body-sm text-secondary mt-2">{vehicles.length === 0 ? 'No vehicles yet. Add your first vehicle.' : 'No vehicles match this filter.'}</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Vehicle Modal */}
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
                  <h3 className="text-headline-sm font-bold text-on-surface">Add Vehicle</h3>
                  <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                  </button>
                </div>
                <form onSubmit={handleAdd} className="p-lg space-y-md">
                  <div className="grid grid-cols-2 gap-md">
                    <div>
                      <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Registration No. *</label>
                      <input required value={form.registration_number} onChange={e => setForm(f => ({ ...f, registration_number: e.target.value }))}
                        placeholder="MH-12-AB-1234" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low" />
                    </div>
                    <div>
                      <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Name *</label>
                      <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. VAN-01" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Vehicle Type *</label>
                    <select required value={form.vehicle_type_id} onChange={e => setForm(f => ({ ...f, vehicle_type_id: e.target.value }))}
                      className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low">
                      <option value="">Select type...</option>
                      {vtypes.map(vt => <option key={vt.id} value={vt.id}>{vt.name} — {vt.category}</option>)}
                    </select>
                    {vtypes.length === 0 && (
                      <p className="text-xs text-amber-600 mt-1">⚠ No vehicle types found. Ask admin to add types first.</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-md">
                    <div>
                      <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Manufacturer</label>
                      <input value={form.manufacturer} onChange={e => setForm(f => ({ ...f, manufacturer: e.target.value }))}
                        placeholder="e.g. Tata" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low" />
                    </div>
                    <div>
                      <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Model</label>
                      <input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                        placeholder="e.g. Ace Gold" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-md">
                    <div>
                      <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Year</label>
                      <input type="number" value={form.manufacturing_year} onChange={e => setForm(f => ({ ...f, manufacturing_year: e.target.value }))}
                        placeholder="2022" min="2000" max="2030" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low" />
                    </div>
                    <div>
                      <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Capacity (T) *</label>
                      <input required type="number" step="0.1" value={form.max_load_capacity} onChange={e => setForm(f => ({ ...f, max_load_capacity: e.target.value }))}
                        placeholder="1.5" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low" />
                    </div>
                    <div>
                      <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Odometer (km)</label>
                      <input type="number" value={form.odometer} onChange={e => setForm(f => ({ ...f, odometer: e.target.value }))}
                        placeholder="0" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low" />
                    </div>
                  </div>

                  <div className="flex gap-sm pt-xs">
                    <button type="button" onClick={() => setShowModal(false)}
                      className="flex-1 py-sm px-md rounded-lg border border-outline-variant text-body-sm font-bold text-on-surface-variant hover:bg-surface-container-high">
                      Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="flex-1 btn-primary disabled:opacity-60" id="submit-vehicle-btn">
                      {submitting ? <span className="flex items-center justify-center gap-xs"><span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>autorenew</span>Saving...</span> : 'Add Vehicle'}
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
