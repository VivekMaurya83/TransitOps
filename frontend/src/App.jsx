/**
 * App.jsx — TransitOps Router
 * Routes: Login (public) → Dashboard, Fleet, Drivers, Trips, Maintenance, Fuel, Analytics, Settings (protected)
 */
import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './context/AuthContext';

// ─── Page Imports ─────────────────────────────────────────────────────────────
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

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* ── Public ─────────────────────────────────────────── */}
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
          <ProtectedRoute><PageWrapper><TripDispatcherPage /></PageWrapper></ProtectedRoute>
        } />

        <Route path="/fleet" element={
          <ProtectedRoute><PageWrapper><VehicleRegistryPage /></PageWrapper></ProtectedRoute>
        } />

        <Route path="/fuel" element={
          <ProtectedRoute><PageWrapper><FuelExpensesPage /></PageWrapper></ProtectedRoute>
        } />

        <Route path="/drivers" element={
          <ProtectedRoute><PageWrapper><DriversPage /></PageWrapper></ProtectedRoute>
        } />

        <Route path="/maintenance" element={
          <ProtectedRoute><PageWrapper><MaintenancePage /></PageWrapper></ProtectedRoute>
        } />

        <Route path="/analytics" element={
          <ProtectedRoute><PageWrapper><AnalyticsPage /></PageWrapper></ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute><PageWrapper><SettingsPage /></PageWrapper></ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute><PageWrapper><UserManagementPage /></PageWrapper></ProtectedRoute>
        } />

        {/* ── Default Redirects ────────────────────────────────── */}
        <Route path="/"  element={<Navigate to="/login"     replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </AnimatePresence>
  );
}
