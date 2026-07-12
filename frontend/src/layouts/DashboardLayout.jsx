/**
 * DashboardLayout — TransitOps app shell
 * Fixed sidebar (w-60) + sticky topbar + main content area
 */
import React from 'react';
import { motion } from 'framer-motion';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardNavbar  from '../components/DashboardNavbar';

export default function DashboardLayout({ children, onSearch, pageTitle }) {
  return (
    <div className="bg-background text-on-background min-h-screen flex">
      {/* Fixed sidebar (hidden on mobile) */}
      <DashboardSidebar />

      {/* Main content: offset by sidebar width on md+ */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-60 pb-16 md:pb-0">
        <DashboardNavbar onSearch={onSearch} pageTitle={pageTitle} />

        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 p-gutter md:p-lg max-w-[1440px] mx-auto w-full"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
