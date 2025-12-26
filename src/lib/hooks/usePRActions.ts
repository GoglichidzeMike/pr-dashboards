import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useCallback } from 'react';

export type PullRequestMergeMethod = 'MERGE' | 'SQUASH' | 'REBASE';

interface UsePRActionsOptions {
  pullRequestId: string;
  owner: string;
  name: string;
  number: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function usePRActions({
  pullRequestId,
  owner,
  name,
  number,
  onSuccess,
  onError,
}: UsePRActionsOptions) {
  const queryClient = useQueryClient();

  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['prs'] });
    queryClient.invalidateQueries({ queryKey: ['pr-details'] });
  }, [queryClient]);

  const approveMutation = useMutation({
    mutationFn: (body?: string) => api.prs.approve(owner, name, number, pullRequestId, body),
    onSuccess: () => {
      invalidateQueries();
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const err = error instanceof Error ? error : new Error(String(error) || 'Failed to approve PR');
      onError?.(err);
    },
  });

  const requestChangesMutation = useMutation({
    mutationFn: (body: string) => api.prs.requestChanges(owner, name, number, pullRequestId, body),
    onSuccess: () => {
      invalidateQueries();
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const err = error instanceof Error ? error : new Error(String(error) || 'Failed to request changes');
      onError?.(err);
    },
  });

  const commentMutation = useMutation({
    mutationFn: (body: string) => api.prs.comment(owner, name, number, pullRequestId, body),
    onSuccess: () => {
      invalidateQueries();
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const err = error instanceof Error ? error : new Error(String(error) || 'Failed to add comment');
      onError?.(err);
    },
  });

  const mergeMutation = useMutation({
    mutationFn: ({
      commitHeadline,
      commitBody,
      mergeMethod,
    }: {
      commitHeadline?: string;
      commitBody?: string;
      mergeMethod?: PullRequestMergeMethod;
    }) =>
      api.prs.merge(owner, name, number, pullRequestId, {
        commitHeadline,
        commitBody,
        mergeMethod,
      }),
    onSuccess: () => {
      invalidateQueries();
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const err = error instanceof Error ? error : new Error(String(error) || 'Failed to merge PR');
      onError?.(err);
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => api.prs.close(owner, name, number, pullRequestId),
    onSuccess: () => {
      invalidateQueries();
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const err = error instanceof Error ? error : new Error(String(error) || 'Failed to close PR');
      onError?.(err);
    },
  });

  const reopenMutation = useMutation({
    mutationFn: () => api.prs.reopen(owner, name, number, pullRequestId),
    onSuccess: () => {
      invalidateQueries();
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const err = error instanceof Error ? error : new Error(String(error) || 'Failed to reopen PR');
      onError?.(err);
    },
  });

  const approve = useCallback(
    async (body?: string) => {
      try {
        await approveMutation.mutateAsync(body);
      } catch (error) {
        throw error;
      }
    },
    [approveMutation]
  );

  const requestChanges = useCallback(
    async (body: string) => {
      try {
        await requestChangesMutation.mutateAsync(body);
      } catch (error) {
        throw error;
      }
    },
    [requestChangesMutation]
  );

  const comment = useCallback(
    async (body: string) => {
      try {
        await commentMutation.mutateAsync(body);
      } catch (error) {
        throw error;
      }
    },
    [commentMutation]
  );

  const merge = useCallback(
    async (mergeMethod: PullRequestMergeMethod = 'MERGE', commitHeadline?: string) => {
      try {
        await mergeMutation.mutateAsync({ mergeMethod, commitHeadline });
      } catch (error) {
        throw error;
      }
    },
    [mergeMutation]
  );

  const close = useCallback(async () => {
    try {
      await closeMutation.mutateAsync();
    } catch (error) {
      throw error;
    }
  }, [closeMutation]);

  const reopen = useCallback(async () => {
    try {
      await reopenMutation.mutateAsync();
    } catch (error) {
      throw error;
    }
  }, [reopenMutation]);

  const loading =
    approveMutation.isPending ||
    requestChangesMutation.isPending ||
    commentMutation.isPending ||
    mergeMutation.isPending ||
    closeMutation.isPending ||
    reopenMutation.isPending;

  return {
    approve,
    requestChanges,
    comment,
    merge,
    close,
    reopen,
    loading,
  };
}

