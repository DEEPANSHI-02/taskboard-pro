// src/utils/api.js
import axios from "axios";

// Create an api instance with our API base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    // First check context storage via localStorage for backward compatibility
    const token = localStorage.getItem("authToken");
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
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;