import { gql } from '@apollo/client';

/**
 * Mutation to submit a PR review (approve, request changes, or comment)
 */
export const SUBMIT_PR_REVIEW = gql`
  mutation SubmitPRReview(
    $pullRequestId: ID!
    $event: PullRequestReviewEvent!
    $body: String
  ) {
    submitPullRequestReview(
      input: {
        pullRequestId: $pullRequestId
        event: $event
        body: $body
      }
    ) {
      pullRequestReview {
        id
        state
        body
        author {
          login
          avatarUrl
        }
      }
    }
  }
`;

/**
 * Mutation to add a comment to a PR
 */
export const ADD_PR_COMMENT = gql`
  mutation AddPRComment($subjectId: ID!, $body: String!) {
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

/**
 * Mutation to merge a PR
 */
export const MERGE_PR = gql`
  mutation MergePR(
    $pullRequestId: ID!
    $mergeMethod: PullRequestMergeMethod!
    $commitHeadline: String
  ) {
    mergePullRequest(
      input: {
        pullRequestId: $pullRequestId
        mergeMethod: $mergeMethod
        commitHeadline: $commitHeadline
      }
    ) {
      pullRequest {
        id
        merged
        mergedAt
        state
      }
    }
  }
`;

/**
 * Mutation to close a PR
 */
export const CLOSE_PR = gql`
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

/**
 * Mutation to reopen a PR
 */
export const REOPEN_PR = gql`
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

/**
 * Mutation to add labels to a PR
 */
export const ADD_LABELS_TO_PR = gql`
  mutation AddLabelsToPR($labelableId: ID!, $labelIds: [ID!]!) {
    addLabelsToLabelable(input: { labelableId: $labelableId, labelIds: $labelIds }) {
      labelable {
        ... on PullRequest {
          id
          labels(first: 10) {
            nodes {
              id
              name
              color
            }
          }
        }
      }
    }
  }
`;

/**
 * Mutation to remove labels from a PR
 */
export const REMOVE_LABELS_FROM_PR = gql`
  mutation RemoveLabelsFromPR($labelableId: ID!, $labelIds: [ID!]!) {
    removeLabelsFromLabelable(input: { labelableId: $labelableId, labelIds: $labelIds }) {
      labelable {
        ... on PullRequest {
          id
          labels(first: 10) {
            nodes {
              id
              name
              color
            }
          }
        }
      }
    }
  }
`;

/**
 * Mutation to request reviewers for a PR
 */
export const REQUEST_REVIEWERS = gql`
  mutation RequestReviewers($pullRequestId: ID!, $userIds: [ID!]) {
    requestReviews(input: { pullRequestId: $pullRequestId, userIds: $userIds }) {
      pullRequest {
        id
        reviewRequests(first: 10) {
          nodes {
            requestedReviewer {
              ... on User {
                login
                avatarUrl
              }
            }
          }
        }
      }
    }
  }
`;

