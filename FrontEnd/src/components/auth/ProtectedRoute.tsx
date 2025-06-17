import React from "react";
import { Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  isAuthenticated: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = () => {
  // Sementara selalu mengizinkan akses
  return <Outlet />;
};

export default ProtectedRoute;
