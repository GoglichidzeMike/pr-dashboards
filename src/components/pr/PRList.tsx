'use client';

import { useMemo, useState } from 'react';
import { usePRs, PullRequest } from '@/lib/hooks/usePRs';
import { useFilter } from '@/contexts/FilterContext';
import { PRCard } from './PRCard';
import { PRDetailsModal } from './PRDetailsModal';
import { PRGroupSkeleton } from './PRGroupSkeleton';
import { getPreferences } from '@/lib/storage/preferences';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export const PRList: React.FC = () => {
  const [selectedPR, setSelectedPR] = useState<PullRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { selectedRepos, showDrafts, reviewStatus, ciStatus } = useFilter();
  const preferences = getPreferences();
  const pollInterval = preferences.pollingInterval || 60000;

  const { pullRequests, loading, error, refetch } = usePRs(selectedRepos, pollInterval);

  // Group PRs by repository and apply filters
  const groupedPRs = useMemo(() => {
    // First deduplicate by PR ID (in case same PR appears in multiple repos)
    const uniquePRs = Array.from(
      new Map(pullRequests.map((pr) => [pr.id, pr])).values()
    );
    
    let filtered = uniquePRs;

    // Filter drafts
    if (!showDrafts) {
      filtered = filtered.filter((pr) => !pr.isDraft);
    }

    // Filter by review status
    if (reviewStatus !== 'all') {
      filtered = filtered.filter((pr) => {
        const reviews = pr.reviews.nodes || [];
        const approvedReviews = reviews.filter((r) => r.state === 'APPROVED');
        const changesRequestedReviews = reviews.filter((r) => r.state === 'CHANGES_REQUESTED');
        const pendingReviews = pr.reviewRequests.nodes.length > 0;

        switch (reviewStatus) {
          case 'approved':
            return approvedReviews.length > 0 && changesRequestedReviews.length === 0;
          case 'changes_requested':
            return changesRequestedReviews.length > 0;
          case 'pending':
            return pendingReviews && approvedReviews.length === 0;
          default:
            return true;
        }
      });
    }

    // Filter by CI status
    if (ciStatus !== 'all') {
      filtered = filtered.filter((pr) => {
        const state = pr.statusCheckRollup?.state || 'PENDING';
        switch (ciStatus) {
          case 'passing':
            return state === 'SUCCESS';
          case 'failing':
            return state === 'FAILURE' || state === 'ERROR';
          case 'pending':
            return state === 'PENDING';
          default:
            return true;
        }
      });
    }

    // Group by repository
    const grouped = filtered.reduce((acc, pr) => {
      const repoKey = pr.repository.nameWithOwner;
      if (!acc[repoKey]) {
        acc[repoKey] = {
          repository: pr.repository,
          prs: [],
        };
      }
      acc[repoKey].prs.push(pr);
      return acc;
    }, {} as Record<string, { repository: PullRequest['repository']; prs: PullRequest[] }>);

    // Sort repositories alphabetically
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, value]) => value);
  }, [pullRequests, showDrafts, reviewStatus, ciStatus]);

  if (selectedRepos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <p className="text-lg font-medium mb-2">No repositories selected</p>
        <p className="text-sm text-muted-foreground">
          Select repositories from the sidebar to view pull requests
        </p>
      </div>
    );
  }

  if (loading && pullRequests.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="space-y-4">
          <PRGroupSkeleton cardCount={3} />
          <PRGroupSkeleton cardCount={2} />
          <PRGroupSkeleton cardCount={4} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <p className="text-lg font-medium text-destructive mb-2">Error loading pull requests</p>
        <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  const totalPRs = groupedPRs.reduce((sum, group) => sum + group.prs.length, 0);

  if (totalPRs === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <p className="text-lg font-medium mb-2">No pull requests found</p>
        <p className="text-sm text-muted-foreground">
          {pullRequests.length === 0
            ? 'No open pull requests in selected repositories'
            : 'No pull requests match the current filters'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">
          Pull Requests ({totalPRs})
        </h2>
        {loading && pullRequests.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Refreshing...</span>
          </div>
        )}
      </div>
      <div className="space-y-4">
        {groupedPRs.map((group) => (
          <div key={group.repository.nameWithOwner} className="space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b">
              <h3 className="text-base font-semibold">{group.repository.nameWithOwner}</h3>
              <Badge variant="secondary" className="text-xs">{group.prs.length} PR{group.prs.length !== 1 ? 's' : ''}</Badge>
            </div>
            <div className="space-y-2 pl-2">
              {group.prs.map((pr) => (
                <PRCard
                  key={pr.id}
                  pr={pr}
                  onClick={() => {
                    setSelectedPR(pr);
                    setIsModalOpen(true);
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <PRDetailsModal
        pr={selectedPR}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};

