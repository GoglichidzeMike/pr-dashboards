import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { getSelectedRepos } from '@/lib/storage/preferences';

export interface Repository {
  id: string;
  name: string;
  nameWithOwner: string;
  owner: {
    login: string;
    avatarUrl: string;
  };
  isPrivate: boolean;
  url: string;
}

export interface Organization {
  login: string;
  avatarUrl: string;
  repositories: Repository[];
}

export function useRepos() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['repos'],
    queryFn: () => api.repos.list(),
  });

  const selectedRepos = getSelectedRepos();

  const isRepoSelected = (repoName: string) => {
    return selectedRepos.includes(repoName);
  };

  return {
    personalRepos: data?.personalRepos || [],
    organizations: data?.organizations || [],
    allRepos: data?.allRepos || [],
    selectedRepos,
    isRepoSelected,
    loading: isLoading,
    error,
    refetch,
    viewer: null,
    viewerLogin: data?.viewerLogin || '',
  };
}

