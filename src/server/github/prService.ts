import { gql } from '@apollo/client';
import { createServerGitHubClient } from './client';

const PR_DETAILS_FRAGMENT = gql`
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

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  state: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  isDraft: boolean;
  author: {
    login: string;
    avatarUrl: string;
  };
  repository: {
    name: string;
    nameWithOwner: string;
    owner: {
      login: string;
      avatarUrl: string;
    };
  };
  reviews: {
    nodes: Array<{
      id: string;
      state: string;
      author: {
        login: string;
        avatarUrl: string;
      };
      submittedAt: string | null;
    }>;
  };
  reviewRequests: {
    nodes: Array<{
      requestedReviewer: {
        login?: string;
        avatarUrl?: string;
        name?: string;
      };
    }>;
  };
  statusCheckRollup: {
    state: string;
    contexts: {
      nodes: Array<{
        name?: string;
        conclusion?: string;
        status?: string;
        detailsUrl?: string;
        state?: string;
        context?: string;
        description?: string;
        targetUrl?: string;
      }>;
    };
  };
  labels: {
    nodes: Array<{
      id: string;
      name: string;
      color: string;
    }>;
  };
  comments: {
    totalCount: number;
  };
}

function generateBatchedPRQuery(repos: string[]) {
  if (repos.length === 0) {
    return gql`
      query GetPullRequests {
        viewer {
          login
        }
      }
    `;
  }

  const aliasedQueries = repos.map((repo) => {
    const [owner, name] = repo.split('/');
    const alias = `repo_${owner.replace(/[^a-zA-Z0-9]/g, '_')}_${name.replace(/[^a-zA-Z0-9]/g, '_')}`;
    return `
      ${alias}: repository(owner: "${owner}", name: "${name}") {
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

  return gql`
    query GetPullRequests {
      ${aliasedQueries}
    }
    ${PR_DETAILS_FRAGMENT}
  `;
}

export async function fetchPullRequests(token: string, repos: string[]): Promise<PullRequest[]> {
  if (repos.length === 0) {
    return [];
  }

  const client = createServerGitHubClient(token);
  const sortedRepos = [...repos].sort();
  const query = generateBatchedPRQuery(sortedRepos);

  const { data } = await client.query({
    query,
  });

  const prs: PullRequest[] = [];

  sortedRepos.forEach((repo) => {
    const [owner, name] = repo.split('/');
    const alias = `repo_${owner.replace(/[^a-zA-Z0-9]/g, '_')}_${name.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const repoData = (data as Record<string, any>)[alias];

    if (!repoData) {
      console.warn(`No data found for repo ${repo} at alias ${alias}`);
      return;
    }

    if (repoData.pullRequests?.nodes) {
      repoData.pullRequests.nodes.forEach((pr: any) => {
        if (pr) {
          prs.push({
            id: pr.id,
            number: pr.number,
            title: pr.title,
            state: pr.state,
            url: pr.url,
            createdAt: pr.createdAt,
            updatedAt: pr.updatedAt,
            isDraft: pr.isDraft,
            author: pr.author || { login: '', avatarUrl: '' },
            repository: pr.repository || {
              name: repo.split('/')[1],
              nameWithOwner: repo,
              owner: { login: repo.split('/')[0], avatarUrl: '' },
            },
            reviews: pr.reviews || { nodes: [] },
            reviewRequests: pr.reviewRequests || { nodes: [] },
            statusCheckRollup: pr.statusCheckRollup || {
              state: 'PENDING',
              contexts: { nodes: [] },
            },
            labels: pr.labels || { nodes: [] },
            comments: pr.comments || { totalCount: 0 },
          });
        }
      });
    }
  });

  const uniquePRs = Array.from(
    new Map(prs.map((pr) => [pr.id, pr])).values()
  );

  return uniquePRs.sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

const PR_FULL_DETAILS_FRAGMENT = gql`
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

const GET_PR_DETAILS = gql`
  query GetPRDetails($owner: String!, $name: String!, $number: Int!) {
    repository(owner: $owner, name: $name) {
      pullRequest(number: $number) {
        ...PRFullDetails
      }
    }
  }
  ${PR_FULL_DETAILS_FRAGMENT}
`;

export async function fetchPRDetails(token: string, owner: string, repo: string, number: number) {
  const client = createServerGitHubClient(token);

  const { data } = await client.query<import('@/lib/github/types').GetPrDetailsQuery>({
    query: GET_PR_DETAILS,
    variables: { owner, name: repo, number },
  });

  if (!data?.repository?.pullRequest) {
    throw new Error('Pull request not found');
  }

  return data.repository.pullRequest;
}

