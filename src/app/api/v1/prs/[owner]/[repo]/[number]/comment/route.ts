import { NextRequest, NextResponse } from 'next/server';
import { getGitHubToken } from '@/server/auth/session';
import { addPRComment } from '@/server/github/prActions';
import { z } from 'zod';

type Params = {
  params: Promise<{
    owner: string;
    repo: string;
    number: string;
  }>;
};

const commentSchema = z.object({
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
    const { pullRequestId, body: commentBody } = commentSchema.parse(body);

    const comment = await addPRComment(token, pullRequestId, commentBody);

    return NextResponse.json(comment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

