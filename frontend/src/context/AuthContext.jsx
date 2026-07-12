/**
 * AuthContext — TransitOps global auth state.
 * login(credentials) calls the API; falls back to mock if backend unreachable.
 * Stores token + user in localStorage for persistence.
 * Handles must_change_password flag for forced password change flow.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [mustChangePassword, setMustChangePassword] = useState(() => {
    return localStorage.getItem('mustChangePassword') === 'true';
  });

  // login({ email, password, role }) — calls API, stores result
  // Returns { user, mustChangePassword } so the caller can redirect appropriately
  const login = useCallback(async ({ email, password, role }) => {
    const data = await authService.login({ email, password, role });
    // data = { access_token, user: { id, full_name, email, role, ... }, must_change_password }
    const tok  = data.access_token || data.token || 'mock-token';
    const usr  = data.user || data;
    const mcp  = data.must_change_password ?? usr.must_change_password ?? false;

    setToken(tok);
    setUser(usr);
    setMustChangePassword(mcp);
    localStorage.setItem('token', tok);
    localStorage.setItem('user', JSON.stringify(usr));
    localStorage.setItem('mustChangePassword', String(mcp));

    return { user: usr, mustChangePassword: mcp };
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setMustChangePassword(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('mustChangePassword');
  }, []);

  // Called after a successful change-password — clears the forced flow
  const clearMustChangePassword = useCallback(() => {
    setMustChangePassword(false);
    localStorage.setItem('mustChangePassword', 'false');
    // Also sync the user object
    setUser((prev) => prev ? { ...prev, must_change_password: false } : prev);
  }, []);

  const isAdmin = useCallback(() => user?.role === 'admin', [user]);
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{
      token, user, login, logout,
      isAdmin, isAuthenticated,
      mustChangePassword, clearMustChangePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
