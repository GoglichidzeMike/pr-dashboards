import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export type { PRDetails, PRDetailsTimelineItem } from './usePRDetails.old';

export function usePRDetails(owner: string, repo: string, number: number, enabled: boolean = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['pr-details', owner, repo, number],
    queryFn: () => api.prs.get(owner, repo, number),
    enabled,
  });

  return {
    pr: data,
    loading: isLoading,
    error,
    refetch,
  };
}
