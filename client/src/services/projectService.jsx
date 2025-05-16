// File: src/services/projectService.jsx

import axios from 'axios';
import { getAuth } from 'firebase/auth';

// Base API URL - replace with your backend API URL or environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Helper to get the current user's auth token
const getAuthToken = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    return user.getIdToken();
  }
  throw new Error('User not authenticated');
};

// Create axios instance with auth headers
const createAuthAxios = async () => {
  const token = await getAuthToken();
  return axios.create({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const projectService = {
  // Get all projects for the current user
  getUserProjects: async () => {
    try {
      const authAxios = await createAuthAxios();
      const response = await authAxios.get(`${API_URL}/projects`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user projects:', error);
      throw error;
    }
  },

  // Get a specific project by ID
  getProject: async (projectId) => {
    try {
      const authAxios = await createAuthAxios();
      const response = await authAxios.get(`${API_URL}/projects/${projectId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching project with ID ${projectId}:`, error);
      throw error;
    }
  },

  // Create a new project
  createProject: async (projectData) => {
    try {
      const authAxios = await createAuthAxios();
      const response = await authAxios.post(`${API_URL}/projects`, projectData);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Update an existing project
  updateProject: async (projectId, projectData) => {
    try {
      const authAxios = await createAuthAxios();
      const response = await authAxios.put(`${API_URL}/projects/${projectId}`, projectData);
      return response.data;
    } catch (error) {
      console.error(`Error updating project with ID ${projectId}:`, error);
      throw error;
    }
  },

  // Delete a project
  deleteProject: async (projectId) => {
    try {
      const authAxios = await createAuthAxios();
      await authAxios.delete(`${API_URL}/projects/${projectId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting project with ID ${projectId}:`, error);
      throw error;
    }
  },

  // Invite a member to a project
  inviteMember: async (projectId, email) => {
    try {
      const authAxios = await createAuthAxios();
      const response = await authAxios.post(`${API_URL}/projects/${projectId}/members`, { email });
      return response.data;
    } catch (error) {
      console.error(`Error inviting member to project with ID ${projectId}:`, error);
      throw error;
    }
  },

  // Remove a member from a project
  removeMember: async (projectId, userId) => {
    try {
      const authAxios = await createAuthAxios();
      await authAxios.delete(`${API_URL}/projects/${projectId}/members/${userId}`);
      return true;
    } catch (error) {
      console.error(`Error removing member from project with ID ${projectId}:`, error);
      throw error;
    }
  },

  // Get project statistics
  getProjectStats: async (projectId) => {
    try {
      const authAxios = await createAuthAxios();
      const response = await authAxios.get(`${API_URL}/projects/${projectId}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stats for project with ID ${projectId}:`, error);
      throw error;
    }
  },

  // Update project status (archive/activate)
  updateProjectStatus: async (projectId, status) => {
    try {
      const authAxios = await createAuthAxios();
      const response = await authAxios.patch(`${API_URL}/projects/${projectId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating status for project with ID ${projectId}:`, error);
      throw error;
    }
  },
  
  // Update project statuses (custom kanban columns)
  updateProjectStatuses: async (projectId, statuses) => {
    try {
      const authAxios = await createAuthAxios();
      const response = await authAxios.patch(`${API_URL}/projects/${projectId}/statuses`, { statuses });
      return response.data;
    } catch (error) {
      console.error(`Error updating statuses for project with ID ${projectId}:`, error);
      throw error;
    }
  }
};

export default projectService;