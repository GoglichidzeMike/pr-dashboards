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

