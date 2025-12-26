import { NextRequest, NextResponse } from 'next/server';
import { getGitHubToken } from '@/server/auth/session';
import { mergePR } from '@/server/github/prActions';
import { z } from 'zod';

type Params = {
  params: Promise<{
    owner: string;
    repo: string;
    number: string;
  }>;
};

const mergeSchema = z.object({
  pullRequestId: z.string(),
  commitHeadline: z.string().optional(),
  commitBody: z.string().optional(),
  mergeMethod: z.enum(['MERGE', 'SQUASH', 'REBASE']).optional(),
});

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const token = await getGitHubToken();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { pullRequestId, commitHeadline, commitBody, mergeMethod } = mergeSchema.parse(body);

    const pr = await mergePR(token, pullRequestId, commitHeadline, commitBody, mergeMethod);

    return NextResponse.json(pr);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }
    console.error('Error merging PR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

