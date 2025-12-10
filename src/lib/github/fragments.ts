import { gql } from '@apollo/client';

/**
 * Fragment for PR details
 * Includes all necessary information for displaying PRs in the dashboard
 */
export const PR_DETAILS_FRAGMENT = gql`
  fragment PRDetails on PullRequest {
    id
    number
    title
    state
    url
    createdAt
    updatedAt
    isDraft
    author {
      login
      avatarUrl
    }
    reviews(last: 20) {
      nodes {
        id
        state
        author {
          login
          avatarUrl
        }
        submittedAt
      }
    }
    reviewRequests(first: 10) {
      nodes {
        requestedReviewer {
          ... on User {
            login
            avatarUrl
          }
          ... on Team {
            name
          }
        }
      }
    }
    statusCheckRollup {
      state
      contexts(first: 20) {
        nodes {
          ... on CheckRun {
            name
            conclusion
            status
            detailsUrl
          }
          ... on StatusContext {
            state
            context
            description
            targetUrl
          }
        }
      }
    }
    labels(first: 10) {
      nodes {
        id
        name
        color
      }
    }
    comments {
      totalCount
    }
  }
`;

/**
 * Fragment for full PR details (used in modal)
 * Includes description, body, full comments, files, and commits
 * Note: This includes all fields from PR_DETAILS_FRAGMENT plus additional fields
 */
export const PR_FULL_DETAILS_FRAGMENT = gql`
  fragment PRFullDetails on PullRequest {
    id
    number
    title
    state
    url
    createdAt
    updatedAt
    isDraft
    body
    bodyText
    bodyHTML
    additions
    deletions
    changedFiles
    mergeable
    merged
    closed
    mergedAt
    closedAt
    headRefName
    baseRefName
    author {
      login
      avatarUrl
    }
    reviews(last: 20) {
      nodes {
        id
        state
        author {
          login
          avatarUrl
        }
        submittedAt
      }
    }
    reviewRequests(first: 10) {
      nodes {
        requestedReviewer {
          ... on User {
            login
            avatarUrl
          }
          ... on Team {
            name
          }
        }
      }
    }
    statusCheckRollup {
      state
      contexts(first: 20) {
        nodes {
          ... on CheckRun {
            name
            conclusion
            status
            detailsUrl
          }
          ... on StatusContext {
            state
            context
            description
            targetUrl
          }
        }
      }
    }
    labels(first: 10) {
      nodes {
        id
        name
        color
      }
    }
    commits(first: 10) {
      nodes {
        commit {
          oid
          messageHeadline
          message
          author {
            name
            email
            date
            user {
              login
              avatarUrl
            }
          }
          url
        }
      }
    }
    files(first: 50) {
      nodes {
        path
        additions
        deletions
        changeType
      }
    }
    comments(first: 100) {
      totalCount
      nodes {
        id
        body
        bodyText
        bodyHTML
        createdAt
        author {
          login
          avatarUrl
          ... on User {
            name
          }
          ... on Bot {
            login
          }
        }
        isMinimized
        minimizedReason
      }
    }
    timelineItems(first: 50, itemTypes: [PULL_REQUEST_COMMIT, PULL_REQUEST_REVIEW, ISSUE_COMMENT, LABELED_EVENT, UNLABELED_EVENT, CLOSED_EVENT, MERGED_EVENT]) {
      nodes {
        __typename
        ... on PullRequestCommit {
          commit {
            oid
            messageHeadline
            author {
              name
              date
              user {
                login
                avatarUrl
              }
            }
            url
          }
        }
        ... on PullRequestReview {
          id
          state
          body
          createdAt
          author {
            login
            avatarUrl
          }
        }
        ... on IssueComment {
          id
          body
          createdAt
          author {
            login
            avatarUrl
          }
        }
        ... on LabeledEvent {
          createdAt
          label {
            name
            color
          }
        }
        ... on UnlabeledEvent {
          createdAt
          label {
            name
            color
          }
        }
        ... on ClosedEvent {
          createdAt
          actor {
            login
            avatarUrl
          }
        }
        ... on MergedEvent {
          createdAt
          actor {
            login
            avatarUrl
          }
        }
      }
    }
  }
`;

/**
 * Fragment for repository basic info
 */
export const REPOSITORY_BASIC_FRAGMENT = gql`
  fragment RepositoryBasic on Repository {
    id
    name
    nameWithOwner
    owner {
      login
      avatarUrl
      ... on User {
        id
      }
      ... on Organization {
        id
      }
    }
    isPrivate
    url
  }
`;

