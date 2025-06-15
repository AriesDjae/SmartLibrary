import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAuthenticated }) => {
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/sign-in\" state={{ from: location }} replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;