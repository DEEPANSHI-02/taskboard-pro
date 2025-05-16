// File: src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../utils/axios';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handle Google Login
  const loginWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Get Firebase token
      const idToken = await result.user.getIdToken();
      
      // Send token to backend to create or retrieve user

      const response = await api.post('/auth/google-login', {}, {
  headers: {
    Authorization: `Bearer ${idToken}`,
  }
});

      
      // Save JWT token from our backend
      localStorage.setItem('token', response.data.token);
      
      // Update user state
      setCurrentUser(response.data.user);
      
      return response.data.user;
    } catch (err) {
      console.error('Google login error:', err);
      setError(err.message || 'Failed to login with Google');
      throw err;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('token');
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message || 'Failed to logout');
      throw err;
    }
  };

  // Verify auth state on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Check if we have a token
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Verify token with backend
        const response = await api.get('/auth/me');
        setCurrentUser(response.data.user);
      } catch (err) {
        // Invalid token, clear it
        localStorage.removeItem('token');
        console.error('Token verification error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Firebase logged out, make sure we're logged out too
        localStorage.removeItem('token');
        setCurrentUser(null);
        setLoading(false);
      } else {
        // We're logged in with Firebase, verify backend token
        verifyToken();
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Auth context value
  const value = {
    currentUser,
    loading,
    error,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;