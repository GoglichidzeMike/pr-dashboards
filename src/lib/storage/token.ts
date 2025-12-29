/**
 * Token storage utilities
 * Uses httpOnly cookies for server-side, localStorage for client-side fallback
 */

import { setTokenExpiration } from './tokenExpiration';

const TOKEN_KEY = 'github_token';

/**
 * Get token from localStorage (client-side only)
 * Also checks for sync cookie and syncs it to localStorage
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  // Check localStorage first
  let token = localStorage.getItem(TOKEN_KEY);
  
  // If not in localStorage, check sync cookie and sync it
  if (!token) {
    const cookies = document.cookie.split(';');
    const syncCookie = cookies.find(c => c.trim().startsWith('github_token_sync='));
    if (syncCookie) {
      token = syncCookie.split('=')[1];
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        document.cookie = 'github_token_sync=; path=/; max-age=0';
      }
    }
    
    const expiresAtCookie = cookies.find(c => c.trim().startsWith('github_token_expires_at='));
    if (expiresAtCookie) {
      const expiresAt = parseInt(expiresAtCookie.split('=')[1], 10);
      if (expiresAt && !isNaN(expiresAt)) {
        setTokenExpiration(expiresAt);
        document.cookie = 'github_token_expires_at=; path=/; max-age=0';
      }
    }
  }

  return token;
}

/**
 * Set token in localStorage (client-side only)
 */
export function setToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove token from localStorage (client-side only)
 */
export function removeToken(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(TOKEN_KEY);
  // Also clear sync cookie if present
  document.cookie = 'github_token_sync=; path=/; max-age=0';
}

/**
 * Check if user is authenticated (has token)
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

/**
 * Sync token from API route (fallback method)
 */
export async function syncTokenFromAPI(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const response = await fetch('/api/auth/token');
    if (response.ok) {
      const data = await response.json();
      if (data.token) {
        setToken(data.token);
      }
      if (data.expiresAt) {
        setTokenExpiration(data.expiresAt);
      }
    }
  } catch (error) {
    console.error('Failed to sync token from API:', error);
  }
}

