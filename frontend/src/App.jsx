import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import DashboardNavbar from './components/DashboardNavbar';
import DashboardSidebar from './components/DashboardSidebar';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import RevenueChart from './components/RevenueChart';
import SkeletonLoader from './components/SkeletonLoader';

// ─── Page Imports ─────────────────────────────────────────────────────────────
import LoginPage from './pages/LoginPage';