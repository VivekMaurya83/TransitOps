/**
 * API Service Layer — connects to the FastAPI backend.
 * Falls back to rich mock data if the backend is unreachable (for development).
 * All authenticated requests automatically attach the Bearer token.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Simulated network delay for skeleton loading demonstrations (mock only)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Token helper ─────────────────────────────────────────────────────────────
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Core request wrapper ─────────────────────────────────────────────────────
async function request(path, options = {}, fallbackMock) {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // Only fall back to mock if the error is a network/fetch failure (not a 4xx/5xx)
    if (fallbackMock && (error.message.includes('fetch') || error.message.includes('Failed') || error.name === 'TypeError')) {
      console.warn(`Backend unreachable at ${BASE_URL}${path}. Using mock data.`);
      await delay(700);
      return fallbackMock();
    }
    throw error;
  }
}

// ─── Mock database (fallback only) ───────────────────────────────────────────
// ─── TransitOps Mock Users (RBAC roles) ──────────────────────────────────────
const MOCK_USERS = [
  { id: 'u1', email: 'admin@transitops.io',    password: 'admin123',    full_name: 'Rajesh Kumar',    role: 'admin'             },
  { id: 'u2', email: 'dispatch@transitops.io', password: 'dispatch123', full_name: 'Priya Mehta',     role: 'dispatcher'        },
  { id: 'u3', email: 'safety@transitops.io',   password: 'safety123',   full_name: 'Alex Kumar',      role: 'safety_officer'    },
  { id: 'u4', email: 'finance@transitops.io',  password: 'finance123',  full_name: 'Sam Patel',       role: 'financial_analyst' },
  // Dev shortcut: any email/password combo works in mock mode
];

const mockDb = {
  stats: {
    totalFleet: 53, available: 42, inMaintenance: 5,
    activeTrips: 18, pendingTrips: 9, utilization: '81%',
  },
  settings: {
    full_name: 'Rajesh Kumar',
    email: 'admin@transitops.io',
    company_name: 'TransitOps Pvt. Ltd.',
    company_location: 'Mumbai, Maharashtra',
    role: 'admin',
  },
};

// ─── Auth Service ─────────────────────────────────────────────────────────────
export const authService = {
  /**
   * Admin registers a new company + account.
   * POST /api/auth/register
   */
  register: async (data) => {
    // No mock fallback for auth — real errors must surface
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Registration failed');
    }
    return response.json();
  },

  /**
   * Unified login for admin and normal users.
   * POST /api/auth/login
   * Returns: { access_token, token_type, user, must_change_password }
   */
  login: async ({ email, password, role }) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || 'Invalid email or password');
      }
      return response.json();
    } catch (err) {
      // Mock fallback when backend is unreachable
      if (err.message.includes('fetch') || err.message.includes('Failed') || err.name === 'TypeError') {
        console.warn('Backend unreachable — using mock login.');
        await delay(600);
        // Find user by email, or create a demo user with the selected role
        const found = MOCK_USERS.find(u => u.email === email) || {
          id: 'demo', email, full_name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          role: role || 'dispatcher',
        };
        return { access_token: 'mock-jwt-token', user: found };
      }
      throw err;
    }
  },

  /**
   * Sends a password reset email.
   * POST /api/auth/forgot-password
   */
  forgotPassword: async (email) => {
    const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to send reset email');
    }
    return response.json();
  },

  /**
   * Authenticated: change password and clear must_change_password flag.
   * POST /api/auth/change-password
   */
  changePassword: async (current_password, new_password) => {
    const response = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ current_password, new_password }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to change password');
    }
    return response.json();
  },
};

// ─── Admin Service ────────────────────────────────────────────────────────────
export const adminService = {
  /**
   * GET all users in the admin's company.
   * GET /api/admin/users
   */
  getUsers: async () => {
    return request('/admin/users', { method: 'GET' }, () => mockDb.team);
  },

  /**
   * Invite a new user by email.
   * POST /api/admin/invite-user
   */
  inviteUser: async (email, full_name, role) => {
    return request(
      '/admin/invite-user',
      { method: 'POST', body: JSON.stringify({ email, full_name, role }) },
      () => {
        const newUser = {
          id: String(mockDb.team.length + 1),
          email, full_name, role,
          is_active: true,
          must_change_password: true,
          company_id: 'c1',
          created_at: new Date().toISOString(),
        };
        mockDb.team.push(newUser);
        return newUser;
      }
    );
  },

  /**
   * Update a user's role or active status.
   * PUT /api/admin/users/{user_id}
   */
  updateUser: async (userId, updates) => {
    return request(
      `/admin/users/${userId}`,
      { method: 'PUT', body: JSON.stringify(updates) },
      () => {
        const user = mockDb.team.find(u => u.id === userId);
        if (!user) throw new Error('User not found');
        Object.assign(user, updates);
        return user;
      }
    );
  },

  /**
   * Remove a user from the company.
   * DELETE /api/admin/users/{user_id}
   */
  deleteUser: async (userId) => {
    return request(
      `/admin/users/${userId}`,
      { method: 'DELETE' },
      () => {
        mockDb.team = mockDb.team.filter(u => u.id !== userId);
        return { message: 'User removed successfully.' };
      }
    );
  },
};

