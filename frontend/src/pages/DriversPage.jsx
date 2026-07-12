/**
 * DriversPage — fully connected to backend API
 * GET /api/drivers, POST /api/drivers, DELETE/deactivate
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const STATUS_MAP = {
  available: { cls: 'status-available', label: 'Available' },
  on_trip:   { cls: 'status-on-trip',   label: 'On Trip'  },
  off_duty:  { cls: 'status-draft',     label: 'Off Duty' },
  suspended: { cls: 'status-delayed',   label: 'Suspended' },
};

function SafetyScore({ score }) {
  const color = score >= 90 ? '#017E84' : score >= 75 ? '#714b67' : '#ba1a1a';
  const circumference = 2 * Math.PI * 20;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex items-center gap-xs">
      <svg width="36" height="36" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="20" fill="none" stroke="#e5e8ee" strokeWidth="3" />
        <motion.circle cx="22" cy="22" r="20" fill="none" stroke={color} strokeWidth="3"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference}
          animate={{ strokeDashoffset: offset }} transition={{ duration: 1, delay: 0.3 }}
          style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }} />
      </svg>
      <span className="data-mono text-[13px] font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

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

export default function DriversPage() {
  const { token, user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'fleet_manager' || user?.role === 'safety_officer';

  const [drivers, setDrivers]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState(null);
  const [showModal, setShowModal]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState(null);
  const [view, setView]             = useState('list'); // 'card' | 'list'

  const [form, setForm] = useState({
    full_name: '', license_number: '', license_category: 'LMV',
    license_expiry_date: '', contact_number: '',
  });

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/drivers/`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setDrivers(await res.json());
      else showToast('Failed to load drivers', 'error');
    } catch { showToast('Network error loading drivers', 'error'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/drivers/`, { method: 'POST', headers, body: JSON.stringify(form) });
      if (res.ok) {
        showToast(`✓ Driver "${form.full_name}" added`);
        setShowModal(false);
        setForm({ full_name: '', license_number: '', license_category: 'LMV', license_expiry_date: '', contact_number: '' });
        fetchDrivers();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.detail || 'Failed to add driver', 'error');
      }
    } catch { showToast('Network error', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleStatusChange = async (driverId, newStatus) => {
    try {
      const res = await fetch(`${BASE_URL}/drivers/${driverId}`, {
        method: 'PUT', headers, body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        showToast('Driver status updated');
        setSelected(updated);
        fetchDrivers();
      }
      else { const err = await res.json().catch(() => ({})); showToast(err.detail || 'Failed to update', 'error'); }
    } catch { showToast('Network error', 'error'); }
  };

  const filtered = drivers.filter(d =>
    d.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.license_number?.toLowerCase().includes(search.toLowerCase()) ||
    d.license_category?.toLowerCase().includes(search.toLowerCase())
  );

  const initials = (name = '') => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <DashboardLayout pageTitle="Drivers">
      <div className="space-y-lg">

        {/* Header */}
        <div className="page-header">
          <div>
            <h2 className="page-title">Drivers & Safety Profiles</h2>
            <p className="page-subtitle">{drivers.length} registered drivers</p>
          </div>
          <div className="flex items-center gap-sm">
            {/* View Toggle */}
            <div className="flex bg-surface-container-high rounded-lg p-0.5">
              {['card', 'list'].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-sm py-1 rounded text-label-caps font-bold uppercase transition-all ${
                    view === v ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-secondary'
                  }`}
                  title={v === 'card' ? 'Card View' : 'Table View'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    {v === 'card' ? 'grid_view' : 'view_list'}
                  </span>
                </button>
              ))}
            </div>
            {canEdit && (
              <button onClick={() => setShowModal(true)} className="btn-primary" id="add-driver-btn">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person_add</span>
                Add Driver
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '16px' }}>search</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search driver or license..." className="search-input pl-9" />
        </div>

        {/* Grid/List views */}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '32px' }}>autorenew</span>
          </div>
        ) : (
          <>
            {view === 'card' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
                {filtered.map((driver, i) => {
                  const sm = STATUS_MAP[driver.status] || { cls: 'status-draft', label: driver.status };
                  const isSelected = selected?.id === driver.id;
                  const isExpired = driver.license_expired;
                  return (
                    <motion.div key={driver.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }} onClick={() => setSelected(isSelected ? null : driver)}
                      className={`card p-md cursor-pointer transition-all hover:border-primary hover:shadow-sm ${isSelected ? 'border-primary ring-2 ring-primary/20' : ''}`}>

                      <div className="flex items-start justify-between mb-sm">
                        <div className="flex items-center gap-sm">
                          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0">
                            <span className="text-body-sm font-bold text-primary">{initials(driver.full_name)}</span>
                          </div>
                          <div>
                            <p className="text-body-sm font-bold text-on-surface">{driver.full_name}</p>
                            <p className="text-label-caps text-secondary">{driver.license_category} License</p>
                          </div>
                        </div>
                        <span className={sm.cls}>{sm.label}</span>
                      </div>

                      <div className="flex items-center justify-between mb-sm">
                        <SafetyScore score={Math.round(driver.safety_score || 80)} />
                        <div className="text-right">
                          <p className="data-mono text-[13px] font-bold text-on-surface">{driver.total_trips || 0}</p>
                          <p className="text-label-caps text-secondary">Trips</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-xs border-t border-outline-variant/60">
                        <span className="data-mono text-[11px] text-secondary">{driver.license_number}</span>
                        {isExpired && (
                          <span className="flex items-center gap-xs text-[10px] text-red-600 font-bold">
                            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>warning</span>
                            Expired
                          </span>
                        )}
                        {!isExpired && (
                          <span className="text-[10px] text-secondary">Exp: {driver.license_expiry_date}</span>
                        )}
                      </div>

                      {canEdit && (
                        <div className="flex gap-xs mt-sm pt-xs border-t border-outline-variant/40" onClick={e => e.stopPropagation()}>
                          {driver.status !== 'off_duty' && (
                            <button onClick={() => handleStatusChange(driver.id, 'off_duty')}
                              className="flex-1 py-1 text-[10px] font-bold rounded border border-outline-variant text-secondary hover:bg-surface-container-high transition-colors">
                              Mark Off Duty
                            </button>
                          )}
                          {driver.status === 'off_duty' && (
                            <button onClick={() => handleStatusChange(driver.id, 'available')}
                              className="flex-1 py-1 text-[10px] font-bold rounded border border-primary text-primary hover:bg-primary/5 transition-colors">
                              Mark Available
                            </button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="col-span-3 py-16 text-center">
                    <span className="material-symbols-outlined text-outline" style={{ fontSize: '48px' }}>person_off</span>
                    <p className="text-body-sm text-secondary mt-2">{drivers.length === 0 ? 'No drivers yet. Add your first driver.' : 'No drivers match the search.'}</p>
                  </div>
                )}
              </div>
            )}

            {view === 'list' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-surface-container-high">
                        <th className="table-header-cell">Driver</th>
                        <th className="table-header-cell">License No.</th>
                        <th className="table-header-cell">Category</th>
                        <th className="table-header-cell">Expiry</th>
                        <th className="table-header-cell">Contact</th>
                        <th className="table-header-cell">Trips</th>
                        <th className="table-header-cell">Safety</th>
                        <th className="table-header-cell">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {filtered.map((driver, i) => {
                        const sm = STATUS_MAP[driver.status] || { cls: 'status-draft', label: driver.status };
                        const isSelected = selected?.id === driver.id;
                        const isExpired = driver.license_expired;
                        return (
                          <motion.tr
                            key={driver.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => setSelected(isSelected ? null : driver)}
                            className={`table-row cursor-pointer ${
                              isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                            }`}
                          >
                            <td className="table-cell">
                              <div className="flex items-center gap-sm">
                                <div className="w-8 h-8 bg-primary-fixed rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-[11px] font-bold text-primary">{initials(driver.full_name)}</span>
                                </div>
                                <span className="font-bold text-on-surface">{driver.full_name}</span>
                              </div>
                            </td>
                            <td className="table-cell text-body-sm data-mono text-secondary">{driver.license_number}</td>
                            <td className="table-cell text-body-sm text-on-surface">{driver.license_category}</td>
                            <td className="table-cell text-body-sm text-on-surface-variant">
                              {isExpired ? (
                                <span className="text-red-600 font-bold flex items-center gap-0.5 animate-pulse">
                                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
                                  {driver.license_expiry_date}
                                </span>
                              ) : (
                                driver.license_expiry_date
                              )}
                            </td>
                            <td className="table-cell text-body-sm text-on-surface">{driver.contact_number || '—'}</td>
                            <td className="table-cell text-body-sm data-mono text-on-surface">{driver.total_trips || 0}</td>
                            <td className="table-cell">
                              <span className="font-bold text-sm" style={{ color: driver.safety_score >= 90 ? '#017E84' : driver.safety_score >= 75 ? '#714b67' : '#ba1a1a' }}>
                                {Math.round(driver.safety_score || 80)}%
                              </span>
                            </td>
                            <td className="table-cell"><span className={sm.cls}>{sm.label}</span></td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filtered.length === 0 && (
                    <div className="py-16 text-center">
                      <span className="material-symbols-outlined text-outline" style={{ fontSize: '48px' }}>person_off</span>
                      <p className="text-body-sm text-secondary mt-2">No drivers found</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Detail Panel */}
        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} className="card p-lg">
              <div className="flex items-center justify-between mb-lg">
                <div className="flex items-center gap-md">
                  <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center">
                    <span className="text-headline-sm font-bold text-primary">{initials(selected.full_name)}</span>
                  </div>
                  <div>
                    <h3 className="text-headline-sm font-bold text-on-surface">{selected.full_name}</h3>
                    <p className="text-body-sm text-secondary">{selected.license_category} · {selected.contact_number || 'No phone'}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-outline hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-md text-sm">
                {[
                  { label: 'License No.',    value: selected.license_number },
                  { label: 'Category',       value: selected.license_category },
                  { label: 'Expiry Date',    value: selected.license_expiry_date },
                  { label: 'Safety Score',   value: `${Math.round(selected.safety_score || 80)}/100` },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-label-caps text-secondary font-bold uppercase mb-xs">{item.label}</p>
                    <p className="data-mono text-[13px] text-on-surface">{item.value}</p>
                  </div>
                ))}
              </div>

              {canEdit && (
                <div className="mt-lg pt-md border-t border-outline-variant">
                  <p className="text-label-caps text-secondary font-bold uppercase mb-xs">Toggle Stat</p>
                  <div className="flex flex-wrap gap-xs">
                    {[
                      { key: 'available', label: 'Available', cls: 'status-available hover:brightness-95' },
                      { key: 'on_trip',   label: 'On Trip',   cls: 'status-on-trip hover:brightness-95' },
                      { key: 'off_duty',  label: 'Off Duty',  cls: 'status-draft hover:brightness-95' },
                      { key: 'suspended', label: 'Suspended', cls: 'status-delayed hover:brightness-95' },
                    ].map(stat => (
                      <button
                        key={stat.key}
                        type="button"
                        onClick={() => handleStatusChange(selected.id, stat.key)}
                        className={`px-sm py-1.5 rounded-full text-label-caps font-bold uppercase transition-all ${stat.cls} ${
                          selected.status === stat.key ? 'ring-2 ring-primary/40' : 'opacity-70'
                        }`}
                      >
                        {stat.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-amber-600 italic mt-xs font-semibold">
                    Rule: Expired license or Suspended status blocks the driver from trip assignment.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Driver Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 24 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
              <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant w-full max-w-lg pointer-events-auto">
                <div className="flex justify-between items-center px-lg py-md border-b border-outline-variant">
                  <h3 className="text-headline-sm font-bold text-on-surface">Add Driver</h3>
                  <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                  </button>
                </div>
                <form onSubmit={handleAdd} className="p-lg space-y-md">
                  <div>
                    <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Full Name *</label>
                    <input required value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                      placeholder="Alex Kumar" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low" />
                  </div>
                  <div className="grid grid-cols-2 gap-md">
                    <div>
                      <label className="block text-label-caps font-bold text-secondary uppercase mb-1">License Number *</label>
                      <input required value={form.license_number} onChange={e => setForm(f => ({ ...f, license_number: e.target.value }))}
                        placeholder="MH-1234567" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low" />
                    </div>
                    <div>
                      <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Category *</label>
                      <select required value={form.license_category} onChange={e => setForm(f => ({ ...f, license_category: e.target.value }))}
                        className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low">
                        {['LMV', 'HMV', 'PSV', 'TRANS', 'HTV'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-md">
                    <div>
                      <label className="block text-label-caps font-bold text-secondary uppercase mb-1">License Expiry *</label>
                      <input required type="date" value={form.license_expiry_date} onChange={e => setForm(f => ({ ...f, license_expiry_date: e.target.value }))}
                        className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low" />
                    </div>
                    <div>
                      <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Phone</label>
                      <input value={form.contact_number} onChange={e => setForm(f => ({ ...f, contact_number: e.target.value }))}
                        placeholder="+91 98765 43210" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low" />
                    </div>
                  </div>
                  <div className="flex gap-sm pt-xs">
                    <button type="button" onClick={() => setShowModal(false)}
                      className="flex-1 py-sm px-md rounded-lg border border-outline-variant text-body-sm font-bold text-on-surface-variant hover:bg-surface-container-high">Cancel</button>
                    <button type="submit" disabled={submitting} className="flex-1 btn-primary disabled:opacity-60" id="submit-driver-btn">
                      {submitting ? <span className="flex items-center justify-center gap-xs"><span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>autorenew</span>Saving...</span> : 'Add Driver'}
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
