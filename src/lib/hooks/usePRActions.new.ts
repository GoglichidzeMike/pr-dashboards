import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';

export function usePRActions() {
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: ({
      owner,
      repo,
      number,
      pullRequestId,
      body,
    }: {
      owner: string;
      repo: string;
      number: number;
      pullRequestId: string;
      body?: string;
    }) => api.prs.approve(owner, repo, number, pullRequestId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prs'] });
      queryClient.invalidateQueries({ queryKey: ['pr-details'] });
      toast.success('PR approved successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve PR');
    },
  });

  const mergeMutation = useMutation({
    mutationFn: ({
      owner,
      repo,
      number,
      pullRequestId,
      commitHeadline,
      commitBody,
      mergeMethod,
    }: {
      owner: string;
      repo: string;
      number: number;
      pullRequestId: string;
      commitHeadline?: string;
      commitBody?: string;
      mergeMethod?: 'MERGE' | 'SQUASH' | 'REBASE';
    }) =>
      api.prs.merge(owner, repo, number, pullRequestId, {
        commitHeadline,
        commitBody,
        mergeMethod,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prs'] });
      queryClient.invalidateQueries({ queryKey: ['pr-details'] });
      toast.success('PR merged successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to merge PR');
    },
  });

  return {
    approvePR: approveMutation.mutate,
    mergePR: mergeMutation.mutate,
    isApproving: approveMutation.isPending,
    isMerging: mergeMutation.isPending,
  };
}

