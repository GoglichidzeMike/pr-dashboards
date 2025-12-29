'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { getToken, removeToken, syncTokenFromAPI, isAuthenticated } from '@/lib/storage/token';
import {
  setTokenExpiration,
  removeTokenExpiration,
  isTokenExpired,
  getTimeUntilExpiration,
} from '@/lib/storage/tokenExpiration';

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
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const syncExpirationFromCookie = useCallback(() => {
    if (typeof window === 'undefined') return;

    const cookies = document.cookie.split(';');
    const expiresAtCookie = cookies.find((c) => c.trim().startsWith('github_token_expires_at='));
    if (expiresAtCookie) {
      const expiresAt = parseInt(expiresAtCookie.split('=')[1], 10);
      if (expiresAt && !isNaN(expiresAt)) {
        setTokenExpiration(expiresAt);
        document.cookie = 'github_token_expires_at=; path=/; max-age=0';
      }
    }
  }, []);

  const performTokenRefresh = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.expiresAt) {
          setTokenExpiration(data.expiresAt);
        }
        await syncTokenFromAPI();
        const newToken = getToken();
        setTokenState(newToken);
        return true;
      } else {
        const errorData = await response.json();
        if (errorData.requiresReauth) {
          removeToken();
          removeTokenExpiration();
          setTokenState(null);
        }
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }, []);

  const setupRefreshInterval = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    const timeUntilExpiration = getTimeUntilExpiration();
    if (!timeUntilExpiration || timeUntilExpiration <= 0) {
      return;
    }

    const refreshTime = Math.max(timeUntilExpiration - 10 * 60 * 1000, 5 * 60 * 1000);

    refreshIntervalRef.current = setTimeout(async () => {
      const expired = isTokenExpired();
      if (expired || !getToken()) {
        await performTokenRefresh();
      }
      setupRefreshInterval();
    }, refreshTime);
  }, [performTokenRefresh]);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);

      let currentToken = getToken();

      if (!currentToken) {
        await syncTokenFromAPI();
        currentToken = getToken();
      }

      syncExpirationFromCookie();

      if (currentToken) {
        const expired = isTokenExpired();
        if (expired) {
          const refreshed = await performTokenRefresh();
          if (!refreshed) {
            currentToken = null;
          } else {
            currentToken = getToken();
          }
        } else {
          setupRefreshInterval();
        }
      }

      setTokenState(currentToken);
      setIsLoading(false);
    };

    initializeAuth();

    return () => {
      if (refreshIntervalRef.current) {
        clearTimeout(refreshIntervalRef.current);
      }
    };
  }, [syncExpirationFromCookie, performTokenRefresh, setupRefreshInterval]);

  const refreshToken = useCallback(async () => {
    await performTokenRefresh();
    setupRefreshInterval();
  }, [performTokenRefresh, setupRefreshInterval]);

  const logout = useCallback(async () => {
    if (refreshIntervalRef.current) {
      clearTimeout(refreshIntervalRef.current);
    }

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      removeToken();
      removeTokenExpiration();
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
