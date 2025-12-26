import { NextRequest, NextResponse } from 'next/server';
import { getGitHubToken } from '@/server/auth/session';
import { fetchPullRequests } from '@/server/github/prService';

export async function GET(request: NextRequest) {
  try {
    const token = await getGitHubToken();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const reposParam = searchParams.get('repos');
    
    if (!reposParam) {
      return NextResponse.json({ error: 'repos parameter is required' }, { status: 400 });
    }

    const repos = reposParam.split(',').filter(Boolean);

    const prs = await fetchPullRequests(token, repos);

    return NextResponse.json({ pullRequests: prs });
  } catch (error) {
    console.error('Error fetching pull requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

