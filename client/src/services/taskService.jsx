// File: src/services/taskService.jsx

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

export const taskService = {
  // Get all tasks for a specific project
  getProjectTasks: async (projectId) => {
    try {
      const authAxios = await createAuthAxios();
      const response = await authAxios.get(`${API_URL}/projects/${projectId}/tasks`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tasks for project with ID ${projectId}:`, error);
      throw error;
    }
  },

  // Get a specific task by ID
  getTask: async (taskId) => {
    try {
      const authAxios = await createAuthAxios();
      const response = await authAxios.get(`${API_URL}/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching task with ID ${taskId}:`, error);
      throw error;
    }
  },

  // Create a new task
  createTask: async (taskData) => {
    try {
      const authAxios = await createAuthAxios();
      const response = await authAxios.post(`${API_URL}/tasks`, taskData);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // Update an existing task
  updateTask: async (taskId, taskData) => {
    try {
      const authAxios = await createAuthAxios();
      const response = await authAxios.put(`${API_URL}/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      console.error(`Error updating task with ID ${taskId}:`, error);
      throw error;
    }
  },

  // Delete a task
  deleteTask: async (taskId) => {
    try {
      const authAxios = await createAuthAxios();
      await authAxios.delete(`${API_URL}/tasks/${taskId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting task with ID ${taskId}:`, error);
      throw error;
    }
  },

  // Move a task to a different status
  updateTaskStatus: async (taskId, status) => {
    try {
      const authAxios = await createAuthAxios();
      const response = await authAxios.patch(`${API_URL}/tasks/${taskId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating status for task with ID ${taskId}:`, error);
      throw error;
    }
  },

  // Change task assignee
  assignTask: async (taskId, userId) => {
    try {
      const authAxios = await createAuthAxios();
      const response = await authAxios.patch(`${API_URL}/tasks/${taskId}/assign`, { assignedTo: userId });
      return response.data;
    } catch (error) {
      console.error(`Error assigning task with ID ${taskId}:`, error);
      throw error;
    }
  },

  // Add a comment to a task
  addComment: async (taskId, commentData) => {
    try {
      const authAxios = await createAuthAxios();
      const response = await authAxios.post(`${API_URL}/tasks/${taskId}/comments`, commentData);
      return response.data;
    } catch (error) {
      console.error(`Error adding comment to task with ID ${taskId}:`, error);
      throw error;
    }
  },

  // Get task comments
  getTaskComments: async (taskId) => {
    try {
      const authAxios = await createAuthAxios();
      const response = await authAxios.get(`${API_URL}/tasks/${taskId}/comments`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching comments for task with ID ${taskId}:`, error);
      throw error;
    }
  },

  // Toggle task completion
  toggleTaskCompletion: async (taskId, isCompleted) => {
    try {
      const authAxios = await createAuthAxios();
      const response = await authAxios.patch(`${API_URL}/tasks/${taskId}/complete`, { completed: isCompleted });
      return response.data;
    } catch (error) {
      console.error(`Error toggling completion for task with ID ${taskId}:`, error);
      throw error;
    }
  },

  // Update task priority
  updateTaskPriority: async (taskId, priority) => {
    try {
      const authAxios = await createAuthAxios();
      const response = await authAxios.patch(`${API_URL}/tasks/${taskId}/priority`, { priority });
      return response.data;
    } catch (error) {
      console.error(`Error updating priority for task with ID ${taskId}:`, error);
      throw error;
    }
  },

  // Get tasks assigned to current user
  getUserTasks: async () => {
    try {
      const authAxios = await createAuthAxios();
      const response = await authAxios.get(`${API_URL}/tasks/assigned`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      throw error;
    }
  }
};

export default taskService;