// File: src/components/layout/Footer.jsx

import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 md:px-8">
        <div className="text-center text-sm text-gray-500">
          <p>TaskBoard Pro &copy; {new Date().getFullYear()} - Advanced Task Collaboration with Workflow Automation</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;