/**
 * FuelExpensesPage — TransitOps Fuel & Expense Management
 * Fuel logs table + summary cards + expense categories
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';

const SUMMARY = [
  { label: 'Total Fuel Cost',    value: '₹1,24,800', sub: 'This month',   icon: 'local_gas_station', color: 'text-primary' },
  { label: 'Avg Cost/Vehicle',   value: '₹2,354',    sub: '53 vehicles',  icon: 'calculate',          color: 'text-secondary' },
  { label: 'Fuel Efficiency',    value: '8.4 km/L',  sub: 'Fleet average',icon: 'speed',              color: 'text-odoo-teal' },
  { label: 'Pending Claims',     value: '7',          sub: 'Approval req.',icon: 'pending_actions',    color: 'text-on-tertiary-container' },
];

const EXPENSES = [
  { id: 'EXP-001', date: '2024-06-26', vehicle: 'VAN-05',  driver: 'Alex Kumar',     type: 'Diesel',   liters: 45,  costPerL: '₹92', total: '₹4,140',  status: 'approved' },
  { id: 'EXP-002', date: '2024-06-26', vehicle: 'TRX-12',  driver: 'Sam Patel',      type: 'CNG',      liters: 80,  costPerL: '₹85', total: '₹6,800',  status: 'approved' },
  { id: 'EXP-003', date: '2024-06-25', vehicle: 'MINI-08', driver: 'Priya Mehta',    type: 'Diesel',   liters: 30,  costPerL: '₹92', total: '₹2,760',  status: 'pending'  },
  { id: 'EXP-004', date: '2024-06-25', vehicle: 'BUS-02',  driver: 'Rita Singh',     type: 'Diesel',   liters: 120, costPerL: '₹92', total: '₹11,040', status: 'approved' },
  { id: 'EXP-005', date: '2024-06-24', vehicle: 'VAN-09',  driver: 'John Fernandez', type: 'Petrol',   liters: 38,  costPerL: '₹102',total: '₹3,876',  status: 'rejected' },
  { id: 'EXP-006', date: '2024-06-24', vehicle: 'TRX-15',  driver: 'Alex Kumar',     type: 'Diesel',   liters: 65,  costPerL: '₹92', total: '₹5,980',  status: 'pending'  },
  { id: 'EXP-007', date: '2024-06-23', vehicle: 'VAN-03',  driver: 'Suresh Rao',     type: 'Diesel',   liters: 42,  costPerL: '₹92', total: '₹3,864',  status: 'approved' },
];

const STATUS_MAP = {
  approved: { cls: 'status-completed', label: 'Approved' },
  pending:  { cls: 'status-dispatched', label: 'Pending'  },
  rejected: { cls: 'status-delayed',   label: 'Rejected' },
};

const FUEL_BREAKDOWN = [
  { type: 'Diesel', pct: 68, color: 'bg-primary'           },
  { type: 'CNG',    pct: 22, color: 'bg-secondary'         },
  { type: 'Petrol', pct: 10, color: 'bg-on-tertiary-container' },
];

export default function FuelExpensesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = EXPENSES.filter((e) => {
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchSearch = e.id.toLowerCase().includes(search.toLowerCase()) ||
                        e.vehicle.toLowerCase().includes(search.toLowerCase()) ||
                        e.driver.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <DashboardLayout pageTitle="Fuel & Expenses">
      <div className="space-y-lg">

        {/* Header */}
        <div className="page-header">
          <div>
            <h2 className="page-title">Fuel & Expenses</h2>
            <p className="page-subtitle">June 2024 — Fleet expense tracking</p>
          </div>
          <button className="btn-primary">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
            Log Expense
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
          {SUMMARY.map((s, i) => (
            <motion.div
              key={s.label}
              custom={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.3 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-xs">
                <span className="text-label-caps font-bold text-secondary uppercase opacity-70">{s.label}</span>
                <span className={`material-symbols-outlined ${s.color}`} style={{ fontSize: '20px' }}>{s.icon}</span>
              </div>
              <div>
                <span className={`text-headline-md font-bold data-mono ${s.color}`}>{s.value}</span>
                <p className="text-label-caps text-secondary mt-1">{s.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">

          {/* Expenses Table */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-8 card overflow-hidden"
          >
            {/* Table Controls */}
            <div className="p-md border-b border-outline-variant bg-surface-container-low flex flex-wrap gap-sm items-center justify-between">
              <h3 className="text-headline-sm font-bold text-on-surface">Fuel Logs</h3>
              <div className="flex items-center gap-sm">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent border-none text-label-caps font-bold text-secondary outline-none cursor-pointer text-xs uppercase tracking-wider"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '14px' }}>search</span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="pl-7 pr-sm py-1 text-body-sm border border-outline-variant rounded focus:ring-2 focus:ring-primary/20 outline-none bg-surface-container-lowest w-40"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-high">
                    <th className="table-header-cell">Exp ID</th>
                    <th className="table-header-cell">Date</th>
                    <th className="table-header-cell">Vehicle</th>
                    <th className="table-header-cell">Driver</th>
                    <th className="table-header-cell">Type</th>
                    <th className="table-header-cell text-right">Liters</th>
                    <th className="table-header-cell text-right">Total</th>
                    <th className="table-header-cell">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filtered.map((exp, i) => {
                    const sm = STATUS_MAP[exp.status];
                    return (
                      <motion.tr
                        key={exp.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="table-row"
                      >
                        <td className="table-cell"><span className="data-mono text-[12px] text-primary">{exp.id}</span></td>
                        <td className="table-cell text-body-sm text-on-surface-variant">{exp.date}</td>
                        <td className="table-cell"><span className="data-mono text-[13px] font-bold text-on-surface">{exp.vehicle}</span></td>
                        <td className="table-cell text-body-sm text-on-surface">{exp.driver}</td>
                        <td className="table-cell text-body-sm text-on-surface">{exp.type}</td>
                        <td className="table-cell text-right"><span className="data-mono text-[13px]">{exp.liters}L</span></td>
                        <td className="table-cell text-right"><span className="data-mono text-[13px] font-bold text-on-surface">{exp.total}</span></td>
                        <td className="table-cell"><span className={sm.cls}>{sm.label}</span></td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Right: Fuel Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-4 space-y-lg"
          >
            <div className="card p-md space-y-md">
              <h3 className="text-headline-sm font-bold text-on-surface">Fuel Breakdown</h3>
              <div className="space-y-sm">
                {FUEL_BREAKDOWN.map((item, i) => (
                  <div key={item.type} className="space-y-1">
                    <div className="flex justify-between text-label-caps font-bold text-secondary uppercase">
                      <span>{item.type}</span>
                      <span className="data-mono text-on-surface">{item.pct}%</span>
                    </div>
                    <div className="progress-bar-track">
                      <motion.div
                        className={`progress-bar-fill ${item.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.pct}%` }}
                        transition={{ delay: 0.3 + i * 0.15, duration: 0.7 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-sm border-t border-outline-variant">
                <p className="text-label-caps text-secondary font-bold uppercase mb-sm">Monthly Trend</p>
                {['Apr', 'May', 'Jun'].map((month, i) => (
                  <div key={month} className="flex items-center gap-sm mb-xs">
                    <span className="text-body-sm text-secondary w-8">{month}</span>
                    <div className="flex-1 bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: ['65%', '80%', '100%'][i] }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                      />
                    </div>
                    <span className="data-mono text-[12px] text-on-surface w-16 text-right">
                      {['₹98K', '₹1.1L', '₹1.2L'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
