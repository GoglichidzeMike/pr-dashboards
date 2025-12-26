import { gql } from '@apollo/client';
import { createServerGitHubClient } from './client';

const APPROVE_PR_MUTATION = gql`
  mutation ApprovePR($pullRequestId: ID!, $body: String) {
    addPullRequestReview(input: { pullRequestId: $pullRequestId, event: APPROVE, body: $body }) {
      pullRequestReview {
        id
        state
      }
    }
  }
`;

const REQUEST_CHANGES_MUTATION = gql`
  mutation RequestChanges($pullRequestId: ID!, $body: String!) {
    addPullRequestReview(input: { pullRequestId: $pullRequestId, event: REQUEST_CHANGES, body: $body }) {
      pullRequestReview {
        id
        state
      }
    }
  }
`;

const MERGE_PR_MUTATION = gql`
  mutation MergePR($pullRequestId: ID!, $commitHeadline: String, $commitBody: String, $mergeMethod: PullRequestMergeMethod) {
    mergePullRequest(input: { pullRequestId: $pullRequestId, commitHeadline: $commitHeadline, commitBody: $commitBody, mergeMethod: $mergeMethod }) {
      pullRequest {
        id
        merged
        mergedAt
      }
    }
  }
`;

const ADD_COMMENT_MUTATION = gql`
  mutation AddComment($subjectId: ID!, $body: String!) {
    addComment(input: { subjectId: $subjectId, body: $body }) {
      commentEdge {
        node {
          id
          body
          bodyHTML
          createdAt
          author {
            login
            avatarUrl
          }
        }
      }
    }
  }
`;

const CLOSE_PR_MUTATION = gql`
  mutation ClosePR($pullRequestId: ID!) {
    closePullRequest(input: { pullRequestId: $pullRequestId }) {
      pullRequest {
        id
        closed
        closedAt
        state
      }
    }
  }
`;

const REOPEN_PR_MUTATION = gql`
  mutation ReopenPR($pullRequestId: ID!) {
    reopenPullRequest(input: { pullRequestId: $pullRequestId }) {
      pullRequest {
        id
        closed
        state
      }
    }
  }
`;

export async function approvePR(token: string, pullRequestId: string, body?: string) {
  const client = createServerGitHubClient(token);

  const { data } = await client.mutate({
    mutation: APPROVE_PR_MUTATION,
    variables: { pullRequestId, body },
  });

  return data.addPullRequestReview.pullRequestReview;
}

export async function requestChanges(token: string, pullRequestId: string, body: string) {
  const client = createServerGitHubClient(token);

  const { data } = await client.mutate({
    mutation: REQUEST_CHANGES_MUTATION,
    variables: { pullRequestId, body },
  });

  return data.addPullRequestReview.pullRequestReview;
}

export async function addPRComment(token: string, pullRequestId: string, body: string) {
  const client = createServerGitHubClient(token);

  const { data } = await client.mutate({
    mutation: ADD_COMMENT_MUTATION,
    variables: { subjectId: pullRequestId, body },
  });

  return data.addComment.commentEdge.node;
}

export async function mergePR(
  token: string,
  pullRequestId: string,
  commitHeadline?: string,
  commitBody?: string,
  mergeMethod: 'MERGE' | 'SQUASH' | 'REBASE' = 'MERGE'
) {
  const client = createServerGitHubClient(token);

  const { data } = await client.mutate({
    mutation: MERGE_PR_MUTATION,
    variables: { pullRequestId, commitHeadline, commitBody, mergeMethod },
  });

  return data.mergePullRequest.pullRequest;
}

export async function closePR(token: string, pullRequestId: string) {
  const client = createServerGitHubClient(token);

  const { data } = await client.mutate({
    mutation: CLOSE_PR_MUTATION,
    variables: { pullRequestId },
  });

  return data.closePullRequest.pullRequest;
}

export async function reopenPR(token: string, pullRequestId: string) {
  const client = createServerGitHubClient(token);

  const { data } = await client.mutate({
    mutation: REOPEN_PR_MUTATION,
    variables: { pullRequestId },
  });

  return data.reopenPullRequest.pullRequest;
}

