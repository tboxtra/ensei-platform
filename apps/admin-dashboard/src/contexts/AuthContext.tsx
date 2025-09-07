'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AdminUser, AuthContextType, LoginCredentials, mockAuth } from '../lib/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing auth on mount
    const existingUser = mockAuth.getCurrentUser();
    if (existingUser) {
      setUser(existingUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const user = await mockAuth.login(credentials);
      const token = `mock_token_${user.id}_${Date.now()}`;
      
      mockAuth.setAuth(user, token);
      setUser(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    mockAuth.logout();
    setUser(null);
    setError(null);
  };

  const refreshToken = async () => {
    // In a real app, this would refresh the JWT token
    const existingUser = mockAuth.getCurrentUser();
    if (existingUser) {
      setUser(existingUser);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.permissions.includes('*')) return true;
    return user.permissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    refreshToken,
    hasPermission,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
