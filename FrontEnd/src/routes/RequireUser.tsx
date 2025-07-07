import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import React from 'react';

const RequireUser: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  if (currentUser === null) return null; // atau spinner
  if (currentUser.role_id === 'r2') return <Navigate to="/admin" replace />;
  return <>{children}</>;
};
export default RequireUser; 