/**
 * App.jsx — TransitOps Router
 * Routes: Login (public) → Dashboard, Fleet, Drivers, Trips, Maintenance, Fuel, Analytics, Settings (protected)
 */
import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './context/AuthContext';

// ─── Page Imports ─────────────────────────────────────────────────────────────
import SignupPage          from './pages/SignupPage';
import LoginPage           from './pages/LoginPage';
import ForgotPasswordPage  from './pages/ForgotPasswordPage';
import ChangePasswordPage  from './pages/ChangePasswordPage';
import DashboardPage       from './pages/DashboardPage';
import TripDispatcherPage  from './pages/TripDispatcherPage';
import VehicleRegistryPage from './pages/VehicleRegistryPage';
import FuelExpensesPage    from './pages/FuelExpensesPage';
import DriversPage         from './pages/DriversPage';
import MaintenancePage     from './pages/MaintenancePage';
import AnalyticsPage       from './pages/AnalyticsPage';
import SettingsPage        from './pages/SettingsPage';
import UserManagementPage  from './pages/UserManagementPage';

// ─── Page Transition Wrapper ─────────────────────────────────────────────────
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1.0] }}
    className="w-full"
  >
    {children}
  </motion.div>
);

// ─── Route Guards ─────────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

function RoleProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role) && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* ── Public ─────────────────────────────────────────── */}
        <Route path="/signup" element={
          <PublicRoute>
            <PageWrapper><SignupPage /></PageWrapper>
          </PublicRoute>
        } />
        
        <Route path="/login" element={
          <PublicRoute>
            <PageWrapper><LoginPage /></PageWrapper>
          </PublicRoute>
        } />

        <Route path="/forgot-password" element={
          <PageWrapper><ForgotPasswordPage /></PageWrapper>
        } />

        {/* Semi-protected: needs token, but user hasn't fully onboarded */}
        <Route path="/change-password" element={
          <PageWrapper><ChangePasswordPage /></PageWrapper>
        } />

        {/* ── Protected — TransitOps pages ────────────────────── */}
        <Route path="/dashboard" element={
          <ProtectedRoute><PageWrapper><DashboardPage /></PageWrapper></ProtectedRoute>
        } />

        <Route path="/trips" element={
          <RoleProtectedRoute allowedRoles={['dispatcher', 'safety_officer']}>
            <PageWrapper><TripDispatcherPage /></PageWrapper>
          </RoleProtectedRoute>
        } />

        <Route path="/fleet" element={
          <RoleProtectedRoute allowedRoles={['fleet_manager', 'dispatcher', 'financial_analyst']}>
            <PageWrapper><VehicleRegistryPage /></PageWrapper>
          </RoleProtectedRoute>
        } />

        <Route path="/fuel" element={
          <RoleProtectedRoute allowedRoles={['financial_analyst']}>
            <PageWrapper><FuelExpensesPage /></PageWrapper>
          </RoleProtectedRoute>
        } />

        <Route path="/drivers" element={
          <RoleProtectedRoute allowedRoles={['fleet_manager', 'safety_officer']}>
            <PageWrapper><DriversPage /></PageWrapper>
          </RoleProtectedRoute>
        } />

        <Route path="/maintenance" element={
          <RoleProtectedRoute allowedRoles={['fleet_manager', 'dispatcher', 'financial_analyst']}>
            <PageWrapper><MaintenancePage /></PageWrapper>
          </RoleProtectedRoute>
        } />

        <Route path="/analytics" element={
          <RoleProtectedRoute allowedRoles={['fleet_manager', 'financial_analyst']}>
            <PageWrapper><AnalyticsPage /></PageWrapper>
          </RoleProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute><PageWrapper><SettingsPage /></PageWrapper></ProtectedRoute>
        } />

        <Route path="/users" element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <PageWrapper><UserManagementPage /></PageWrapper>
          </RoleProtectedRoute>
        } />

        {/* ── Default Redirects ────────────────────────────────── */}
        <Route path="/"  element={<Navigate to="/login"     replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </AnimatePresence>
  );
}
