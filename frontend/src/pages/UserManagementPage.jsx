/**
 * UserManagementPage — Admin-only panel
 * Invite new users (Fleet Manager, Dispatcher, Safety Officer, Financial Analyst)
 * View, enable/disable, and remove team members.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';

const ROLE_OPTIONS = [
  { value: 'fleet_manager',     label: 'Fleet Manager',     icon: 'local_shipping',       color: '#714b67' },
  { value: 'dispatcher',        label: 'Dispatcher',        icon: 'route',                color: '#017E84' },
  { value: 'safety_officer',    label: 'Safety Officer',    icon: 'shield',               color: '#f59e0b' },
  { value: 'financial_analyst', label: 'Financial Analyst', icon: 'bar_chart',            color: '#6366f1' },
];

const ROLE_META = {
  admin:             { label: 'Admin',             color: 'bg-purple-100 text-purple-800'   },
  fleet_manager:     { label: 'Fleet Manager',     color: 'bg-blue-100 text-blue-800'       },
  dispatcher:        { label: 'Dispatcher',        color: 'bg-teal-100 text-teal-800'       },
  safety_officer:    { label: 'Safety Officer',    color: 'bg-amber-100 text-amber-800'     },
  financial_analyst: { label: 'Financial Analyst', color: 'bg-indigo-100 text-indigo-800'  },
};

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function UserManagementPage() {
  const { user: currentUser, token, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]         = useState(null);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    role: 'dispatcher',
  });

  // Redirect non-admins away
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Invite user
  const handleInvite = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/invite-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        showToast(`✓ Invitation sent to ${form.email}`);
        setShowModal(false);
        setForm({ full_name: '', email: '', role: 'dispatcher' });
        fetchUsers();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.detail || 'Failed to invite user', 'error');
      }
    } catch {
      showToast('Network error. Check if the backend is running.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle user active status
  const handleToggleActive = async (userId, currentActive) => {
    try {
      const res = await fetch(`${BASE_URL}/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !currentActive }),
      });
      if (res.ok) {
        showToast(currentActive ? 'User deactivated' : 'User reactivated');
        fetchUsers();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.detail || 'Failed to update user', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  // Delete user
  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Remove ${name} from your organization? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast(`${name} removed`);
        fetchUsers();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.detail || 'Failed to remove user', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  const initials = (name = '') =>
    name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <DashboardLayout pageTitle="User Management">
      <div className="space-y-lg">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
          <div>
            <h2 className="text-headline-md font-bold text-on-surface">User Management</h2>
            <p className="text-body-sm text-secondary mt-1">
              Invite and manage your team's access to TransitOps.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-xs"
            id="invite-user-btn"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
            Invite User
          </motion.button>
        </div>

        {/* ── Role Cards Info ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          {ROLE_OPTIONS.map((role) => (
            <motion.div
              key={role.value}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-md flex flex-col items-center text-center gap-xs"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: role.color + '22' }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '22px', color: role.color }}
                >
                  {role.icon}
                </span>
              </div>
              <span className="text-body-sm font-bold text-on-surface">{role.label}</span>
              <span className="text-label-caps text-secondary">
                {users.filter(u => u.role === role.value).length} member(s)
              </span>
            </motion.div>
          ))}
        </div>

        {/* ── Users Table ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card overflow-hidden"
        >
          <div className="px-md py-sm border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
            <h3 className="text-headline-sm font-bold text-on-surface">Team Members</h3>
            <span className="text-label-caps text-secondary">{users.length} total</span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '32px' }}>autorenew</span>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-md text-secondary">
              <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>group_off</span>
              <p className="text-body-md">No team members yet. Invite someone to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high">
                    <th className="table-header-cell">Name</th>
                    <th className="table-header-cell">Email</th>
                    <th className="table-header-cell">Role</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {users.map((u, i) => {
                    const roleMeta = ROLE_META[u.role] || { label: u.role, color: 'bg-gray-100 text-gray-700' };
                    const isSelf = u.id === currentUser?.id;
                    return (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="table-row"
                      >
                        {/* Name */}
                        <td className="table-cell">
                          <div className="flex items-center gap-sm">
                            <div className="w-8 h-8 bg-primary-fixed rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-[11px] font-bold text-primary">{initials(u.full_name)}</span>
                            </div>
                            <div>
                              <p className="text-body-sm font-bold text-on-surface">
                                {u.full_name}
                                {isSelf && (
                                  <span className="ml-1 text-[10px] text-secondary font-normal">(you)</span>
                                )}
                              </p>
                              {u.must_change_password && (
                                <p className="text-[10px] text-amber-600 flex items-center gap-0.5">
                                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>warning</span>
                                  Password change required
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="table-cell text-body-sm text-secondary">{u.email}</td>

                        {/* Role Badge */}
                        <td className="table-cell">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${roleMeta.color}`}>
                            {roleMeta.label}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="table-cell">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                            u.is_active ? 'text-green-700' : 'text-red-600'
                          }`}>
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: '12px' }}
                            >
                              {u.is_active ? 'check_circle' : 'cancel'}
                            </span>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="table-cell">
                          <div className="flex items-center justify-end gap-xs">
                            {!isSelf && (
                              <>
                                <button
                                  onClick={() => handleToggleActive(u.id, u.is_active)}
                                  title={u.is_active ? 'Deactivate' : 'Activate'}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                    u.is_active
                                      ? 'hover:bg-amber-100 text-amber-600'
                                      : 'hover:bg-green-100 text-green-600'
                                  }`}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                    {u.is_active ? 'person_off' : 'person_check'}
                                  </span>
                                </button>
                                <button
                                  onClick={() => handleDelete(u.id, u.full_name)}
                                  title="Remove user"
                                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-100 text-red-500 transition-colors"
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Invite Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 24 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div
                className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant w-full max-w-md mx-4 pointer-events-auto"
                onClick={e => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex justify-between items-center px-lg py-md border-b border-outline-variant">
                  <div>
                    <h3 className="text-headline-sm font-bold text-on-surface">Invite Team Member</h3>
                    <p className="text-label-caps text-secondary mt-0.5">
                      A temporary password will be emailed to them.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '20px' }}>close</span>
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleInvite} className="p-lg space-y-md">
                  {/* Full Name */}
                  <div>
                    <label className="block text-label-caps font-bold text-secondary uppercase mb-1" htmlFor="invite-name">
                      Full Name
                    </label>
                    <input
                      id="invite-name"
                      type="text"
                      required
                      value={form.full_name}
                      onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                      placeholder="e.g., Alex Kumar"
                      className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-body-sm text-on-surface bg-surface-container-low"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-label-caps font-bold text-secondary uppercase mb-1" htmlFor="invite-email">
                      Email Address
                    </label>
                    <input
                      id="invite-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="alex@company.com"
                      className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-body-sm text-on-surface bg-surface-container-low"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-label-caps font-bold text-secondary uppercase mb-2" htmlFor="invite-role">
                      Assign Role
                    </label>
                    <div className="grid grid-cols-2 gap-sm">
                      {ROLE_OPTIONS.map(role => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, role: role.value }))}
                          className={`flex items-center gap-sm p-sm rounded-xl border-2 transition-all text-left ${
                            form.role === role.value
                              ? 'border-primary bg-primary/5'
                              : 'border-outline-variant hover:border-primary/40 bg-surface-container-low'
                          }`}
                        >
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: role.color + '22' }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: role.color }}>
                              {role.icon}
                            </span>
                          </div>
                          <span className={`text-label-caps font-bold ${form.role === role.value ? 'text-primary' : 'text-on-surface'}`}>
                            {role.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-sm pt-xs">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-sm px-md rounded-lg border border-outline-variant text-body-sm font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 btn-primary disabled:opacity-60"
                      id="send-invite-btn"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-xs">
                          <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>autorenew</span>
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-xs">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span>
                          Send Invite
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Toast Notification ─────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className={`fixed bottom-8 right-8 z-[100] flex items-center gap-sm px-lg py-md rounded-xl shadow-xl border text-body-sm font-semibold ${
              toast.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              {toast.type === 'error' ? 'error' : 'check_circle'}
            </span>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
