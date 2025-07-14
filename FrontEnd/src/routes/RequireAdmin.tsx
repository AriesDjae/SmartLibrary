import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import React from 'react';

const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  // Show loading state while checking user
  if (currentUser === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect if user is not admin - database uses "r2" for admin
  if (currentUser.role_id !== 'r2') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default RequireAdmin; 