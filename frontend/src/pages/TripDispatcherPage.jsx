/**
 * TripDispatcherPage — fully connected to backend API
 * GET /api/trips, POST /api/trips, POST /api/trips/:id/dispatch, POST /api/trips/:id/complete, POST /api/trips/:id/cancel
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const STATUS_CONFIG = {
  draft:       { label: 'Draft',      cls: 'status-draft',      icon: 'edit_note'      },
  dispatched:  { label: 'Dispatched', cls: 'status-dispatched', icon: 'directions_car' },
  on_trip:     { label: 'On Trip',    cls: 'status-on-trip',    icon: 'navigation'     },
  completed:   { label: 'Completed',  cls: 'status-completed',  icon: 'check_circle'   },
  cancelled:   { label: 'Cancelled',  cls: 'status-delayed',    icon: 'cancel'         },
};

const COLUMNS = ['draft', 'dispatched', 'on_trip', 'completed'];

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

function TripCard({ trip, vehicles, drivers, onAction }) {
  const sc = STATUS_CONFIG[trip.status] || { label: trip.status, cls: 'status-draft', icon: 'help' };
  const vehicle = vehicles.find(v => v.id === trip.vehicle_id);
  const driver  = drivers.find(d => d.id === trip.driver_id);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="card p-md space-y-sm hover:border-primary transition-colors hover:shadow-sm">
      <div className="flex items-center justify-between">
        <span className="data-mono text-[12px] font-bold text-primary">{trip.id.slice(0, 8).toUpperCase()}</span>
        <span className={`status-chip text-[10px] ${sc.cls}`}>{sc.label}</span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-xs text-body-sm text-on-surface">
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: '14px' }}>trip_origin</span>
          <span className="truncate">{trip.source}</span>
        </div>
        <div className="flex items-center gap-xs text-body-sm text-on-surface">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px' }}>location_on</span>
          <span className="truncate">{trip.destination}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-xs border-t border-outline-variant/60">
        <span className="text-label-caps font-bold text-on-surface">{vehicle?.name || vehicle?.registration_number || '—'}</span>
        <span className="text-body-sm text-on-surface-variant truncate max-w-[100px]">{driver?.full_name || '—'}</span>
      </div>

      <div className="text-label-caps text-secondary">
        {trip.planned_distance} km · {trip.cargo_weight} T
      </div>

      {/* Action buttons */}
      <div className="flex gap-xs" onClick={e => e.stopPropagation()}>
        {trip.status === 'draft' && (
          <button onClick={() => onAction(trip.id, 'dispatch')}
            className="flex-1 py-1 text-[10px] font-bold rounded bg-primary text-on-primary hover:opacity-90 transition-opacity">
            Dispatch
          </button>
        )}
        {(trip.status === 'dispatched' || trip.status === 'on_trip') && (
          <>
            <button onClick={() => onAction(trip.id, 'complete')}
              className="flex-1 py-1 text-[10px] font-bold rounded bg-odoo-teal text-white hover:opacity-90">
              Complete
            </button>
            <button onClick={() => onAction(trip.id, 'cancel')}
              className="flex-1 py-1 text-[10px] font-bold rounded border border-error/40 text-error hover:bg-red-50">
              Cancel
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function TripDispatcherPage() {
  const { token, user } = useAuth();
  const canDispatch = user?.role === 'admin' || user?.role === 'dispatcher' || user?.role === 'fleet_manager';

  const [trips, setTrips]           = useState([]);
  const [vehicles, setVehicles]     = useState([]);
  const [drivers, setDrivers]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [view, setView]             = useState('kanban');
  const [showModal, setShowModal]   = useState(false);
  const [showComplete, setShowComplete] = useState(null);  // trip id to complete
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState(null);

  const [form, setForm] = useState({
    source: '', destination: '', vehicle_id: '', driver_id: '',
    cargo_weight: '', planned_distance: '',
  });
  const [completeForm, setCompleteForm] = useState({ actual_distance: '', fuel_consumed: '', final_odometer: '' });

  const authHeader = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...authHeader, 'Content-Type': 'application/json' };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, vRes, dRes] = await Promise.all([
        fetch(`${BASE_URL}/trips/`, { headers: authHeader }),
        fetch(`${BASE_URL}/vehicles/`, { headers: authHeader }),
        fetch(`${BASE_URL}/drivers/`, { headers: authHeader }),
      ]);
      if (tRes.ok) setTrips(await tRes.json());
      if (vRes.ok) setVehicles(await vRes.json());
      if (dRes.ok) setDrivers(await dRes.json());
    } catch { showToast('Network error loading data', 'error'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        cargo_weight: parseFloat(form.cargo_weight),
        planned_distance: parseFloat(form.planned_distance),
      };
      const res = await fetch(`${BASE_URL}/trips/`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify(payload) });
      if (res.ok) {
        showToast('✓ Trip created');
        setShowModal(false);
        setForm({ source: '', destination: '', vehicle_id: '', driver_id: '', cargo_weight: '', planned_distance: '' });
        fetchAll();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.detail || 'Failed to create trip', 'error');
      }
    } catch { showToast('Network error', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleAction = async (tripId, action) => {
    if (action === 'complete') { setShowComplete(tripId); return; }
    try {
      const res = await fetch(`${BASE_URL}/trips/${tripId}/${action}`, { method: 'POST', headers: jsonHeaders });
      if (res.ok) { showToast(`Trip ${action}d`); fetchAll(); }
      else { const err = await res.json().catch(() => ({})); showToast(err.detail || `Failed to ${action}`, 'error'); }
    } catch { showToast('Network error', 'error'); }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        actual_distance: parseFloat(completeForm.actual_distance),
        fuel_consumed: parseFloat(completeForm.fuel_consumed),
        final_odometer: parseFloat(completeForm.final_odometer),
      };
      const res = await fetch(`${BASE_URL}/trips/${showComplete}/complete`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify(payload) });
      if (res.ok) {
        showToast('✓ Trip completed');
        setShowComplete(null);
        setCompleteForm({ actual_distance: '', fuel_consumed: '', final_odometer: '' });
        fetchAll();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.detail || 'Failed to complete trip', 'error');
      }
    } catch { showToast('Network error', 'error'); }
    finally { setSubmitting(false); }
  };

  const filteredTrips = trips.filter(t =>
    t.source?.toLowerCase().includes(search.toLowerCase()) ||
    t.destination?.toLowerCase().includes(search.toLowerCase()) ||
    t.id?.toLowerCase().includes(search.toLowerCase())
  );

  const availableVehicles = vehicles.filter(v => v.status === 'available');
  const availableDrivers  = drivers.filter(d => d.status === 'available');

  return (
    <DashboardLayout pageTitle="Trips">
      <div className="space-y-lg">

        {/* Header */}
        <div className="page-header">
          <div>
            <h2 className="page-title">Trip Dispatcher</h2>
            <p className="page-subtitle">{trips.length} trips · {trips.filter(t => t.status === 'on_trip').length} active</p>
          </div>
          <div className="flex items-center gap-sm">
            <div className="flex bg-surface-container-high rounded-lg p-0.5">
              {['kanban', 'list'].map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-sm py-1 rounded text-label-caps font-bold uppercase transition-all ${view === v ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-secondary'}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{v === 'kanban' ? 'view_kanban' : 'view_list'}</span>
                </button>
              ))}
            </div>
            {canDispatch && (
              <button onClick={() => setShowModal(true)} className="btn-primary" id="new-trip-btn">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                New Trip
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '16px' }}>search</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search trip or route..." className="search-input pl-9" />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '32px' }}>autorenew</span>
          </div>
        ) : (
          <>
            {/* Kanban */}
            {view === 'kanban' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-md">
                {COLUMNS.map(col => {
                  const colTrips = filteredTrips.filter(t => t.status === col);
                  const sc = STATUS_CONFIG[col];
                  return (
                    <div key={col} className="space-y-sm">
                      <div className="flex items-center gap-xs px-sm">
                        <span className="material-symbols-outlined text-secondary" style={{ fontSize: '16px' }}>{sc.icon}</span>
                        <span className="text-label-caps font-bold text-on-surface uppercase tracking-wider">{sc.label}</span>
                        <span className="ml-auto w-5 h-5 bg-surface-container-high rounded-full flex items-center justify-center text-[10px] font-bold text-secondary">{colTrips.length}</span>
                      </div>
                      <div className="space-y-sm min-h-[80px]">
                        {colTrips.map(trip => (
                          <TripCard key={trip.id} trip={trip} vehicles={vehicles} drivers={drivers} onAction={handleAction} />
                        ))}
                        {colTrips.length === 0 && (
                          <div className="h-16 border-2 border-dashed border-outline-variant rounded-xl flex items-center justify-center text-body-sm text-outline">Empty</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* List */}
            {view === 'list' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-surface-container-high">
                        <th className="table-header-cell">Trip ID</th>
                        <th className="table-header-cell">Route</th>
                        <th className="table-header-cell">Vehicle</th>
                        <th className="table-header-cell">Driver</th>
                        <th className="table-header-cell">Distance</th>
                        <th className="table-header-cell">Status</th>
                        {canDispatch && <th className="table-header-cell">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {filteredTrips.map((trip, i) => {
                        const sc = STATUS_CONFIG[trip.status] || { label: trip.status, cls: 'status-draft' };
                        const vehicle = vehicles.find(v => v.id === trip.vehicle_id);
                        const driver = drivers.find(d => d.id === trip.driver_id);
                        return (
                          <motion.tr key={trip.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="table-row">
                            <td className="table-cell"><span className="data-mono text-[12px] text-primary">{trip.id.slice(0, 8).toUpperCase()}</span></td>
                            <td className="table-cell text-body-sm">
                              <span className="text-on-surface">{trip.source}</span>
                              <span className="text-outline mx-1">→</span>
                              <span className="text-on-surface">{trip.destination}</span>
                            </td>
                            <td className="table-cell text-body-sm">{vehicle?.name || '—'}</td>
                            <td className="table-cell text-body-sm">{driver?.full_name || '—'}</td>
                            <td className="table-cell"><span className="data-mono text-[12px]">{trip.planned_distance} km</span></td>
                            <td className="table-cell"><span className={sc.cls}>{sc.label}</span></td>
                            {canDispatch && (
                              <td className="table-cell">
                                <div className="flex gap-xs">
                                  {trip.status === 'draft' && (
                                    <button onClick={() => handleAction(trip.id, 'dispatch')}
                                      className="px-sm py-0.5 text-[10px] font-bold rounded bg-primary text-on-primary hover:opacity-90">Dispatch</button>
                                  )}
                                  {(trip.status === 'dispatched' || trip.status === 'on_trip') && (
                                    <>
                                      <button onClick={() => handleAction(trip.id, 'complete')}
                                        className="px-sm py-0.5 text-[10px] font-bold rounded bg-odoo-teal text-white hover:opacity-90">Complete</button>
                                      <button onClick={() => handleAction(trip.id, 'cancel')}
                                        className="px-sm py-0.5 text-[10px] font-bold rounded border border-error/40 text-error hover:bg-red-50">Cancel</button>
                                    </>
                                  )}
                                </div>
                              </td>
                            )}
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredTrips.length === 0 && (
                    <div className="py-16 text-center">
                      <span className="material-symbols-outlined text-outline" style={{ fontSize: '48px' }}>route</span>
                      <p className="text-body-sm text-secondary mt-2">{trips.length === 0 ? 'No trips yet. Create your first trip.' : 'No trips match search.'}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* New Trip Modal */}
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
                  <h3 className="text-headline-sm font-bold text-on-surface">New Trip</h3>
                  <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                  </button>
                </div>
                <form onSubmit={handleCreate} className="p-lg space-y-md">
                  <div className="grid grid-cols-2 gap-md">
                    <div>
                      <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Origin *</label>
                      <input required value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                        placeholder="Warehouse A" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low" />
                    </div>
                    <div>
                      <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Destination *</label>
                      <input required value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
                        placeholder="City Depot" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Vehicle *</label>
                    <select required value={form.vehicle_id} onChange={e => setForm(f => ({ ...f, vehicle_id: e.target.value }))}
                      className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low">
                      <option value="">Select available vehicle...</option>
                      {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.name} — {v.registration_number} ({v.max_load_capacity}T)</option>)}
                    </select>
                    {availableVehicles.length === 0 && <p className="text-xs text-amber-600 mt-1">⚠ No vehicles available right now.</p>}
                  </div>

                  <div>
                    <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Driver *</label>
                    <select required value={form.driver_id} onChange={e => setForm(f => ({ ...f, driver_id: e.target.value }))}
                      className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low">
                      <option value="">Select available driver...</option>
                      {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.full_name} — {d.license_category}</option>)}
                    </select>
                    {availableDrivers.length === 0 && <p className="text-xs text-amber-600 mt-1">⚠ No drivers available right now.</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-md">
                    <div>
                      <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Cargo Weight (T) *</label>
                      <input required type="number" step="0.1" value={form.cargo_weight} onChange={e => setForm(f => ({ ...f, cargo_weight: e.target.value }))}
                        placeholder="1.5" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low" />
                    </div>
                    <div>
                      <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Planned Distance (km) *</label>
                      <input required type="number" step="0.1" value={form.planned_distance} onChange={e => setForm(f => ({ ...f, planned_distance: e.target.value }))}
                        placeholder="25" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low" />
                    </div>
                  </div>

                  <div className="flex gap-sm pt-xs">
                    <button type="button" onClick={() => setShowModal(false)}
                      className="flex-1 py-sm px-md rounded-lg border border-outline-variant text-body-sm font-bold text-on-surface-variant hover:bg-surface-container-high">Cancel</button>
                    <button type="submit" disabled={submitting} className="flex-1 btn-primary disabled:opacity-60" id="submit-trip-btn">
                      {submitting ? <span className="flex items-center justify-center gap-xs"><span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>autorenew</span>Creating...</span> : 'Create Trip'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Complete Trip Modal */}
      <AnimatePresence>
        {showComplete && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setShowComplete(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
              <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant w-full max-w-md pointer-events-auto">
                <div className="flex justify-between items-center px-lg py-md border-b border-outline-variant">
                  <h3 className="text-headline-sm font-bold text-on-surface">Complete Trip</h3>
                  <button onClick={() => setShowComplete(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                  </button>
                </div>
                <form onSubmit={handleComplete} className="p-lg space-y-md">
                  <div>
                    <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Actual Distance (km) *</label>
                    <input required type="number" step="0.1" value={completeForm.actual_distance} onChange={e => setCompleteForm(f => ({ ...f, actual_distance: e.target.value }))}
                      placeholder="28.5" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low" />
                  </div>
                  <div>
                    <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Fuel Consumed (L) *</label>
                    <input required type="number" step="0.1" value={completeForm.fuel_consumed} onChange={e => setCompleteForm(f => ({ ...f, fuel_consumed: e.target.value }))}
                      placeholder="4.2" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low" />
                  </div>
                  <div>
                    <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Final Odometer (km) *</label>
                    <input required type="number" step="0.1" value={completeForm.final_odometer} onChange={e => setCompleteForm(f => ({ ...f, final_odometer: e.target.value }))}
                      placeholder="45238.5" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low" />
                  </div>
                  <div className="flex gap-sm pt-xs">
                    <button type="button" onClick={() => setShowComplete(null)}
                      className="flex-1 py-sm px-md rounded-lg border border-outline-variant text-body-sm font-bold text-on-surface-variant hover:bg-surface-container-high">Cancel</button>
                    <button type="submit" disabled={submitting} className="flex-1 btn-primary disabled:opacity-60">
                      {submitting ? 'Saving...' : 'Mark Complete'}
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
