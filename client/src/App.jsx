import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

// Import pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProjectsPage from './pages/dashboard/ProjectsPage';
import ProjectDetailsPage from './pages/projects/ProjectDetailsPage';
import CreateProjectPage from './pages/projects/CreateProjectPage';
import EditProjectPage from './pages/projects/EditProjectPage';
import ErrorPage from './pages/ErrorPage';

// Import components
import AuthGuard from './components/auth/AuthGuard';
import MainLayout from './components/layout/MainLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes with layout */}
          <Route element={<AuthGuard><MainLayout /></AuthGuard>}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/new" element={<CreateProjectPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
            <Route path="/projects/:projectId/edit" element={<EditProjectPage />} />
          </Route>
          
          {/* Error page */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default App;