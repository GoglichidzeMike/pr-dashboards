import { gql } from '@apollo/client';
import { createServerGitHubClient } from './client';

const GET_REPOSITORIES = gql`
  query GetRepositories {
    viewer {
      login
      repositories(first: 100, orderBy: { field: UPDATED_AT, direction: DESC }, affiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER]) {
        nodes {
          id
          name
          nameWithOwner
          owner {
            login
            avatarUrl
          }
          isPrivate
          url
        }
      }
      organizations(first: 50) {
        nodes {
          login
          avatarUrl
          repositories(first: 100, orderBy: { field: UPDATED_AT, direction: DESC }) {
            nodes {
              id
              name
              nameWithOwner
              owner {
                login
                avatarUrl
              }
              isPrivate
              url
            }
          }
        }
      }
    }
  }
`;

export interface Repository {
  id: string;
  name: string;
  nameWithOwner: string;
  owner: {
    login: string;
    avatarUrl: string;
  };
  isPrivate: boolean;
  url: string;
}

export interface Organization {
  login: string;
  avatarUrl: string;
  repositories: Repository[];
}

export interface ReposResponse {
  personalRepos: Repository[];
  organizations: Organization[];
  allRepos: Repository[];
  viewerLogin: string;
}

export async function fetchRepositories(token: string): Promise<ReposResponse> {
  const client = createServerGitHubClient(token);

  const { data } = await client.query({
    query: GET_REPOSITORIES,
  });

  const personalRepos: Repository[] =
    data.viewer.repositories?.nodes
      ?.filter((repo: any): repo is NonNullable<typeof repo> => repo !== null)
      .map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        nameWithOwner: repo.nameWithOwner,
        owner: {
          login: repo.owner.login,
          avatarUrl: repo.owner.avatarUrl || '',
        },
        isPrivate: repo.isPrivate,
        url: repo.url,
      })) || [];

  const organizations: Organization[] =
    data.viewer.organizations?.nodes
      ?.filter((org: any): org is NonNullable<typeof org> => org !== null)
      .map((org: any) => ({
        login: org.login,
        avatarUrl: org.avatarUrl || '',
        repositories:
          org.repositories?.nodes
            ?.filter((repo: any): repo is NonNullable<typeof repo> => repo !== null)
            .map((repo: any) => ({
              id: repo.id,
              name: repo.name,
              nameWithOwner: repo.nameWithOwner,
              owner: {
                login: repo.owner.login,
                avatarUrl: repo.owner.avatarUrl || '',
              },
              isPrivate: repo.isPrivate,
              url: repo.url,
            })) || [],
      })) || [];

  const allReposArray = [
    ...personalRepos,
    ...organizations.flatMap((org) => org.repositories),
  ];

  const allRepos: Repository[] = Array.from(
    new Map(allReposArray.map((repo) => [repo.nameWithOwner, repo])).values()
  );

  return {
    personalRepos,
    organizations,
    allRepos,
    viewerLogin: data.viewer.login,
  };
}

