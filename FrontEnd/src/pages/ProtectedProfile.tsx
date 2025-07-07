import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import ProfilePage from "./ProfilePage";
import AdminProfilePage from "./AdminProfilePage";

const ProtectedProfile: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) return <Navigate to="/sign-in" />;
  if (currentUser.role_id === "r2") {
    return <AdminProfilePage />;
  }
  return <ProfilePage />;
};

export default ProtectedProfile; 