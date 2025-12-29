import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const currentToken = cookieStore.get('github_token')?.value;
    const expiresAtCookie = cookieStore.get('github_token_expires_at')?.value;
    const refreshToken = cookieStore.get('github_refresh_token')?.value;

    if (!currentToken) {
      return NextResponse.json(
        { error: 'No token available', requiresReauth: true },
        { status: 401 }
      );
    }

    const expiresAt = expiresAtCookie ? parseInt(expiresAtCookie, 10) : null;
    const isExpired = expiresAt ? Date.now() >= expiresAt - (5 * 60 * 1000) : false;

    if (!isExpired) {
      return NextResponse.json({ 
        success: true,
        expiresAt,
      });
    }

    if (refreshToken && GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
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
            const tokenExpiresAt = Date.now() + (expiresIn * 1000);

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

            return NextResponse.json({ 
              success: true,
              expiresAt: tokenExpiresAt,
            });
          }
        }
      } catch (refreshError) {
        console.error('Refresh token attempt failed:', refreshError);
      }
    }

    const tokenValidation = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${currentToken}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (tokenValidation.ok) {
      return NextResponse.json({ 
        success: true,
        expiresAt,
      });
    }

    return NextResponse.json(
      { error: 'Token expired or invalid, re-authentication required', requiresReauth: true },
      { status: 401 }
    );
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token', requiresReauth: true },
      { status: 401 }
    );
  }
}

