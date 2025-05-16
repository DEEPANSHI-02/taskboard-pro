import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../features/auth/AuthProvider";

/**
 * Custom hook to fetch and manage projects
 * @returns {Object} Projects data and state
 */
export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/projects`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setProjects(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch projects");
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err.response?.data?.message || "An error occurred while fetching projects");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (token) {
      fetchProjects();
    }
  }, [token]);
  
  return {
    projects,
    loading,
    error,
    refreshProjects: fetchProjects
  };
};