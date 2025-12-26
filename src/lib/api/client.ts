import { PullRequest } from '@/lib/hooks/usePRs';
import { PRDetails } from '@/lib/hooks/usePRDetails.old';
import { Repository, Organization } from '@/lib/hooks/useRepos';

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

interface UserResponse {
  id: string;
  githubId: string;
  githubLogin: string;
  email: string | null;
  avatarUrl: string | null;
  preferences: Record<string, unknown>;
}

interface ReposResponse {
  personalRepos: Repository[];
  organizations: Organization[];
  allRepos: Repository[];
  viewerLogin: string;
}

interface PullRequestReviewResponse {
  id: string;
  state: string;
}

interface PRCommentResponse {
  id: string;
  body: string;
  bodyHTML: string;
  createdAt: string;
  author: {
    login: string;
    avatarUrl: string;
  };
}

interface MergePRResponse {
  id: string;
  merged: boolean;
  mergedAt: string | null;
}

interface ClosePRResponse {
  id: string;
  closed: boolean;
  closedAt: string | null;
  state: string;
}

interface ReopenPRResponse {
  id: string;
  closed: boolean;
  state: string;
}

export const api = {
  user: {
    get: (): Promise<UserResponse> => fetchAPI<UserResponse>('/api/v1/user'),
    updatePreferences: (preferences: Record<string, unknown>): Promise<UserResponse> =>
      fetchAPI<UserResponse>('/api/v1/user/preferences', {
        method: 'PATCH',
        body: JSON.stringify(preferences),
      }),
  },

  repos: {
    list: (): Promise<ReposResponse> => fetchAPI<ReposResponse>('/api/v1/repos'),
  },

  prs: {
    list: (repos: string[]): Promise<{ pullRequests: PullRequest[] }> => {
      const reposParam = repos.join(',');
      return fetchAPI<{ pullRequests: PullRequest[] }>(`/api/v1/prs?repos=${encodeURIComponent(reposParam)}`);
    },
    get: (owner: string, repo: string, number: number): Promise<PRDetails> =>
      fetchAPI<PRDetails>(`/api/v1/prs/${owner}/${repo}/${number}`),
    approve: (owner: string, repo: string, number: number, pullRequestId: string, body?: string): Promise<PullRequestReviewResponse> =>
      fetchAPI<PullRequestReviewResponse>(`/api/v1/prs/${owner}/${repo}/${number}/approve`, {
        method: 'POST',
        body: JSON.stringify({ pullRequestId, body }),
      }),
    requestChanges: (owner: string, repo: string, number: number, pullRequestId: string, body: string): Promise<PullRequestReviewResponse> =>
      fetchAPI<PullRequestReviewResponse>(`/api/v1/prs/${owner}/${repo}/${number}/request-changes`, {
        method: 'POST',
        body: JSON.stringify({ pullRequestId, body }),
      }),
    comment: (owner: string, repo: string, number: number, pullRequestId: string, body: string): Promise<PRCommentResponse> =>
      fetchAPI<PRCommentResponse>(`/api/v1/prs/${owner}/${repo}/${number}/comment`, {
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
    ): Promise<MergePRResponse> =>
      fetchAPI<MergePRResponse>(`/api/v1/prs/${owner}/${repo}/${number}/merge`, {
        method: 'POST',
        body: JSON.stringify({ pullRequestId, ...options }),
      }),
    close: (owner: string, repo: string, number: number, pullRequestId: string): Promise<ClosePRResponse> =>
      fetchAPI<ClosePRResponse>(`/api/v1/prs/${owner}/${repo}/${number}/close`, {
        method: 'POST',
        body: JSON.stringify({ pullRequestId }),
      }),
    reopen: (owner: string, repo: string, number: number, pullRequestId: string): Promise<ReopenPRResponse> =>
      fetchAPI<ReopenPRResponse>(`/api/v1/prs/${owner}/${repo}/${number}/reopen`, {
        method: 'POST',
        body: JSON.stringify({ pullRequestId }),
      }),
  },
};

