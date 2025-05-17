// client/src/components/layout/AppLayout.jsx
import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '../../hooks/useLogout';
import useAuth from '../../hooks/useAuth';

const AppLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = async () => {
    const success = await logoutUser();
    if (success) {
      navigate('/login');
    }
  };

  // Check active route for navigation highlighting
  const isActiveRoute = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path === '/projects' && location.pathname === '/projects') return true;
    if (path === '/project' && location.pathname.startsWith('/project/')) return true;
    return false;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-white shadow-md ${isSidebarOpen ? 'w-64' : 'w-20'} transition-width duration-300 ease-in-out flex-shrink-0`}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            {isSidebarOpen && <h1 className="text-xl font-bold text-primary-600">TaskBoard Pro</h1>}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        <nav className="mt-8">
          <ul>
            <li>
              <Link 
                to="/dashboard" 
                className={`flex items-center px-4 py-3 ${isActiveRoute('/dashboard') 
                  ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600' 
                  : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {isSidebarOpen && <span>Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link 
                to="/projects" 
                className={`flex items-center px-4 py-3 ${isActiveRoute('/projects') 
                  ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600' 
                  : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {isSidebarOpen && <span>Projects</span>}
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <h2 className="text-lg font-medium text-gray-800">
                {location.pathname === '/dashboard' && 'Dashboard'}
                {location.pathname === '/projects' && 'Projects'}
                {location.pathname.startsWith('/project/') && !location.pathname.includes('automations') && 'Project Details'}
                {location.pathname.includes('automations') && 'Project Automations'}
              </h2>
            </div>
            <div className="flex items-center">
              <div className="relative">
                <button className="flex items-center text-gray-700 hover:text-gray-900 focus:outline-none">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-2">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  {isSidebarOpen && (
                    <span className="text-sm font-medium">{user?.name || user?.email || 'User'}</span>
                  )}
                </button>
                <button 
                  onClick={handleLogout}
                  className="ml-4 text-sm text-gray-600 hover:text-gray-900"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;