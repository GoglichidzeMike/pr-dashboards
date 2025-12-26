import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  state: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  isDraft: boolean;
  author: {
    login: string;
    avatarUrl: string;
  };
  repository: {
    name: string;
    nameWithOwner: string;
    owner: {
      login: string;
      avatarUrl: string;
    };
  };
  reviews: {
    nodes: Array<{
      id: string;
      state: string;
      author: {
        login: string;
        avatarUrl: string;
      };
      submittedAt: string | null;
    }>;
  };
  reviewRequests: {
    nodes: Array<{
      requestedReviewer: {
        login?: string;
        avatarUrl?: string;
        name?: string;
      };
    }>;
  };
  statusCheckRollup: {
    state: string;
    contexts: {
      nodes: Array<{
        name?: string;
        conclusion?: string;
        status?: string;
        detailsUrl?: string;
        state?: string;
        context?: string;
        description?: string;
        targetUrl?: string;
      }>;
    };
  };
  labels: {
    nodes: Array<{
      id: string;
      name: string;
      color: string;
    }>;
  };
  comments: {
    totalCount: number;
  };
}

export function usePRs(repos: string[], pollInterval: number = 60000) {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['prs', repos.sort()],
    queryFn: () => api.prs.list(repos),
    enabled: repos.length > 0,
    refetchInterval: repos.length > 0 ? pollInterval : false,
  });

  return {
    pullRequests: data?.pullRequests || [],
    loading: isLoading || isFetching,
    error,
    refetch,
  };
}
