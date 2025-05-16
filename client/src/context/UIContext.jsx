// File: src/context/UIContext.jsx

import React, { createContext, useContext, useState } from 'react';
import { toast as reactToast } from 'react-toastify';

// Create UI context
const UIContext = createContext();

// Hook for using UI context
export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

// UI Provider component
export const UIProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Toast utility functions
  const toast = {
    success: (message) => reactToast.success(message),
    error: (message) => reactToast.error(message),
    info: (message) => reactToast.info(message),
    warning: (message) => reactToast.warning(message),
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Set loading state
  const setLoading = (state) => {
    setIsLoading(state);
  };

  // Value to be provided to consumers
  const value = {
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    isLoading,
    setLoading,
    toast,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export default UIContext;