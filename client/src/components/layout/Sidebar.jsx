// File: src/components/layout/Sidebar.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen, isMobile }) => {
  const { currentUser } = useAuth();

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Projects', path: '/projects', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' }
  ];

  // Render mobile sidebar
  if (isMobile) {
    return (
      <>
        {/* Mobile sidebar overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75"
            onClick={() => setIsOpen(false)}
          ></div>
        )}
        
        {/* Mobile sidebar panel */}
        <div className={`fixed inset-y-0 left-0 flex flex-col w-64 z-50 bg-gray-800 transition duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 bg-gray-900">
            <div className="text-xl font-bold text-white">TaskBoard Pro</div>
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setIsOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          
          {/* Sidebar content */}
          {renderSidebarContent()}
        </div>
      </>
    );
  }
  
  // Render desktop sidebar
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-gray-800">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
            <div className="text-xl font-bold text-white">TaskBoard Pro</div>
          </div>
          {renderSidebarContent()}
        </div>
      </div>
    </div>
  );
  
  // Shared sidebar content
  function renderSidebarContent() {
    return (
      <>
        {/* User profile */}
        {currentUser && (
          <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
            <div className="flex items-center">
              {currentUser.profilePicture ? (
                <img
                  className="inline-block h-10 w-10 rounded-full"
                  src={currentUser.profilePicture}
                  alt={currentUser.name}
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{currentUser.name}</p>
                <p className="text-xs font-medium text-gray-300 truncate">{currentUser.email}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => 
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <svg
                  className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-300"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={item.icon}
                  />
                </svg>
                {item.name}
              </NavLink>
            ))}
            
            {/* Create new project button */}
            <NavLink
              to="/projects/new"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <svg
                className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-300"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              New Project
            </NavLink>
          </nav>
        </div>
      </>
    );
  }
};

export default Sidebar;