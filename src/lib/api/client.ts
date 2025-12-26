export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new APIError(response.status, error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  user: {
    get: () => fetchAPI<any>('/api/v1/user'),
    updatePreferences: (preferences: any) =>
      fetchAPI<any>('/api/v1/user/preferences', {
        method: 'PATCH',
        body: JSON.stringify(preferences),
      }),
  },

  repos: {
    list: () => fetchAPI<any>('/api/v1/repos'),
  },

  prs: {
    list: (repos: string[]) => {
      const reposParam = repos.join(',');
      return fetchAPI<{ pullRequests: any[] }>(`/api/v1/prs?repos=${encodeURIComponent(reposParam)}`);
    },
    get: (owner: string, repo: string, number: number) =>
      fetchAPI<any>(`/api/v1/prs/${owner}/${repo}/${number}`),
    approve: (owner: string, repo: string, number: number, pullRequestId: string, body?: string) =>
      fetchAPI<any>(`/api/v1/prs/${owner}/${repo}/${number}/approve`, {
        method: 'POST',
        body: JSON.stringify({ pullRequestId, body }),
      }),
    requestChanges: (owner: string, repo: string, number: number, pullRequestId: string, body: string) =>
      fetchAPI<any>(`/api/v1/prs/${owner}/${repo}/${number}/request-changes`, {
        method: 'POST',
        body: JSON.stringify({ pullRequestId, body }),
      }),
    comment: (owner: string, repo: string, number: number, pullRequestId: string, body: string) =>
      fetchAPI<any>(`/api/v1/prs/${owner}/${repo}/${number}/comment`, {
        method: 'POST',
        body: JSON.stringify({ pullRequestId, body }),
      }),
    merge: (
      owner: string,
      repo: string,
      number: number,
      pullRequestId: string,
      options?: {
        commitHeadline?: string;
        commitBody?: string;
        mergeMethod?: 'MERGE' | 'SQUASH' | 'REBASE';
      }
    ) =>
      fetchAPI<any>(`/api/v1/prs/${owner}/${repo}/${number}/merge`, {
        method: 'POST',
        body: JSON.stringify({ pullRequestId, ...options }),
      }),
    close: (owner: string, repo: string, number: number, pullRequestId: string) =>
      fetchAPI<any>(`/api/v1/prs/${owner}/${repo}/${number}/close`, {
        method: 'POST',
        body: JSON.stringify({ pullRequestId }),
      }),
    reopen: (owner: string, repo: string, number: number, pullRequestId: string) =>
      fetchAPI<any>(`/api/v1/prs/${owner}/${repo}/${number}/reopen`, {
        method: 'POST',
        body: JSON.stringify({ pullRequestId }),
      }),
  },
};

