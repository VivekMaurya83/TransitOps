/**
 * AuthContext — TransitOps global auth state.
 * login(credentials) calls the API; falls back to mock if backend unreachable.
 * Stores token + user in localStorage for persistence.
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

  // login({ email, password, role }) — calls API, stores result
  const login = useCallback(async ({ email, password, role }) => {
    const data = await authService.login({ email, password, role });
    // data = { access_token, user: { id, full_name, email, role, ... } }
    const tok  = data.access_token || data.token || 'mock-token';
    const usr  = data.user || data;
    setToken(tok);
    setUser(usr);
    localStorage.setItem('token', tok);
    localStorage.setItem('user', JSON.stringify(usr));
    return usr;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const isAdmin = useCallback(() => user?.role === 'admin', [user]);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAdmin, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
