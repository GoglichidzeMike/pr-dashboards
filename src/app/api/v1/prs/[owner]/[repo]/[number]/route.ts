import { NextRequest, NextResponse } from 'next/server';
import { getGitHubToken } from '@/server/auth/session';
import { fetchPRDetails } from '@/server/github/prService';

type Params = {
  params: Promise<{
    owner: string;
    repo: string;
    number: string;
  }>;
};

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const token = await getGitHubToken();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { owner, repo, number } = await params;
    const prNumber = parseInt(number, 10);

    if (isNaN(prNumber)) {
      return NextResponse.json({ error: 'Invalid PR number' }, { status: 400 });
    }

    const pr = await fetchPRDetails(token, owner, repo, prNumber);

    if (!pr) {
      return NextResponse.json({ error: 'PR not found' }, { status: 404 });
    }

    return NextResponse.json(pr);
  } catch (error) {
    console.error('Error fetching PR details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

