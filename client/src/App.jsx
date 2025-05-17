import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./features/auth/AuthProvider";
import PrivateRoute from "./routes/PrivateRoute";

// Pages
import LoginPage from "./features/auth/LoginPage";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Project";
import ProjectPage from "./pages/ProjectPage";
// import AutomationPage from "./pages/AutomationPage";

// Layout
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";

function App() {
  return (
    <Router> {/* ✅ Move Router to the top */}
      <AuthProvider> {/* ✅ Now inside Router */}
        <div className="flex h-screen">
          {/* Sidebar (Visible after login) */}
          <PrivateRoute>
            <Sidebar />
          </PrivateRoute>

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <PrivateRoute>
              <Topbar />
            </PrivateRoute>

            <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <Navigate to="/dashboard" />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/project/:projectId"
                  element={
                    <PrivateRoute>
                      <ProjectPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/project/:projectId/automations"
                  element={
                    <PrivateRoute>
                      <AutomationPage />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
