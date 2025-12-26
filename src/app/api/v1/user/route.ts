import { NextResponse } from 'next/server';
import { getSessionUser } from '@/server/auth/session';

export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      githubId: user.githubId,
      githubLogin: user.githubLogin,
      email: user.email,
      avatarUrl: user.avatarUrl,
      preferences: user.preferences,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

