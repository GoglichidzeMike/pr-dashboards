import { gql } from '@apollo/client';
import { PR_DETAILS_FRAGMENT, PR_FULL_DETAILS_FRAGMENT, REPOSITORY_BASIC_FRAGMENT } from './fragments';

/**
 * Query to get the current viewer's login
 */
export const GET_VIEWER = gql`
  query GetViewer {
    viewer {
      login
      avatarUrl
    }
  }
`;

/**
 * Query to get repositories for the current user
 * Includes both personal repos and organization repos
 */
export const GET_REPOSITORIES = gql`
  query GetRepositories {
    viewer {
      login
      repositories(
        first: 100
        affiliations: [OWNER, ORGANIZATION_MEMBER]
        orderBy: { field: UPDATED_AT, direction: DESC }
      ) {
        nodes {
          ...RepositoryBasic
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
      organizations(first: 50) {
        nodes {
          login
          avatarUrl
          repositories(first: 100, orderBy: { field: UPDATED_AT, direction: DESC }) {
            nodes {
              ...RepositoryBasic
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    }
  }
  ${REPOSITORY_BASIC_FRAGMENT}
`;

/**
 * Helper function to generate batched PR queries using GraphQL aliases
 * This allows fetching PRs from multiple repositories in a single query
 * 
 * @param repos Array of repository identifiers in format "owner/name"
 * @returns GraphQL query string with aliases for each repo
 */
export function generateBatchedPRQuery(repos: string[]): string {
  const aliasedQueries = repos.map((repo, idx) => {
    const [owner, name] = repo.split('/');
    return `
      repo_${idx}: repository(owner: "${owner}", name: "${name}") {
        pullRequests(
          states: OPEN
          first: 100
          orderBy: { field: UPDATED_AT, direction: DESC }
        ) {
          nodes {
            ...PRDetails
            repository {
              name
              nameWithOwner
              owner {
                login
                avatarUrl
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;
  }).join('\n');

  return `
    query GetPullRequests {
      ${aliasedQueries}
    }
  `;
}

/**
 * GraphQL query document for fetching PRs from multiple repositories
 * This uses the generateBatchedPRQuery function to create the query dynamically
 * 
 * Note: For static queries, use the generated query from codegen.
 * For dynamic queries with variable repo lists, use generateBatchedPRQuery
 */
export const GET_PRS_FOR_REPOS = gql`
  query GetPullRequests($repos: [String!]!) {
    viewer {
      login
    }
  }
  ${PR_DETAILS_FRAGMENT}
`;

/**
 * Query to get PRs for a single repository
 */
export const GET_PRS_FOR_REPO = gql`
  query GetPullRequestsForRepo($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      pullRequests(
        states: OPEN
        first: 100
        orderBy: { field: UPDATED_AT, direction: DESC }
      ) {
        nodes {
          ...PRDetails
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
  ${PR_DETAILS_FRAGMENT}
`;

/**
 * Query to get full details for a specific PR
 */
export const GET_PR_DETAILS = gql`
  query GetPRDetails($owner: String!, $name: String!, $number: Int!) {
    repository(owner: $owner, name: $name) {
      pullRequest(number: $number) {
        ...PRFullDetails
      }
    }
  }
  ${PR_FULL_DETAILS_FRAGMENT}
`;

