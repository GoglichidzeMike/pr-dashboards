'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getToken, removeToken, syncTokenFromAPI, isAuthenticated } from '@/lib/storage/token';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      // First check localStorage
      let currentToken = getToken();
      
      // If no token, try to sync from API (cookie)
      if (!currentToken) {
        await syncTokenFromAPI();
        currentToken = getToken();
      }
      
      setTokenState(currentToken);
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const refreshToken = useCallback(async () => {
    await syncTokenFromAPI();
    const newToken = getToken();
    setTokenState(newToken);
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call logout API to clear server-side cookies
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear client-side token
      removeToken();
      setTokenState(null);
    }
  }, []);

  const value: AuthContextType = {
    token,
    isAuthenticated: isAuthenticated(),
    isLoading,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

