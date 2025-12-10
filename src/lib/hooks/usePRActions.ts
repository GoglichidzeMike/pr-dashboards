'use client';

import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';
import {
  SUBMIT_PR_REVIEW,
  ADD_PR_COMMENT,
  MERGE_PR,
  CLOSE_PR,
  REOPEN_PR,
  ADD_LABELS_TO_PR,
  REMOVE_LABELS_FROM_PR,
  REQUEST_REVIEWERS,
} from '@/lib/github/mutations';
import { GET_PR_DETAILS } from '@/lib/github/queries';
import { PR_DETAILS_FRAGMENT } from '@/lib/github/fragments';

export type PullRequestReviewEvent = 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT';
export type PullRequestMergeMethod = 'MERGE' | 'SQUASH' | 'REBASE';

interface UsePRActionsOptions {
  pullRequestId: string;
  owner: string;
  name: string;
  number: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const usePRActions = ({
  pullRequestId,
  owner,
  name,
  number,
  onSuccess,
  onError,
}: UsePRActionsOptions) => {
  const [submitReview, { loading: submittingReview }] = useMutation(SUBMIT_PR_REVIEW, {
    refetchQueries: [
      { query: GET_PR_DETAILS, variables: { owner, name, number } },
    ],
    awaitRefetchQueries: true,
  });

  const [addComment, { loading: addingComment }] = useMutation(ADD_PR_COMMENT, {
    refetchQueries: [
      { query: GET_PR_DETAILS, variables: { owner, name, number } },
    ],
    awaitRefetchQueries: true,
  });

  const [mergePR, { loading: merging }] = useMutation(MERGE_PR, {
    refetchQueries: [
      { query: GET_PR_DETAILS, variables: { owner, name, number } },
    ],
    awaitRefetchQueries: true,
  });

  const [closePR, { loading: closing }] = useMutation(CLOSE_PR, {
    refetchQueries: [
      { query: GET_PR_DETAILS, variables: { owner, name, number } },
    ],
    awaitRefetchQueries: true,
  });

  const [reopenPR, { loading: reopening }] = useMutation(REOPEN_PR, {
    refetchQueries: [
      { query: GET_PR_DETAILS, variables: { owner, name, number } },
    ],
    awaitRefetchQueries: true,
  });

  const [addLabels, { loading: addingLabels }] = useMutation(ADD_LABELS_TO_PR, {
    refetchQueries: [
      { query: GET_PR_DETAILS, variables: { owner, name, number } },
    ],
    awaitRefetchQueries: true,
  });

  const [removeLabels, { loading: removingLabels }] = useMutation(REMOVE_LABELS_FROM_PR, {
    refetchQueries: [
      { query: GET_PR_DETAILS, variables: { owner, name, number } },
    ],
    awaitRefetchQueries: true,
  });

  const [requestReviewers, { loading: requestingReviewers }] = useMutation(REQUEST_REVIEWERS, {
    refetchQueries: [
      { query: GET_PR_DETAILS, variables: { owner, name, number } },
    ],
    awaitRefetchQueries: true,
  });

  const handleApprove = useCallback(
    async (body?: string) => {
      try {
        await submitReview({
          variables: {
            pullRequestId,
            event: 'APPROVE' as PullRequestReviewEvent,
            body: body || null,
          },
        });
        onSuccess?.();
      } catch (error) {
        onError?.(error as Error);
        throw error;
      }
    },
    [pullRequestId, submitReview, onSuccess, onError]
  );

  const handleRequestChanges = useCallback(
    async (body: string) => {
      try {
        await submitReview({
          variables: {
            pullRequestId,
            event: 'REQUEST_CHANGES' as PullRequestReviewEvent,
            body,
          },
        });
        onSuccess?.();
      } catch (error) {
        onError?.(error as Error);
        throw error;
      }
    },
    [pullRequestId, submitReview, onSuccess, onError]
  );

  const handleComment = useCallback(
    async (body: string) => {
      try {
        await addComment({
          variables: {
            subjectId: pullRequestId,
            body,
          },
        });
        onSuccess?.();
      } catch (error) {
        onError?.(error as Error);
        throw error;
      }
    },
    [pullRequestId, addComment, onSuccess, onError]
  );

  const handleMerge = useCallback(
    async (method: PullRequestMergeMethod = 'MERGE', commitHeadline?: string) => {
      try {
        await mergePR({
          variables: {
            pullRequestId,
            mergeMethod: method,
            commitHeadline: commitHeadline || null,
          },
        });
        onSuccess?.();
      } catch (error) {
        onError?.(error as Error);
        throw error;
      }
    },
    [pullRequestId, mergePR, onSuccess, onError]
  );

  const handleClose = useCallback(async () => {
    try {
      await closePR({
        variables: {
          pullRequestId,
        },
      });
      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  }, [pullRequestId, closePR, onSuccess, onError]);

  const handleReopen = useCallback(async () => {
    try {
      await reopenPR({
        variables: {
          pullRequestId,
        },
      });
      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  }, [pullRequestId, reopenPR, onSuccess, onError]);

  const handleAddLabels = useCallback(
    async (labelIds: string[]) => {
      try {
        await addLabels({
          variables: {
            labelableId: pullRequestId,
            labelIds,
          },
        });
        onSuccess?.();
      } catch (error) {
        onError?.(error as Error);
        throw error;
      }
    },
    [pullRequestId, addLabels, onSuccess, onError]
  );

  const handleRemoveLabels = useCallback(
    async (labelIds: string[]) => {
      try {
        await removeLabels({
          variables: {
            labelableId: pullRequestId,
            labelIds,
          },
        });
        onSuccess?.();
      } catch (error) {
        onError?.(error as Error);
        throw error;
      }
    },
    [pullRequestId, removeLabels, onSuccess, onError]
  );

  const handleRequestReviewers = useCallback(
    async (userIds: string[]) => {
      try {
        await requestReviewers({
          variables: {
            pullRequestId,
            userIds,
          },
        });
        onSuccess?.();
      } catch (error) {
        onError?.(error as Error);
        throw error;
      }
    },
    [pullRequestId, requestReviewers, onSuccess, onError]
  );

  return {
    approve: handleApprove,
    requestChanges: handleRequestChanges,
    comment: handleComment,
    merge: handleMerge,
    close: handleClose,
    reopen: handleReopen,
    addLabels: handleAddLabels,
    removeLabels: handleRemoveLabels,
    requestReviewers: handleRequestReviewers,
    loading:
      submittingReview ||
      addingComment ||
      merging ||
      closing ||
      reopening ||
      addingLabels ||
      removingLabels ||
      requestingReviewers,
  };
};

