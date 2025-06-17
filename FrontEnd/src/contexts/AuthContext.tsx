import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";
import { useApi } from "../hooks/useApi";

interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Dummy user untuk development
const dummyUser: User = {
  id: "1",
  name: "User Dummy",
  email: "user@example.com",
  profileImage: "https://ui-avatars.com/api/?name=User+Dummy",
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(dummyUser);
  const [isLoading, setIsLoading] = useState(false);
  const { execute } = useApi<User>();

  // Sementara kita skip pengecekan token dan user di localStorage
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    // Sementara selalu return true
    return true;
  };

  const signUp = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    // Sementara selalu return true
    return true;
  };

  const signOut = async () => {
    // Sementara tidak melakukan apa-apa
    return;
  };

  const value = {
    currentUser,
    isAuthenticated: true, // Selalu true untuk sementara
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
