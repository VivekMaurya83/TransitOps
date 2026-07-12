/**
 * SettingsPage — TransitOps Settings
 * Profile + organization + notification preferences
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';

const SETTING_SECTIONS = [
  { id: 'profile',        label: 'Profile',        icon: 'person'       },
  { id: 'notifications',  label: 'Notifications',  icon: 'notifications'},
  { id: 'organization',   label: 'Organization',   icon: 'business'     },
  { id: 'security',       label: 'Security',       icon: 'lock'         },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const roleLabel = {
    admin:             'Fleet Manager',
    dispatcher:        'Dispatcher',
    safety_officer:    'Safety Officer',
    financial_analyst: 'Financial Analyst',
  }[user?.role] || user?.role || 'User';

  return (
    <DashboardLayout pageTitle="Settings">
      <div className="space-y-lg max-w-5xl">

        {/* Header */}
        <div>
          <h2 className="page-title">Settings</h2>
          <p className="page-subtitle">Manage your account and organization preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
          {/* Sidebar Nav */}
          <div className="md:col-span-3">
            <nav className="card overflow-hidden">
              {SETTING_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-sm px-md py-3 text-body-sm transition-colors border-b border-outline-variant/50 last:border-0 ${
                    activeSection === s.id
                      ? 'text-primary font-bold bg-primary-fixed border-l-4 border-primary'
                      : 'text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: activeSection === s.id ? "'FILL' 1" : "'FILL' 0" }}>
                    {s.icon}
                  </span>
                  {s.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Panel */}
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="md:col-span-9 card p-lg space-y-lg"
          >
            {activeSection === 'profile' && (
              <>
                <h3 className="text-headline-sm font-bold text-on-surface">Profile Information</h3>

                {/* Avatar */}
                <div className="flex items-center gap-lg">
                  <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0">
                    <span className="text-headline-md font-bold text-primary">
                      {(user?.full_name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-headline-sm font-bold text-on-surface">{user?.full_name || 'User'}</p>
                    <p className="text-body-sm text-secondary">{roleLabel}</p>
                    <button className="mt-xs text-label-caps font-bold text-primary hover:underline uppercase tracking-wider">
                      Change Avatar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  {[
                    { label: 'Full Name',    value: user?.full_name || '', type: 'text'  },
                    { label: 'Email',        value: user?.email     || '', type: 'email' },
                    { label: 'Role',         value: roleLabel,              type: 'text', readonly: true },
                    { label: 'Employee ID',  value: user?.id        || 'EMP-001', type: 'text', readonly: true },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="block text-label-caps font-bold text-secondary uppercase mb-xs">{field.label}</label>
                      <input
                        type={field.type}
                        defaultValue={field.value}
                        readOnly={field.readonly}
                        className={`w-full px-md py-2 border border-outline-variant rounded-lg text-body-sm text-on-surface outline-none ${
                          field.readonly
                            ? 'bg-surface-container-high cursor-not-allowed text-on-surface-variant'
                            : 'bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeSection === 'notifications' && (
              <>
                <h3 className="text-headline-sm font-bold text-on-surface">Notification Preferences</h3>
                <div className="space-y-md">
                  {[
                    { label: 'Trip Alerts',         sub: 'Get notified when a trip starts or ends',       default: true  },
                    { label: 'Maintenance Due',      sub: 'Reminders for upcoming service schedules',      default: true  },
                    { label: 'Fuel Level Warnings',  sub: 'Alert when vehicle fuel drops below 20%',      default: true  },
                    { label: 'Safety Incidents',     sub: 'Immediate alerts for driver violations',       default: true  },
                    { label: 'Expense Approvals',    sub: 'Notify on pending expense approvals',          default: false },
                    { label: 'Daily Reports',        sub: 'Receive daily fleet summary by email',         default: false },
                  ].map((n) => (
                    <div key={n.label} className="flex items-start justify-between py-sm border-b border-outline-variant/50 last:border-0">
                      <div>
                        <p className="text-body-sm font-bold text-on-surface">{n.label}</p>
                        <p className="text-body-sm text-secondary mt-0.5">{n.sub}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-lg flex-shrink-0">
                        <input type="checkbox" defaultChecked={n.default} className="sr-only peer" />
                        <div className="w-10 h-6 bg-surface-container-highest peer-checked:bg-primary rounded-full transition-colors peer-focus:ring-2 peer-focus:ring-primary/30" />
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
                      </label>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeSection === 'organization' && (
              <>
                <h3 className="text-headline-sm font-bold text-on-surface">Organization</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  {[
                    { label: 'Organization Name', value: 'TransitOps Pvt. Ltd.' },
                    { label: 'Fleet Size',         value: '53 Vehicles' },
                    { label: 'HQ Location',        value: 'Mumbai, Maharashtra' },
                    { label: 'Timezone',           value: 'IST (UTC+5:30)' },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="block text-label-caps font-bold text-secondary uppercase mb-xs">{field.label}</label>
                      <input
                        type="text"
                        defaultValue={field.value}
                        className="w-full px-md py-2 border border-outline-variant rounded-lg text-body-sm text-on-surface outline-none bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeSection === 'security' && (
              <>
                <h3 className="text-headline-sm font-bold text-on-surface">Security</h3>
                <div className="space-y-md">
                  <div>
                    <label className="block text-label-caps font-bold text-secondary uppercase mb-xs">Current Password</label>
                    <input type="password" placeholder="Enter current password" className="w-full max-w-sm px-md py-2 border border-outline-variant rounded-lg text-body-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-label-caps font-bold text-secondary uppercase mb-xs">New Password</label>
                    <input type="password" placeholder="Enter new password" className="w-full max-w-sm px-md py-2 border border-outline-variant rounded-lg text-body-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-label-caps font-bold text-secondary uppercase mb-xs">Confirm New Password</label>
                    <input type="password" placeholder="Confirm new password" className="w-full max-w-sm px-md py-2 border border-outline-variant rounded-lg text-body-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                </div>
              </>
            )}

            {/* Save Button */}
            <div className="flex items-center gap-md pt-sm border-t border-outline-variant">
              <button onClick={handleSave} className="btn-primary">
                {saved ? (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
                    Saved!
                  </>
                ) : 'Save Changes'}
              </button>
              {saved && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-body-sm text-odoo-teal font-bold"
                >
                  Changes saved successfully.
                </motion.span>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
