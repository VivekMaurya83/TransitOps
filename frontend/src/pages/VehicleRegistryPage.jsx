/**
 * VehicleRegistryPage — TransitOps Fleet Registry
 * Vehicle list with status filters and detail cards
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';

const VEHICLES = [
  { id: 'VAN-01', type: 'Van',      year: 2021, capacity: '1.2T',  status: 'available',    driver: 'Arjun Nair',    fuel: 78, lastService: '2024-06-10', km: '45,210' },
  { id: 'VAN-03', type: 'Van',      year: 2020, capacity: '1.2T',  status: 'on-trip',      driver: 'Suresh Rao',    fuel: 52, lastService: '2024-05-28', km: '67,840' },
  { id: 'VAN-05', type: 'Van',      year: 2022, capacity: '1.2T',  status: 'on-trip',      driver: 'Alex Kumar',    fuel: 35, lastService: '2024-06-15', km: '31,050' },
  { id: 'VAN-09', type: 'Van',      year: 2019, capacity: '1.2T',  status: 'on-trip',      driver: 'John Fernandez',fuel: 20, lastService: '2024-04-20', km: '92,100' },
  { id: 'TRX-12', type: 'Truck',    year: 2023, capacity: '5.0T',  status: 'available',    driver: 'Sam Patel',     fuel: 90, lastService: '2024-06-22', km: '18,300' },
  { id: 'TRX-15', type: 'Truck',    year: 2022, capacity: '5.0T',  status: 'on-trip',      driver: 'Alex Kumar',    fuel: 65, lastService: '2024-06-01', km: '28,700' },
  { id: 'MINI-08',type: 'Mini Bus', year: 2021, capacity: '14 pax',status: 'dispatched',   driver: 'Priya Mehta',   fuel: 55, lastService: '2024-05-15', km: '55,600' },
  { id: 'BUS-02', type: 'Bus',      year: 2020, capacity: '40 pax',status: 'available',    driver: 'Rita Singh',    fuel: 80, lastService: '2024-06-08', km: '88,200' },
  { id: 'VAN-11', type: 'Van',      year: 2018, capacity: '1.0T',  status: 'maintenance',  driver: '—',             fuel: 0,  lastService: '2024-06-25', km: '112,500' },
  { id: 'TRX-08', type: 'Truck',    year: 2017, capacity: '5.0T',  status: 'maintenance',  driver: '—',             fuel: 0,  lastService: '2024-06-23', km: '145,200' },
  { id: 'VAN-14', type: 'Van',      year: 2016, capacity: '1.2T',  status: 'retired',      driver: '—',             fuel: 0,  lastService: '2024-01-10', km: '198,000' },
];

const STATUS_CONFIG = {
  'available':   { label: 'Available',   cls: 'status-available',    icon: 'check_circle'    },
  'on-trip':     { label: 'On Trip',     cls: 'status-on-trip',      icon: 'navigation'      },
  'dispatched':  { label: 'Dispatched',  cls: 'status-dispatched',   icon: 'directions_car'  },
  'maintenance': { label: 'Maintenance', cls: 'status-maintenance',  icon: 'build'           },
  'retired':     { label: 'Retired',     cls: 'status-retired',      icon: 'do_not_disturb'  },
};

const FILTER_TABS = [
  { key: 'all',         label: 'All Vehicles' },
  { key: 'available',   label: 'Available'    },
  { key: 'on-trip',     label: 'On Trip'      },
  { key: 'maintenance', label: 'Maintenance'  },
  { key: 'retired',     label: 'Retired'      },
];

function FuelBar({ pct }) {
  const color = pct > 50 ? 'bg-odoo-teal' : pct > 25 ? 'bg-on-tertiary-container' : 'bg-error';
  return (
    <div className="flex items-center gap-xs">
      <div className="w-16 bg-surface-container-high h-1.5 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="data-mono text-[11px] text-on-surface">{pct}%</span>
    </div>
  );
}

export default function VehicleRegistryPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = VEHICLES.filter((v) => {
    const matchStatus = filter === 'all' || v.status === filter;
    const matchSearch = v.id.toLowerCase().includes(search.toLowerCase()) ||
                        v.driver.toLowerCase().includes(search.toLowerCase()) ||
                        v.type.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = FILTER_TABS.reduce((acc, t) => {
    acc[t.key] = t.key === 'all' ? VEHICLES.length : VEHICLES.filter(v => v.status === t.key).length;
    return acc;
  }, {});

  return (
    <DashboardLayout pageTitle="Fleet">
      <div className="space-y-lg">

        {/* Header */}
        <div className="page-header">
          <div>
            <h2 className="page-title">Vehicle Registry</h2>
            <p className="page-subtitle">{VEHICLES.length} vehicles in fleet</p>
          </div>
          <button className="btn-primary">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
            Add Vehicle
          </button>
        </div>

        {/* Filter Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-sm">
          <div className="flex gap-xs overflow-x-auto pb-1">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-shrink-0 flex items-center gap-xs px-sm py-1.5 rounded-full text-label-caps font-bold uppercase transition-all ${
                  filter === tab.key
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-high text-secondary hover:bg-surface-container-highest'
                }`}
              >
                {tab.label}
                <span className={`text-[10px] rounded-full px-1 ${filter === tab.key ? 'bg-white/20 text-white' : 'bg-outline/20 text-secondary'}`}>
                  {counts[tab.key]}
                </span>
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '16px' }}>search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vehicle or driver..."
              className="search-input pl-9 w-56"
            />
          </div>
        </div>

        {/* Vehicle Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-high">
                  <th className="table-header-cell">Vehicle ID</th>
                  <th className="table-header-cell">Type</th>
                  <th className="table-header-cell">Capacity</th>
                  <th className="table-header-cell">Driver</th>
                  <th className="table-header-cell">Fuel Level</th>
                  <th className="table-header-cell">Odometer</th>
                  <th className="table-header-cell">Last Service</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell" />
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filtered.map((v, i) => {
                  const sc = STATUS_CONFIG[v.status];
                  return (
                    <motion.tr
                      key={v.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                      className="table-row group"
                    >
                      <td className="table-cell">
                        <span className="data-mono text-[13px] font-bold text-primary">{v.id}</span>
                      </td>
                      <td className="table-cell text-body-sm text-on-surface">{v.type} · {v.year}</td>
                      <td className="table-cell text-body-sm text-on-surface">{v.capacity}</td>
                      <td className="table-cell text-body-sm text-on-surface">{v.driver}</td>
                      <td className="table-cell">
                        {v.status === 'retired' || v.status === 'maintenance'
                          ? <span className="text-body-sm text-outline">—</span>
                          : <FuelBar pct={v.fuel} />
                        }
                      </td>
                      <td className="table-cell">
                        <span className="data-mono text-[13px] text-on-surface">{v.km} km</span>
                      </td>
                      <td className="table-cell text-body-sm text-on-surface-variant">{v.lastService}</td>
                      <td className="table-cell">
                        <span className={sc.cls}>{sc.label}</span>
                      </td>
                      <td className="table-cell">
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-secondary hover:text-primary">
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>more_vert</span>
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <span className="material-symbols-outlined text-outline" style={{ fontSize: '48px' }}>local_shipping</span>
              <p className="text-body-sm text-secondary mt-2">No vehicles found</p>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
