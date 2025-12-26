import { NextRequest, NextResponse } from 'next/server';
import { getGitHubToken } from '@/server/auth/session';
import { reopenPR } from '@/server/github/prActions';
import { z } from 'zod';

type Params = {
  params: Promise<{
    owner: string;
    repo: string;
    number: string;
  }>;
};

const reopenSchema = z.object({
  pullRequestId: z.string(),
});

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const token = await getGitHubToken();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { pullRequestId } = reopenSchema.parse(body);

    const pr = await reopenPR(token, pullRequestId);

    return NextResponse.json(pr);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }
    console.error('Error reopening PR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

