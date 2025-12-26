import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';
import { GET_REPOSITORIES } from '@/lib/github/queries';
import { GetRepositoriesQuery } from '@/lib/github/types';
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

/**
 * Hook to fetch and manage repositories
 * Groups repositories by organization and includes personal repos
 */
export function useRepos() {
  const { data, loading, error, refetch } = useQuery<GetRepositoriesQuery>(GET_REPOSITORIES, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  // Get selected repos from localStorage
  const selectedRepos = getSelectedRepos();

  // Transform and group repositories
  const { personalRepos, organizations, allRepos } = useMemo(() => {
    if (!data?.viewer) {
      return {
        personalRepos: [],
        organizations: [],
        allRepos: [],
      };
    }

    const personal: Repository[] =
      data.viewer.repositories?.nodes
        ?.filter((repo): repo is NonNullable<typeof repo> => repo !== null)
        .map((repo) => ({
          id: repo.id,
          name: repo.name,
          nameWithOwner: repo.nameWithOwner,
          owner: {
            login: repo.owner.login,
            avatarUrl: repo.owner.avatarUrl || '',
          },
          isPrivate: repo.isPrivate,
          url: repo.url,
        })) || [];

    const orgs: Organization[] =
      data.viewer.organizations?.nodes
        ?.filter((org): org is NonNullable<typeof org> => org !== null)
        .map((org) => ({
          login: org.login,
          avatarUrl: org.avatarUrl || '',
          repositories:
            org.repositories?.nodes
              ?.filter((repo): repo is NonNullable<typeof repo> => repo !== null)
              .map((repo) => ({
                id: repo.id,
                name: repo.name,
                nameWithOwner: repo.nameWithOwner,
                owner: {
                  login: repo.owner.login,
                  avatarUrl: repo.owner.avatarUrl || '',
                },
                isPrivate: repo.isPrivate,
                url: repo.url,
              })) || [],
        })) || [];

    // Flatten all repos for easy access and deduplicate by nameWithOwner
    const allReposArray = [
      ...personal,
      ...orgs.flatMap((org) => org.repositories),
    ];
    
    // Deduplicate by nameWithOwner (same repo can appear in personal and org lists)
    const all: Repository[] = Array.from(
      new Map(allReposArray.map((repo) => [repo.nameWithOwner, repo])).values()
    );

    return {
      personalRepos: personal,
      organizations: orgs,
      allRepos: all,
    };
  }, [data]);

  // Check if a repo is selected
  const isRepoSelected = (repoName: string) => {
    return selectedRepos.includes(repoName);
  };

  // Get viewer login for determining personal repos
  const viewerLogin = data?.viewer?.login || '';

  return {
    personalRepos,
    organizations,
    allRepos,
    selectedRepos,
    isRepoSelected,
    loading,
    error,
    refetch,
    viewer: data?.viewer,
    viewerLogin,
  };
}

