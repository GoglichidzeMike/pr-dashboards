import { cookies } from 'next/headers';
import { prisma } from '@/server/db/prisma';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

async function attemptTokenRefresh(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  refreshToken: string
): Promise<boolean> {
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return false;
  }

  try {
    const refreshResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (refreshResponse.ok) {
      const tokenData = await refreshResponse.json();

      if (!tokenData.error && tokenData.access_token) {
        const accessToken = tokenData.access_token;
        const newRefreshToken = tokenData.refresh_token;
        const expiresIn = tokenData.expires_in || 60 * 60 * 24 * 30;
        const tokenExpiresAt = Date.now() + expiresIn * 1000;

        cookieStore.set('github_token', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: expiresIn,
          path: '/',
        });

        cookieStore.set('github_token_sync', accessToken, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: expiresIn,
          path: '/',
        });

        cookieStore.set('github_token_expires_at', tokenExpiresAt.toString(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: expiresIn,
          path: '/',
        });

        if (newRefreshToken) {
          cookieStore.set('github_refresh_token', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 365,
            path: '/',
          });
        }

        return true;
      }
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
  }

  return false;
}

export async function getGitHubToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('github_token');
  const expiresAtCookie = cookieStore.get('github_token_expires_at')?.value;

  if (!token) return null;

  const expiresAt = expiresAtCookie ? parseInt(expiresAtCookie, 10) : null;
  const isExpired = expiresAt ? Date.now() >= expiresAt - 5 * 60 * 1000 : false;

  if (isExpired) {
    const refreshToken = cookieStore.get('github_refresh_token')?.value;
    if (refreshToken) {
      const refreshed = await attemptTokenRefresh(cookieStore, refreshToken);
      if (refreshed) {
        const newToken = cookieStore.get('github_token');
        return newToken?.value || null;
      }
    }

    const tokenValidation = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token.value}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (!tokenValidation.ok) {
      return null;
    }
  }

  return token.value;
}

export async function getSessionUser() {
  const token = await getGitHubToken();
  if (!token) return null;

  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (response.status === 401) {
      return null;
    }

    if (!response.ok) {
      return null;
    }

    const githubUser = await response.json();

    const user = await prisma.user.findUnique({
      where: { githubId: githubUser.id },
    });

    return user;
  } catch (error) {
    console.error('Error fetching session user:', error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
