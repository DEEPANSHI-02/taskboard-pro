// src/routes/AppRouter.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../features/auth/AuthProvider";
import PrivateRoute from "./PrivateRoute";

// Pages
import LoginPage from "../features/auth/LoginPage";
import Dashboard from "../pages/Dashboard";
import Projects from "../pages/Project";
import ProjectPage from "../pages/ProjectPage";
import AutomationPage from "../pages/AutomationPage";

// Main layout components (you may need to create these)
import AppLayout from "../components/layout/AppLayout";

const AppRouter = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="project/:projectId" element={<ProjectPage />} />
            <Route path="project/:projectId/automations" element={<AutomationPage />} />
          </Route>
          
          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default AppRouter;