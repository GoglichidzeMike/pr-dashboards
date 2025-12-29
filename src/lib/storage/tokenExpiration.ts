export function getTokenExpiration(): number | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const expiresAt = localStorage.getItem('github_token_expires_at');
  return expiresAt ? parseInt(expiresAt, 10) : null;
}

export function setTokenExpiration(expiresAt: number): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem('github_token_expires_at', expiresAt.toString());
}

export function removeTokenExpiration(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem('github_token_expires_at');
}

export function isTokenExpired(): boolean {
  const expiresAt = getTokenExpiration();
  if (!expiresAt) {
    return false;
  }
  
  const bufferTime = 5 * 60 * 1000;
  return Date.now() >= expiresAt - bufferTime;
}

export function getTimeUntilExpiration(): number | null {
  const expiresAt = getTokenExpiration();
  if (!expiresAt) {
    return null;
  }
  
  const timeLeft = expiresAt - Date.now();
  return timeLeft > 0 ? timeLeft : 0;
}

