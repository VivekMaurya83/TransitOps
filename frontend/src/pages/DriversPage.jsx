/**
 * DriversPage — TransitOps Drivers & Safety Profiles
 * Driver list with safety scores, certifications, and compliance status
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';

const DRIVERS = [
  { id: 'DRV-001', name: 'Alex Kumar',      role: 'Senior Driver',  phone: '+91 98765 43210', vehicle: 'VAN-05',  status: 'on-trip',   license: 'MH-1234567', safetyScore: 94, trips: 842, violations: 0,  certifications: ['HMV', 'PSV'],           joinDate: '2019-03-15' },
  { id: 'DRV-002', name: 'Sam Patel',       role: 'Fleet Driver',   phone: '+91 87654 32109', vehicle: 'TRX-12',  status: 'available', license: 'GJ-7654321', safetyScore: 88, trips: 623, violations: 1,  certifications: ['HMV', 'Hazmat'],        joinDate: '2020-07-20' },
  { id: 'DRV-003', name: 'Priya Mehta',     role: 'Fleet Driver',   phone: '+91 76543 21098', vehicle: 'MINI-08', status: 'on-trip',   license: 'DL-4561234', safetyScore: 97, trips: 1204,violations: 0,  certifications: ['PSV', 'First Aid'],     joinDate: '2018-11-05' },
  { id: 'DRV-004', name: 'Suresh Rao',      role: 'Fleet Driver',   phone: '+91 65432 10987', vehicle: 'VAN-03',  status: 'available', license: 'KA-3217654', safetyScore: 72, trips: 410, violations: 3,  certifications: ['LMV'],                  joinDate: '2021-02-10' },
  { id: 'DRV-005', name: 'John Fernandez',  role: 'Senior Driver',  phone: '+91 54321 09876', vehicle: 'VAN-09',  status: 'on-trip',   license: 'MH-8881234', safetyScore: 65, trips: 934, violations: 5,  certifications: ['HMV'],                  joinDate: '2017-09-01' },
  { id: 'DRV-006', name: 'Rita Singh',      role: 'Fleet Driver',   phone: '+91 43210 98765', vehicle: 'BUS-02',  status: 'available', license: 'UP-5671234', safetyScore: 91, trips: 528, violations: 0,  certifications: ['PSV', 'HMV', 'First Aid'],joinDate: '2020-04-18' },
  { id: 'DRV-007', name: 'Arjun Nair',      role: 'Trainee Driver', phone: '+91 32109 87654', vehicle: 'VAN-01',  status: 'off-duty',  license: 'KL-1234876', safetyScore: 80, trips: 142, violations: 1,  certifications: ['LMV', 'First Aid'],     joinDate: '2023-01-09' },
];

const STATUS_MAP = {
  'on-trip':  { cls: 'status-on-trip',   label: 'On Trip'  },
  'available':{ cls: 'status-available', label: 'Available'},
  'off-duty': { cls: 'status-draft',     label: 'Off Duty' },
};

function SafetyScore({ score }) {
  const color = score >= 90 ? 'text-odoo-teal' : score >= 75 ? 'text-on-surface' : 'text-error';
  const ring  = score >= 90 ? '#017E84'       : score >= 75 ? '#714b67'       : '#ba1a1a';
  const circumference = 2 * Math.PI * 20;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-xs">
      <svg width="36" height="36" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="20" fill="none" stroke="#e5e8ee" strokeWidth="3" />
        <motion.circle
          cx="22" cy="22" r="20" fill="none"
          stroke={ring} strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, delay: 0.3 }}
          style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
        />
      </svg>
      <span className={`data-mono text-[13px] font-bold ${color}`}>{score}</span>
    </div>
  );
}

export default function DriversPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = DRIVERS.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.vehicle.toLowerCase().includes(search.toLowerCase()) ||
      d.license.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout pageTitle="Drivers">
      <div className="space-y-lg">

        {/* Header */}
        <div className="page-header">
          <div>
            <h2 className="page-title">Drivers & Safety Profiles</h2>
            <p className="page-subtitle">{DRIVERS.length} registered drivers</p>
          </div>
          <div className="flex gap-sm">
            <button className="btn-secondary">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
              Export
            </button>
            <button className="btn-primary">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person_add</span>
              Add Driver
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '16px' }}>search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search driver, vehicle or license..."
            className="search-input"
          />
        </div>

        {/* Drivers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
          {filtered.map((driver, i) => {
            const sm = STATUS_MAP[driver.status];
            const isSelected = selected?.id === driver.id;
            return (
              <motion.div
                key={driver.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.3 }}
                onClick={() => setSelected(isSelected ? null : driver)}
                className={`card p-md cursor-pointer transition-all hover:border-primary hover:shadow-sm ${
                  isSelected ? 'border-primary ring-2 ring-primary/20' : ''
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between mb-sm">
                  <div className="flex items-center gap-sm">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0">
                      <span className="text-body-sm font-bold text-primary">
                        {driver.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-body-sm font-bold text-on-surface">{driver.name}</p>
                      <p className="text-label-caps text-secondary">{driver.role}</p>
                    </div>
                  </div>
                  <span className={sm.cls}>{sm.label}</span>
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between mb-sm">
                  <SafetyScore score={driver.safetyScore} />
                  <div className="text-right">
                    <p className="data-mono text-[13px] font-bold text-on-surface">{driver.trips}</p>
                    <p className="text-label-caps text-secondary">Trips</p>
                  </div>
                  <div className="text-right">
                    <p className={`data-mono text-[13px] font-bold ${driver.violations > 2 ? 'text-error' : 'text-on-surface'}`}>
                      {driver.violations}
                    </p>
                    <p className="text-label-caps text-secondary">Violations</p>
                  </div>
                </div>

                {/* Vehicle + License */}
                <div className="flex items-center justify-between pt-xs border-t border-outline-variant/60">
                  <div className="flex items-center gap-xs text-body-sm text-on-surface-variant">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>local_shipping</span>
                    {driver.vehicle}
                  </div>
                  <span className="data-mono text-[11px] text-secondary">{driver.license}</span>
                </div>

                {/* Certifications */}
                <div className="flex flex-wrap gap-xs mt-sm">
                  {driver.certifications.map((cert) => (
                    <span key={cert} className="px-xs py-0.5 bg-surface-container-high rounded text-label-caps text-secondary font-bold text-[10px] uppercase">
                      {cert}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Driver Detail Panel */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.3 }}
              className="card p-lg"
            >
              <div className="flex items-center justify-between mb-lg">
                <div className="flex items-center gap-md">
                  <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center">
                    <span className="text-headline-sm font-bold text-primary">
                      {selected.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-headline-sm font-bold text-on-surface">{selected.name}</h3>
                    <p className="text-body-sm text-secondary">{selected.role} · Since {selected.joinDate}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-outline hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-md text-sm">
                {[
                  { label: 'Phone',       value: selected.phone        },
                  { label: 'License',     value: selected.license      },
                  { label: 'Vehicle',     value: selected.vehicle      },
                  { label: 'Safety Score',value: `${selected.safetyScore}/100` },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-label-caps text-secondary font-bold uppercase mb-xs">{item.label}</p>
                    <p className="data-mono text-[13px] text-on-surface">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
