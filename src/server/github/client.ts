import { ApolloClient, InMemoryCache, createHttpLink, from, NormalizedCacheObject } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

export function createServerGitHubClient(token: string): ApolloClient<NormalizedCacheObject> {
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

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        );
      });
    }

    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
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

