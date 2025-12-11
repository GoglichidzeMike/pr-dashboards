'use client';

import { useQuery } from '@apollo/client/react';
import { GET_PR_DETAILS } from '@/lib/github/queries';
import { GetPrDetailsQuery } from '@/lib/github/types';

export interface PRDetailsComment {
  id: string;
  body: string;
  bodyText: string;
  bodyHTML: string;
  createdAt: string;
  author: {
    login: string;
    avatarUrl: string;
    name?: string;
  };
  isMinimized: boolean;
  minimizedReason?: string;
}

export interface PRDetailsFile {
  path: string;
  additions: number;
  deletions: number;
  changeType: string;
}

export interface PRDetailsCommit {
  commit: {
    oid: string;
    messageHeadline: string;
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
      user?: {
        login: string;
        avatarUrl: string;
      };
    };
    url: string;
  };
}

export interface PRDetailsTimelineItem {
  __typename: string;
  commit?: {
    oid: string;
    messageHeadline: string;
    author: {
      name: string;
      date: string;
      user?: {
        login: string;
        avatarUrl: string;
      };
    };
    url: string;
  };
  state?: string;
  body?: string;
  createdAt?: string;
  author?: {
    login: string;
    avatarUrl: string;
  };
  label?: {
    name: string;
    color: string;
  };
  actor?: {
    login: string;
    avatarUrl: string;
  };
}

export interface PRDetails {
  id: string;
  number: number;
  title: string;
  state: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  isDraft: boolean;
  body: string;
  bodyText: string;
  bodyHTML: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  mergeable: string;
  merged: boolean;
  closed: boolean;
  mergedAt?: string | null;
  closedAt?: string | null;
  headRefName: string;
  baseRefName: string;
  author: {
    login: string;
    avatarUrl: string;
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
  commits: {
    nodes: PRDetailsCommit[];
  };
  files: {
    nodes: PRDetailsFile[];
  };
  comments: {
    nodes: PRDetailsComment[];
    totalCount: number;
  };
  timelineItems: {
    nodes: PRDetailsTimelineItem[];
  };
}

interface UsePRDetailsResult {
  pr: PRDetails | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch full details for a specific PR
 * 
 * @param owner Repository owner
 * @param name Repository name
 * @param number PR number
 */
export const usePRDetails = (
  owner: string | null,
  name: string | null,
  number: number | null
): UsePRDetailsResult => {
  const { data, loading, error, refetch } = useQuery<GetPrDetailsQuery>(GET_PR_DETAILS, {
    variables: {
      owner: owner || '',
      name: name || '',
      number: number || 0,
    },
    skip: !owner || !name || !number,
    fetchPolicy: 'cache-and-network',
  });

  const handleRefetch = async () => {
    if (owner && name && number) {
      await refetch();
    }
  };

  return {
    pr: (data?.repository?.pullRequest as PRDetails | null | undefined) || null,
    loading,
    error: error as Error | null,
    refetch: handleRefetch,
  };
};

