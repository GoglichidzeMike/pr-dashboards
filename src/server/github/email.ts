import { getGitHubToken } from '@/server/auth/session';

export async function fetchUserEmail(): Promise<string | null> {
  const token = await getGitHubToken();
  if (!token) return null;

  try {
    const response = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (!response.ok) return null;

    const emails = await response.json() as Array<{ email: string; primary: boolean; verified: boolean }>;
    
    const primaryEmail = emails.find((e) => e.primary && e.verified);
    if (primaryEmail) return primaryEmail.email;

    const verifiedEmail = emails.find((e) => e.verified);
    if (verifiedEmail) return verifiedEmail.email;

    if (emails.length > 0) return emails[0].email;

    return null;
  } catch (error) {
    console.error('Error fetching user email:', error);
    return null;
  }
}


