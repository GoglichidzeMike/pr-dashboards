import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/server/auth/session';
import { prisma } from '@/server/db/prisma';
import { z } from 'zod';

const preferencesSchema = z.object({
  pollingInterval: z.number().min(10000).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  selectedRepos: z.array(z.string()).optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    prAssigned: z.boolean().optional(),
    reviewRequested: z.boolean().optional(),
    weeklyDigest: z.boolean().optional(),
  }).optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const preferences = preferencesSchema.parse(body);

    const currentPrefs = (user.preferences as any) || {};
    const updatedPrefs = { ...currentPrefs, ...preferences };

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { preferences: updatedPrefs },
    });

    return NextResponse.json({ preferences: updatedUser.preferences });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid preferences', details: error.errors }, { status: 400 });
    }
    console.error('Error updating preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

