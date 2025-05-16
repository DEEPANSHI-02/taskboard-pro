// src/services/api.js
import axios from "axios";
import { useAuth } from "../features/auth/AuthProvider";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

export const attachToken = (token) => {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export default api;
