/**
 * MaintenancePage — TransitOps Maintenance Schedule & History
 * Maintenance jobs table with status, priority, technician assignment
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';

const SUMMARY_CARDS = [
  { label: 'In Shop Now', value: '05', icon: 'build',         color: 'text-on-tertiary-container' },
  { label: 'Scheduled',   value: '12', icon: 'calendar_today',color: 'text-primary'               },
  { label: 'Completed',   value: '38', icon: 'check_circle',  color: 'text-odoo-teal'             },
  { label: 'Overdue',     value: '02', icon: 'warning',       color: 'text-error'                 },
];

const JOBS = [
  { id: 'MNT-001', vehicle: 'VAN-11',  type: 'Engine Overhaul',      tech: 'Rajesh M.',  priority: 'high',   status: 'in-progress', startDate: '2024-06-25', estDone: '2024-06-28', cost: '₹18,500' },
  { id: 'MNT-002', vehicle: 'TRX-08',  type: 'Brake Replacement',    tech: 'Dev K.',     priority: 'high',   status: 'in-progress', startDate: '2024-06-24', estDone: '2024-06-26', cost: '₹8,200'  },
  { id: 'MNT-003', vehicle: 'VAN-05',  type: 'Oil & Filter Change',  tech: 'Pradeep S.', priority: 'normal', status: 'scheduled',   startDate: '2024-06-28', estDone: '2024-06-28', cost: '₹2,100'  },
  { id: 'MNT-004', vehicle: 'BUS-02',  type: 'Tyre Rotation',        tech: 'Rajesh M.',  priority: 'normal', status: 'scheduled',   startDate: '2024-06-29', estDone: '2024-06-29', cost: '₹1,500'  },
  { id: 'MNT-005', vehicle: 'TRX-12',  type: 'Annual Inspection',    tech: 'Dev K.',     priority: 'low',    status: 'scheduled',   startDate: '2024-07-02', estDone: '2024-07-02', cost: '₹3,000'  },
  { id: 'MNT-006', vehicle: 'VAN-01',  type: 'AC Service',           tech: 'Pradeep S.', priority: 'low',    status: 'scheduled',   startDate: '2024-07-05', estDone: '2024-07-05', cost: '₹4,800'  },
  { id: 'MNT-007', vehicle: 'MINI-08', type: 'Suspension Check',     tech: 'Rajesh M.',  priority: 'normal', status: 'completed',   startDate: '2024-06-20', estDone: '2024-06-21', cost: '₹5,400'  },
  { id: 'MNT-008', vehicle: 'VAN-09',  type: 'Annual Inspection',    tech: 'Dev K.',     priority: 'high',   status: 'overdue',     startDate: '2024-06-18', estDone: '2024-06-20', cost: '₹3,000'  },
];

const STATUS_CONFIG = {
  'in-progress': { cls: 'status-on-trip',    label: 'In Progress' },
  'scheduled':   { cls: 'status-dispatched', label: 'Scheduled'   },
  'completed':   { cls: 'status-completed',  label: 'Completed'   },
  'overdue':     { cls: 'status-delayed',    label: 'Overdue'     },
};

const PRIORITY_CONFIG = {
  high:   'text-error',
  normal: 'text-secondary',
  low:    'text-outline',
};

const FILTER_TABS = [
  { key: 'all',         label: 'All'         },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'scheduled',   label: 'Scheduled'   },
  { key: 'overdue',     label: 'Overdue'     },
  { key: 'completed',   label: 'Completed'   },
];

export default function MaintenancePage() {
  const [filter, setFilter] = useState('all');

  const filtered = JOBS.filter((j) => filter === 'all' || j.status === filter);

  return (
    <DashboardLayout pageTitle="Maintenance">
      <div className="space-y-lg">

        {/* Header */}
        <div className="page-header">
          <div>
            <h2 className="page-title">Maintenance</h2>
            <p className="page-subtitle">Schedule & track all fleet maintenance jobs</p>
          </div>
          <button className="btn-primary">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
            Schedule Job
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          {SUMMARY_CARDS.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between">
                <span className="text-label-caps font-bold text-secondary uppercase opacity-70">{card.label}</span>
                <span className={`material-symbols-outlined ${card.color}`} style={{ fontSize: '20px' }}>{card.icon}</span>
              </div>
              <span className={`text-display-lg data-mono font-bold mt-xs block ${card.color}`}>{card.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-xs overflow-x-auto pb-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-shrink-0 px-sm py-1.5 rounded-full text-label-caps font-bold uppercase transition-all ${
                filter === tab.key
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-secondary hover:bg-surface-container-highest'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Jobs Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-high">
                  <th className="table-header-cell">Job ID</th>
                  <th className="table-header-cell">Vehicle</th>
                  <th className="table-header-cell">Work Type</th>
                  <th className="table-header-cell">Technician</th>
                  <th className="table-header-cell">Priority</th>
                  <th className="table-header-cell">Start Date</th>
                  <th className="table-header-cell">Est. Done</th>
                  <th className="table-header-cell text-right">Cost</th>
                  <th className="table-header-cell">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filtered.map((job, i) => {
                  const sc = STATUS_CONFIG[job.status];
                  const pc = PRIORITY_CONFIG[job.priority];
                  return (
                    <motion.tr
                      key={job.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="table-row"
                    >
                      <td className="table-cell"><span className="data-mono text-[12px] text-primary">{job.id}</span></td>
                      <td className="table-cell"><span className="data-mono text-[13px] font-bold text-on-surface">{job.vehicle}</span></td>
                      <td className="table-cell text-body-sm text-on-surface">{job.type}</td>
                      <td className="table-cell text-body-sm text-on-surface">{job.tech}</td>
                      <td className="table-cell">
                        <span className={`text-label-caps font-bold uppercase ${pc}`}>{job.priority}</span>
                      </td>
                      <td className="table-cell text-body-sm text-on-surface-variant">{job.startDate}</td>
                      <td className="table-cell text-body-sm text-on-surface-variant">{job.estDone}</td>
                      <td className="table-cell text-right"><span className="data-mono text-[13px] font-bold text-on-surface">{job.cost}</span></td>
                      <td className="table-cell"><span className={sc.cls}>{sc.label}</span></td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <span className="material-symbols-outlined text-outline" style={{ fontSize: '48px' }}>build</span>
              <p className="text-body-sm text-secondary mt-2">No jobs found for this filter</p>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
