// File: src/components/layout/MainLayout.js

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isMobile={true} />
      
      {/* Desktop sidebar */}
      <Sidebar isOpen={true} setIsOpen={() => {}} isMobile={false} />
      
      {/* Main content area */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Main content */}
              <div className="py-4">
                <Outlet />
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;