// ─── Dashboard Service ────────────────────────────────────────────────────────
export const dashboardService = {
  /**
   * GET /api/dashboard/stats
   * Returns real KPI counts from DB: total_vehicles, available_vehicles, active_trips, etc.
   */
  getStats: async () => request('/dashboard/stats', { method: 'GET' }, () => ({
    total_vehicles: 53,
    available_vehicles: 42,
    vehicles_in_maintenance: 5,
    vehicles_on_trip: 18,
    retired_vehicles: 4,
    active_trips: 18,
    pending_trips: 9,
    completed_trips: 120,
    drivers_on_duty: 15,
    available_drivers: 22,
    fleet_utilization_percent: 81.0,
  })),

  /**
   * GET /api/dashboard/recent-trips?limit=10
   * Returns recent trip records from the DB.
   */
  getRecentTrips: async (limit = 10) => request(
    `/dashboard/recent-trips?limit=${limit}`,
    { method: 'GET' },
    () => [
      { id: 'mock-1', trip_number: 'TR001', source: 'Mumbai', destination: 'Pune',       status: 'dispatched', created_at: new Date().toISOString() },
      { id: 'mock-2', trip_number: 'TR002', source: 'Delhi',  destination: 'Agra',        status: 'completed',  created_at: new Date().toISOString() },
      { id: 'mock-3', trip_number: 'TR003', source: 'Surat',  destination: 'Ahmedabad',   status: 'draft',      created_at: new Date().toISOString() },
    ]
  ),

  /**
   * GET /api/dashboard/vehicle-status-breakdown
   * Returns { available: N, on_trip: N, in_shop: N, retired: N }
   */
  getVehicleStatusBreakdown: async () => request(
    '/dashboard/vehicle-status-breakdown',
    { method: 'GET' },
    () => ({ available: 42, on_trip: 18, in_shop: 5, retired: 4 })
  ),

  /**
   * GET /api/dashboard/driver-status-breakdown
   * Returns { available: N, on_trip: N, off_duty: N, suspended: N }
   */
  getDriverStatusBreakdown: async () => request(
    '/dashboard/driver-status-breakdown',
    { method: 'GET' },
    () => ({ available: 22, on_trip: 15, off_duty: 8, suspended: 1 })
  ),
};


// ─── Analytics Service ────────────────────────────────────────────────────────
export const analyticsService = {
  getAnalyticsData: async () => request(
    '/analytics',
    { method: 'GET' },
    () => ({
      overview: {
        conversions: { current: '2.84%', growth: '+0.4%' },
        bounceRate: { current: '42.1%', growth: '-1.8%' },
        avgSession: { current: '4m 32s', growth: '+12%' },
        retention: { current: '78.4%', growth: '+2.1%' },
      },
      pageViews: [30, 45, 35, 55, 65, 50, 75, 80, 70, 90, 85, 110],
      trafficSources: [
        { source: 'Direct', percentage: 40, color: 'bg-primary' },
        { source: 'Organic Search', percentage: 35, color: 'bg-secondary' },
        { source: 'Social Media', percentage: 15, color: 'bg-tertiary' },
        { source: 'Referral', percentage: 10, color: 'bg-outline-variant' },
      ],
    })
  ),
};

// ─── Settings Service ─────────────────────────────────────────────────────────
export const settingsService = {
  getSettings: async () => request('/settings/', { method: 'GET' }, () => mockDb.settings),

  updateSettings: async (settings) => request(
    '/settings/',
    { method: 'PUT', body: JSON.stringify(settings) },
    () => {
      Object.assign(mockDb.settings, settings);
      return mockDb.settings;
    }
  ),
};

// ─── Help Service ─────────────────────────────────────────────────────────────
export const helpService = {
  getHelpArticles: async (filter = '') => request(
    `/help?filter=${encodeURIComponent(filter)}`,
    { method: 'GET' },
    () => {
      if (!filter) return mockDb.helpArticles;
      const q = filter.toLowerCase();
      return mockDb.helpArticles.filter(h =>
        h.question.toLowerCase().includes(q) ||
        h.answer.toLowerCase().includes(q) ||
        h.category.toLowerCase().includes(q)
      );
    }
  ),
};
