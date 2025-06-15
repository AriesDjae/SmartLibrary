import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUsers } from '../data/mockData';

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
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check for stored user in localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);
  
  const signIn = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = mockUsers.find(u => u.email === email);
        if (user) {
          setCurrentUser(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1000);
    });
  };
  
  const signUp = async (name: string, email: string, password: string): Promise<boolean> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const existingUser = mockUsers.find(u => u.email === email);
        if (existingUser) {
          resolve(false);
        } else {
          const newUser = {
            id: `user-${Date.now()}`,
            name,
            email,
          };
          setCurrentUser(newUser);
          localStorage.setItem('currentUser', JSON.stringify(newUser));
          resolve(true);
        }
      }, 1000);
    });
  };
  
  const signOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };
  
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    signIn,
    signUp,
    signOut,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};