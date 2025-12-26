export function getSubscriptionStatus(userId: string) {
  return {
    plan: 'free' as const,
    status: 'free',
    repoLimit: 5,
    pollingLimit: 30000,
  };
}

export async function createCheckoutSession() {
  return Promise.resolve({ url: '/settings?upgrade=coming-soon' });
}

export async function createPortalSession() {
  return Promise.resolve({ url: '/settings?billing=coming-soon' });
}

