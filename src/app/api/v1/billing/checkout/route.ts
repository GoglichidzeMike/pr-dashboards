import { NextResponse } from 'next/server';
import { getSessionUser } from '@/server/auth/session';

export async function POST() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ 
    url: '/settings?upgrade=coming-soon',
    message: 'Billing integration coming soon!' 
  });
}

