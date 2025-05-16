// File: src/utils/axios.js

import axios from 'axios';

// Create an axios instance with our API base URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
     withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status } = error.response || {};
    
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;