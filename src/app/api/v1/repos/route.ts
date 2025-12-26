import { NextResponse } from 'next/server';
import { getGitHubToken } from '@/server/auth/session';
import { fetchRepositories } from '@/server/github/repoService';

export async function GET() {
  try {
    const token = await getGitHubToken();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const repos = await fetchRepositories(token);

    return NextResponse.json(repos);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

