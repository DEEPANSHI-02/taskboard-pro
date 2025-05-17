// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './routes/PrivateRoute';
import { AuthProvider } from './features/auth/AuthProvider';

// Pages
import LoginPage from './features/auth/LoginPage';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Project';
import ProjectPage from './pages/ProjectPage';
import AutomationPage from './pages/AutomationPage';

// Layout components (you may need to create these)
import AppLayout from './components/layout/AppLayout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Private routes (wrapped in authentication check) */}
          <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="project/:projectId" element={<ProjectPage />} />
            <Route path="project/:projectId/automations" element={<AutomationPage />} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;