import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

export function createServerGitHubClient(token: string) {
  const httpLink = createHttpLink({
    uri: 'https://api.github.com/graphql',
    fetch,
  });

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
        'User-Agent': 'GitHub-PR-Dashboard',
      },
    };
  });

  const errorLink = onError((error: any) => {
    if (error.graphQLErrors) {
      error.graphQLErrors.forEach((err: any) => {
        console.error(
          `[GraphQL error]: Message: ${err.message}, Location: ${err.locations}, Path: ${err.path}`
        );
      });
    }

    if (error.networkError) {
      console.error(`[Network error]: ${error.networkError}`);
    }
  });

  return new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        PullRequest: {
          keyFields: ['id'],
        },
        Repository: {
          keyFields: false,
        },
        User: {
          keyFields: ['login'],
        },
        Organization: {
          keyFields: ['login'],
        },
      },
    }),
    defaultOptions: {
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
    },
  });
}

