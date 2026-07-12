/**
 * FuelExpensesPage — fully connected to backend API
 * GET /api/fuel-expenses/fuel, POST /api/fuel-expenses/fuel (log fuel)
 * GET /api/fuel-expenses/expenses, POST /api/fuel-expenses/expenses (log expense)
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const EXPENSE_TYPES = ['toll', 'maintenance', 'parking', 'other'];
const EXPENSE_LABELS = { toll: 'Toll', maintenance: 'Maintenance', parking: 'Parking', other: 'Other' };

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

export default function FuelExpensesPage() {
  const { token, user } = useAuth();
  const canAdd = user?.role === 'admin' || user?.role === 'fleet_manager' || user?.role === 'financial_analyst';

  const [fuels, setFuels]           = useState([]);
  const [expenses, setExpenses]     = useState([]);
  const [vehicles, setVehicles]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState('fuel');  // 'fuel' | 'expenses'
  const [showModal, setShowModal]   = useState(null);    // 'fuel' | 'expense' | null
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState(null);

  const [fuelForm, setFuelForm] = useState({
    vehicle_id: '', liters: '', cost: '', log_date: new Date().toISOString().split('T')[0], odometer_reading: '',
  });
  const [expForm, setExpForm] = useState({
    vehicle_id: '', expense_type: 'toll', amount: '', description: '', expense_date: new Date().toISOString().split('T')[0],
  });

  const authHeader = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...authHeader, 'Content-Type': 'application/json' };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [fRes, eRes, vRes] = await Promise.all([
        fetch(`${BASE_URL}/fuel-expenses/fuel`, { headers: authHeader }),
        fetch(`${BASE_URL}/fuel-expenses/expenses`, { headers: authHeader }),
        fetch(`${BASE_URL}/vehicles/`, { headers: authHeader }),
      ]);
      if (fRes.ok) setFuels(await fRes.json());
      if (eRes.ok) setExpenses(await eRes.json());
      if (vRes.ok) setVehicles(await vRes.json());
    } catch { showToast('Network error loading data', 'error'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleLogFuel = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        vehicle_id: fuelForm.vehicle_id,
        liters: parseFloat(fuelForm.liters),
        cost: fuelForm.cost,
        log_date: fuelForm.log_date,
        odometer_reading: fuelForm.odometer_reading ? parseFloat(fuelForm.odometer_reading) : null,
      };
      const res = await fetch(`${BASE_URL}/fuel-expenses/fuel`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify(payload) });
      if (res.ok) {
        showToast('✓ Fuel log added');
        setShowModal(null);
        setFuelForm({ vehicle_id: '', liters: '', cost: '', log_date: new Date().toISOString().split('T')[0], odometer_reading: '' });
        fetchAll();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.detail || 'Failed to log fuel', 'error');
      }
    } catch { showToast('Network error', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleLogExpense = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        expense_type: expForm.expense_type,
        amount: expForm.amount,
        description: expForm.description || null,
        expense_date: expForm.expense_date,
        vehicle_id: expForm.vehicle_id || null,
      };
      const res = await fetch(`${BASE_URL}/fuel-expenses/expenses`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify(payload) });
      if (res.ok) {
        showToast('✓ Expense logged');
        setShowModal(null);
        setExpForm({ vehicle_id: '', expense_type: 'toll', amount: '', description: '', expense_date: new Date().toISOString().split('T')[0] });
        fetchAll();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.detail || 'Failed to log expense', 'error');
      }
    } catch { showToast('Network error', 'error'); }
    finally { setSubmitting(false); }
  };

  // Summary
  const totalFuelCost = fuels.reduce((s, f) => s + Number(f.cost), 0);
  const totalExpense  = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalLiters   = fuels.reduce((s, f) => s + f.liters, 0);

  const vehicleMap = {};
  vehicles.forEach(v => { vehicleMap[v.id] = v.name || v.registration_number; });

  return (
    <DashboardLayout pageTitle="Fuel & Expenses">
      <div className="space-y-lg">

        {/* Header */}
        <div className="page-header">
          <div>
            <h2 className="page-title">Fuel & Expenses</h2>
            <p className="page-subtitle">Fleet expense tracking — real-time</p>
          </div>
          {canAdd && (
            <div className="flex gap-sm">
              <button onClick={() => setShowModal('fuel')} className="btn-secondary" id="log-fuel-btn">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>local_gas_station</span>
                Log Fuel
              </button>
              <button onClick={() => setShowModal('expense')} className="btn-primary" id="log-expense-btn">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>receipt_long</span>
                Log Expense
              </button>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          {[
            { label: 'Total Fuel Cost',   value: `₹${totalFuelCost.toLocaleString()}`,      icon: 'local_gas_station', color: 'text-primary' },
            { label: 'Other Expenses',    value: `₹${totalExpense.toLocaleString()}`,         icon: 'receipt_long',      color: 'text-on-tertiary-container' },
            { label: 'Total Fuel (L)',    value: `${totalLiters.toFixed(0)}L`,                icon: 'water_drop',        color: 'text-odoo-teal' },
            { label: 'Total Records',     value: fuels.length + expenses.length,              icon: 'bar_chart',         color: 'text-secondary' },
          ].map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="stat-card">
              <div className="flex items-center justify-between">
                <span className="text-label-caps font-bold text-secondary uppercase opacity-70">{card.label}</span>
                <span className={`material-symbols-outlined ${card.color}`} style={{ fontSize: '20px' }}>{card.icon}</span>
              </div>
              <span className={`text-display-lg data-mono font-bold mt-xs block ${card.color}`}>{card.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Tab Switch */}
        <div className="flex gap-xs">
          {[{ key: 'fuel', label: 'Fuel Logs', icon: 'local_gas_station' }, { key: 'expenses', label: 'Other Expenses', icon: 'receipt_long' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-xs px-sm py-1.5 rounded-full text-label-caps font-bold uppercase transition-all ${
                tab === t.key ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-secondary hover:bg-surface-container-highest'
              }`}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Fuel Logs Table */}
        {tab === 'fuel' && (
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
                      <th className="table-header-cell">Date</th>
                      <th className="table-header-cell">Vehicle</th>
                      <th className="table-header-cell text-right">Liters</th>
                      <th className="table-header-cell text-right">Cost (₹)</th>
                      <th className="table-header-cell text-right">Odometer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {fuels.map((f, i) => (
                      <motion.tr key={f.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="table-row">
                        <td className="table-cell text-body-sm text-on-surface-variant">{f.log_date}</td>
                        <td className="table-cell"><span className="data-mono text-[13px] font-bold text-on-surface">{vehicleMap[f.vehicle_id] || '—'}</span></td>
                        <td className="table-cell text-right"><span className="data-mono text-[13px]">{f.liters}L</span></td>
                        <td className="table-cell text-right"><span className="data-mono text-[13px] font-bold text-primary">₹{Number(f.cost).toLocaleString()}</span></td>
                        <td className="table-cell text-right"><span className="data-mono text-[12px] text-secondary">{f.odometer_reading ? `${f.odometer_reading} km` : '—'}</span></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {fuels.length === 0 && (
                  <div className="py-16 text-center">
                    <span className="material-symbols-outlined text-outline" style={{ fontSize: '48px' }}>local_gas_station</span>
                    <p className="text-body-sm text-secondary mt-2">No fuel logs yet. Log your first fuel fill-up.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Expenses Table */}
        {tab === 'expenses' && (
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
                      <th className="table-header-cell">Date</th>
                      <th className="table-header-cell">Vehicle</th>
                      <th className="table-header-cell">Type</th>
                      <th className="table-header-cell">Description</th>
                      <th className="table-header-cell text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {expenses.map((ex, i) => (
                      <motion.tr key={ex.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="table-row">
                        <td className="table-cell text-body-sm text-on-surface-variant">{ex.expense_date}</td>
                        <td className="table-cell"><span className="data-mono text-[13px] font-bold text-on-surface">{vehicleMap[ex.vehicle_id] || '—'}</span></td>
                        <td className="table-cell">
                          <span className="status-chip bg-surface-container-high text-on-surface capitalize">{EXPENSE_LABELS[ex.expense_type] || ex.expense_type}</span>
                        </td>
                        <td className="table-cell text-body-sm text-on-surface-variant">{ex.description || '—'}</td>
                        <td className="table-cell text-right"><span className="data-mono text-[13px] font-bold text-primary">₹{Number(ex.amount).toLocaleString()}</span></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {expenses.length === 0 && (
                  <div className="py-16 text-center">
                    <span className="material-symbols-outlined text-outline" style={{ fontSize: '48px' }}>receipt_long</span>
                    <p className="text-body-sm text-secondary mt-2">No expense records yet.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Log Fuel Modal */}
      <AnimatePresence>
        {showModal === 'fuel' && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setShowModal(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
              <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant w-full max-w-md pointer-events-auto">
                <div className="flex justify-between items-center px-lg py-md border-b border-outline-variant">
                  <h3 className="text-headline-sm font-bold text-on-surface">Log Fuel Fill-up</h3>
                  <button onClick={() => setShowModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                  </button>
                </div>
                <form onSubmit={handleLogFuel} className="p-lg space-y-md">
                  <div>
                    <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Vehicle *</label>
                    <select required value={fuelForm.vehicle_id} onChange={e => setFuelForm(f => ({ ...f, vehicle_id: e.target.value }))}
                      className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low">
                      <option value="">Select vehicle...</option>
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} — {v.registration_number}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-md">
                    <div>
                      <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Liters *</label>
                      <input required type="number" step="0.1" value={fuelForm.liters} onChange={e => setFuelForm(f => ({ ...f, liters: e.target.value }))}
                        placeholder="45.5" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low" />
                    </div>
                    <div>
                      <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Total Cost (₹) *</label>
                      <input required type="number" step="0.01" value={fuelForm.cost} onChange={e => setFuelForm(f => ({ ...f, cost: e.target.value }))}
                        placeholder="4180" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-md">
                    <div>
                      <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Date *</label>
                      <input required type="date" value={fuelForm.log_date} onChange={e => setFuelForm(f => ({ ...f, log_date: e.target.value }))}
                        className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low" />
                    </div>
                    <div>
                      <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Odometer (km)</label>
                      <input type="number" step="0.1" value={fuelForm.odometer_reading} onChange={e => setFuelForm(f => ({ ...f, odometer_reading: e.target.value }))}
                        placeholder="45238" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low" />
                    </div>
                  </div>
                  <div className="flex gap-sm pt-xs">
                    <button type="button" onClick={() => setShowModal(null)} className="flex-1 py-sm px-md rounded-lg border border-outline-variant text-body-sm font-bold text-on-surface-variant hover:bg-surface-container-high">Cancel</button>
                    <button type="submit" disabled={submitting} className="flex-1 btn-primary disabled:opacity-60" id="submit-fuel-btn">
                      {submitting ? 'Saving...' : 'Log Fuel'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Log Expense Modal */}
      <AnimatePresence>
        {showModal === 'expense' && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setShowModal(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
              <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant w-full max-w-md pointer-events-auto">
                <div className="flex justify-between items-center px-lg py-md border-b border-outline-variant">
                  <h3 className="text-headline-sm font-bold text-on-surface">Log Expense</h3>
                  <button onClick={() => setShowModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                  </button>
                </div>
                <form onSubmit={handleLogExpense} className="p-lg space-y-md">
                  <div>
                    <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Expense Type *</label>
                    <div className="grid grid-cols-2 gap-sm">
                      {EXPENSE_TYPES.map(et => (
                        <button key={et} type="button" onClick={() => setExpForm(f => ({ ...f, expense_type: et }))}
                          className={`flex items-center gap-sm p-sm rounded-xl border-2 transition-all capitalize ${
                            expForm.expense_type === et ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant text-secondary hover:border-primary/40'
                          }`}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                            {et === 'toll' ? 'toll' : et === 'maintenance' ? 'build' : et === 'parking' ? 'local_parking' : 'more_horiz'}
                          </span>
                          {EXPENSE_LABELS[et]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Vehicle (optional)</label>
                    <select value={expForm.vehicle_id} onChange={e => setExpForm(f => ({ ...f, vehicle_id: e.target.value }))}
                      className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low">
                      <option value="">No specific vehicle</option>
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} — {v.registration_number}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-md">
                    <div>
                      <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Amount (₹) *</label>
                      <input required type="number" step="0.01" value={expForm.amount} onChange={e => setExpForm(f => ({ ...f, amount: e.target.value }))}
                        placeholder="500" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low" />
                    </div>
                    <div>
                      <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Date *</label>
                      <input required type="date" value={expForm.expense_date} onChange={e => setExpForm(f => ({ ...f, expense_date: e.target.value }))}
                        className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-label-caps font-bold text-secondary uppercase mb-1">Description</label>
                    <input value={expForm.description} onChange={e => setExpForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="e.g. Highway toll on NH-48" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-sm bg-surface-container-low" />
                  </div>
                  <div className="flex gap-sm pt-xs">
                    <button type="button" onClick={() => setShowModal(null)} className="flex-1 py-sm px-md rounded-lg border border-outline-variant text-body-sm font-bold text-on-surface-variant hover:bg-surface-container-high">Cancel</button>
                    <button type="submit" disabled={submitting} className="flex-1 btn-primary disabled:opacity-60" id="submit-expense-btn">
                      {submitting ? 'Saving...' : 'Log Expense'}
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
