import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useApi } from '../hooks/useApi';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { execute } = useApi<User>();
  
  useEffect(() => {
    // Check for stored token and user in localStorage
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('currentUser');
    
    if (token && storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // DEV MODE: Bypass login for testing
  if (!currentUser) {
    setCurrentUser({ id: 'dev', name: 'Developer', email: 'dev@inspira.com' });
  }

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await execute(authAPI.signIn({ email, password }));
      const { token, user } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentUser(user);
      return true;
    } catch (error) {
      console.error('Sign in error:', error);
      return false;
    }
  };
  
  const signUp = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await execute(authAPI.signUp({ name, email, password }));
      const { token, user } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentUser(user);
      return true;
    } catch (error) {
      console.error('Sign up error:', error);
      return false;
    }
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    window.location.href = '/sign-in';
  };

  const value = {
    currentUser: currentUser || { id: 'dev', name: 'Developer', email: 'dev@inspira.com' },
    isAuthenticated: true,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
