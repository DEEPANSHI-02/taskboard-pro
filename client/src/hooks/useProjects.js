import { useState, useEffect, useCallback } from "react";
import useAuth from "./useAuth";

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const fetchProjects = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching projects: ${response.statusText}`);
      }

      const data = await response.json();
      setProjects(data.projects || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError(err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Function to manually trigger a refresh of projects
  const refetchProjects = useCallback(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, loading, error, refetchProjects };
};