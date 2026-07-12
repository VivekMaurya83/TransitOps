import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' }
  ];

  return (
    <nav className="bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-md fixed top-0 w-full z-50 shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-none border-b border-surface-variant/50 transition-colors duration-300">
      <div className="flex justify-between items-center h-20 px-margin-desktop max-w-container-max mx-auto">
        {/* Brand Logo */}
        <Link to="/" className="font-title-lg text-title-lg font-extrabold text-primary dark:text-primary-fixed tracking-tight hover:opacity-90 transition-opacity">
          Stratega Enterprise
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex space-x-gutter">
          {navLinks.map((link, idx) => (
            <a
              key={idx}
              className="font-title-sm text-sm text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors font-semibold relative py-1 group"
              href={link.href}
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary dark:bg-primary-fixed transition-all group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Right Auth Buttons */}
        <div className="hidden md:flex items-center space-x-stack-sm">
          <Link 
            to="/login" 
            className="font-label-md text-label-md text-on-surface-variant bg-transparent px-4 py-2 rounded-lg hover:bg-surface-container-highest transition-colors font-semibold"
          >
            Log In
          </Link>
          <Link 
            to="/signup" 
            className="font-label-md text-label-md text-on-primary bg-primary px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all font-semibold"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Hamburger Menu Toggle */}
        <div className="flex md:hidden items-center">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors focus:outline-none"
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {isOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-surface-variant/40 bg-surface dark:bg-surface-dim overflow-hidden px-margin-mobile py-4 space-y-4"
          >
            <div className="flex flex-col space-y-3">
              {navLinks.map((link, idx) => (
                <a
                  key={idx}
                  onClick={() => setIsOpen(false)}
                  className="font-title-sm text-base text-on-surface-variant hover:text-primary py-2 border-b border-surface-variant/20 transition-colors block"
                  href={link.href}
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2.5 border border-outline-variant text-on-surface rounded-lg font-label-md hover:bg-surface-container-highest transition-colors block"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2.5 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary-container transition-colors block"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
