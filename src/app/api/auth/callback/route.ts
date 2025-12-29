import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/server/db/prisma';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, APP_URL));
  }

  // Validate required parameters
  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', APP_URL));
  }

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    console.error('Missing GitHub OAuth credentials');
    return NextResponse.redirect(new URL('/login?error=server_config', APP_URL));
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        state,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(tokenData.error_description || tokenData.error)}`,
          APP_URL
        )
      );
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in || 60 * 60 * 24 * 30;
    const tokenExpiresAt = Date.now() + expiresIn * 1000;

    if (!accessToken) {
      throw new Error('No access token received');
    }

    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user from GitHub');
    }

    const githubUser = await userResponse.json();

    let userEmail = githubUser.email;

    if (!userEmail) {
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json',
        },
      });

      if (emailsResponse.ok) {
        const emails = (await emailsResponse.json()) as Array<{
          email: string;
          primary: boolean;
          verified: boolean;
        }>;
        const primaryEmail = emails.find((e) => e.primary && e.verified);
        if (primaryEmail) {
          userEmail = primaryEmail.email;
        } else {
          const verifiedEmail = emails.find((e) => e.verified);
          if (verifiedEmail) {
            userEmail = verifiedEmail.email;
          } else if (emails.length > 0) {
            userEmail = emails[0].email;
          }
        }
      }
    }

    await prisma.user.upsert({
      where: { githubId: githubUser.id },
      update: {
        githubLogin: githubUser.login,
        email: userEmail,
        avatarUrl: githubUser.avatar_url,
      },
      create: {
        githubId: githubUser.id,
        githubLogin: githubUser.login,
        email: userEmail,
        avatarUrl: githubUser.avatar_url,
      },
    });

    const cookieStore = await cookies();
    const maxAge = expiresIn;

    cookieStore.set('github_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
    });

    cookieStore.set('github_token_sync', accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
    });

    cookieStore.set('github_token_expires_at', tokenExpiresAt.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
    });

    if (refreshToken) {
      cookieStore.set('github_refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
      });
    }

    return NextResponse.redirect(new URL('/', APP_URL));
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=oauth_failed', APP_URL));
  }
}
