import { NextRequest, NextResponse } from 'next/server';
import { getGitHubToken } from '@/server/auth/session';
import { requestChanges } from '@/server/github/prActions';
import { z } from 'zod';

type Params = {
  params: Promise<{
    owner: string;
    repo: string;
    number: string;
  }>;
};

const requestChangesSchema = z.object({
  pullRequestId: z.string(),
  body: z.string(),
});

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const token = await getGitHubToken();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { pullRequestId, body: reviewBody } = requestChangesSchema.parse(body);

    const review = await requestChanges(token, pullRequestId, reviewBody);

    return NextResponse.json(review);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.errors }, { status: 400 });
    }
    console.error('Error requesting changes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

