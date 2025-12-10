import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useMemo } from 'react';
import { PR_DETAILS_FRAGMENT } from '@/lib/github/fragments';

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

/**
 * Generate batched PR query using GraphQL aliases
 */
function generateBatchedPRQuery(repos: string[]): ReturnType<typeof gql> {
  if (repos.length === 0) {
    return gql`
      query GetPullRequests {
        viewer {
          login
        }
      }
    `;
  }

  const aliasedQueries = repos.map((repo) => {
    const [owner, name] = repo.split('/');
    // Use repo name in alias to make each query unique (sanitize for GraphQL)
    const alias = `repo_${owner.replace(/[^a-zA-Z0-9]/g, '_')}_${name.replace(/[^a-zA-Z0-9]/g, '_')}`;
    return `
      ${alias}: repository(owner: "${owner}", name: "${name}") {
        pullRequests(
          states: OPEN
          first: 100
          orderBy: { field: UPDATED_AT, direction: DESC }
        ) {
          nodes {
            ...PRDetails
            repository {
              name
              nameWithOwner
              owner {
                login
                avatarUrl
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;
  }).join('\n');

  return gql`
    query GetPullRequests {
      ${aliasedQueries}
    }
    ${PR_DETAILS_FRAGMENT}
  `;
}

/**
 * Hook to fetch pull requests for selected repositories
 * Uses batched queries with GraphQL aliases to fetch multiple repos in parallel
 * 
 * @param repos Array of repository identifiers in format "owner/name"
 * @param pollInterval Polling interval in milliseconds (default: 60000 = 1 minute)
 */
export function usePRs(repos: string[], pollInterval: number = 60000) {
  // Sort repos to ensure consistent query generation
  const sortedRepos = useMemo(() => [...repos].sort(), [repos]);
  
  // Generate dynamic query based on repos
  const query = useMemo(() => generateBatchedPRQuery(sortedRepos), [sortedRepos]);

  const { data, loading, error, refetch } = useQuery(query, {
    skip: sortedRepos.length === 0,
    pollInterval: sortedRepos.length > 0 ? pollInterval : 0,
    notifyOnNetworkStatusChange: true,
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'network-only', // Always fetch fresh data on subsequent calls
  });

  // Transform data to extract PRs from aliased results
  const pullRequests = useMemo(() => {
    if (!data || sortedRepos.length === 0) {
      return [];
    }

    const prs: PullRequest[] = [];

    // Extract PRs from each aliased repo result
    sortedRepos.forEach((repo) => {
      // Generate the same alias used in query generation
      const [owner, name] = repo.split('/');
      const alias = `repo_${owner.replace(/[^a-zA-Z0-9]/g, '_')}_${name.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const repoData = (data as Record<string, any>)[alias];

      if (!repoData) {
        console.warn(`No data found for repo ${repo} at alias ${alias}`);
        return;
      }

      if (repoData.pullRequests?.nodes) {
        repoData.pullRequests.nodes.forEach((pr: any) => {
          if (pr) {
            prs.push({
              id: pr.id,
              number: pr.number,
              title: pr.title,
              state: pr.state,
              url: pr.url,
              createdAt: pr.createdAt,
              updatedAt: pr.updatedAt,
              isDraft: pr.isDraft,
              author: pr.author || { login: '', avatarUrl: '' },
              repository: pr.repository || {
                name: repo.split('/')[1],
                nameWithOwner: repo,
                owner: { login: repo.split('/')[0], avatarUrl: '' },
              },
              reviews: pr.reviews || { nodes: [] },
              reviewRequests: pr.reviewRequests || { nodes: [] },
              statusCheckRollup: pr.statusCheckRollup || {
                state: 'PENDING',
                contexts: { nodes: [] },
              },
              labels: pr.labels || { nodes: [] },
              comments: pr.comments || { totalCount: 0 },
            });
          }
        });
      } else {
        console.warn(`No pullRequests.nodes found for repo ${repo} at alias ${alias}`, repoData);
      }
    });

    // Deduplicate by PR ID (in case same PR appears multiple times)
    const uniquePRs = Array.from(
      new Map(prs.map((pr) => [pr.id, pr])).values()
    );

    // Sort by updatedAt (most recent first)
    return uniquePRs.sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [data, sortedRepos]);

  return {
    pullRequests,
    loading,
    error,
    refetch,
  };
}

