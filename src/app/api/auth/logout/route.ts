import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Logout route - clears authentication cookies
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Clear both token cookies
    cookieStore.delete('github_token');
    cookieStore.delete('github_token_sync');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}

