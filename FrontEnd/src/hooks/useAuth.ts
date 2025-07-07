import { useState, useEffect } from 'react';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'librarian' | 'member';
  avatar?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginMode, setIsLoginMode] = useState(true);

  useEffect(() => {
    // Simulate authentication check
    const timer = setTimeout(() => {
      setUser({
        id: '1',
        name: 'Sarah Wilson',
        email: 'sarah@library.com',
        role: 'admin',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop'
      });
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser({
      id: '1',
      name: 'Sarah Wilson',
      email: email,
      role: 'admin',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop'
    });
    setLoading(false);
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser({
      id: '2',
      name: name,
      email: email,
      role: 'member',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop'
    });
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  const toggleAuthMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  const updateProfile = (updates: Partial<AuthUser>) => {
    setUser((prev) => prev ? { ...prev, ...updates } : prev);
  };

  return { 
    user, 
    loading, 
    isLoginMode, 
    login, 
    register, 
    logout, 
    toggleAuthMode, 
    updateProfile
  };
}; 