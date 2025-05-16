// File: src/context/UIContext.jsx

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast } from '../components/ui/Toast';

// Create context
const UIContext = createContext();

// UI Provider component
export const UIProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  
  // Add a toast notification
  const showToast = useCallback(({ message, type = 'info', duration = 5000, position = 'top-right' }) => {
    const id = Date.now().toString();
    setToasts(prevToasts => [...prevToasts, { id, message, type, duration, position }]);
    return id;
  }, []);
  
  // Remove a toast notification
  const hideToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);
  
  // Helper functions for different toast types
  const toast = {
    info: (message, options = {}) => showToast({ message, type: 'info', ...options }),
    success: (message, options = {}) => showToast({ message, type: 'success', ...options }),
    warning: (message, options = {}) => showToast({ message, type: 'warning', ...options }),
    error: (message, options = {}) => showToast({ message, type: 'error', ...options }),
  };
  
  // Value to be provided by the context
  const value = {
    toast,
    showToast,
    hideToast,
  };
  
  return (
    <UIContext.Provider value={value}>
      {children}
      
      {/* Render all active toasts */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          position={toast.position}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </UIContext.Provider>
  );
};

// Custom hook to use the UI context
export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

export default UIContext;