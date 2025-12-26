import { cookies } from 'next/headers';
import { prisma } from '@/server/db/prisma';

export async function getGitHubToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('github_token');
  return token?.value || null;
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

    if (!response.ok) return null;

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

