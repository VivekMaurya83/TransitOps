import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './context/AuthContext';

// ─── Page Imports ─────────────────────────────────────────────────────────────
import LoginPage from './pages/LoginPage';