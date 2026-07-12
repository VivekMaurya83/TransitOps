import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-surface-container-low w-full py-16 border-t border-surface-variant transition-colors duration-300">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1 flex flex-col space-y-4">
          <span className="font-title-lg text-title-lg font-bold text-primary dark:text-primary-fixed">Stratega Enterprise</span>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Empowering modern organizations with intelligent solutions.
          </p>
          <div className="flex space-x-4 mt-4">
            <a className="text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors" href="#">
              <span className="material-symbols-outlined">language</span>
            </a>
            <a className="text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors" href="#">
              <span className="material-symbols-outlined">share</span>
            </a>
            <a className="text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors" href="#">
              <span className="material-symbols-outlined">mail</span>
            </a>
          </div>
        </div>
        <div className="flex flex-col space-y-4">
          <span className="font-title-sm text-title-sm font-semibold text-on-surface mb-2">Company</span>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">About</a>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Features</a>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Pricing</a>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Contact</a>
        </div>
        <div className="flex flex-col space-y-4">
          <span className="font-title-sm text-title-sm font-semibold text-on-surface mb-2">Legal</span>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Security</a>
        </div>
        <div className="flex flex-col space-y-4">
          <span className="font-title-sm text-title-sm font-semibold text-on-surface mb-2">Resources</span>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Blog</a>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Documentation</a>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Help Center</a>
        </div>
      </div>
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-12 pt-8 border-t border-surface-variant flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="font-caption text-caption text-on-surface-variant">© 2026 Stratega Enterprise. All rights reserved.</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="font-caption text-caption text-on-surface-variant">All systems operational</span>
        </div>
      </div>
    </footer>
  );
}
