import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GoogleLoginButton from '../../components/auth/GoogleLoginButton';
import Loader from '../../components/ui/Loader';

const LoginPage = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginError, setLoginError] = useState(null);

  // Redirect path (where to go after successful login)
  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser && !loading) {
      navigate(from, { replace: true });
    }
  }, [currentUser, loading, navigate, from]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            TaskBoard Pro
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Advanced Task Collaboration with Workflow Automation
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          {loginError && (
            <div className="bg-red-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {loginError}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <GoogleLoginButton 
              onSuccess={() => navigate(from, { replace: true })}
              onError={(error) => setLoginError(error)} 
            />
          </div>
          
          <div className="flex items-center justify-center">
            <div className="text-sm">
              <span className="text-gray-500">
                By logging in, you agree to our Terms of Service and Privacy Policy
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;