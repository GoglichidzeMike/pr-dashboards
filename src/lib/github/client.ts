import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { getToken } from '@/lib/storage/token';

const httpLink = createHttpLink({
  uri: 'https://api.github.com/graphql',
});

// Auth link to inject token into headers
const authLink = setContext((_, { headers }) => {
  const token = getToken();
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'User-Agent': 'GitHub-PR-Dashboard',
    },
  };
});

// Retry link for network errors
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: Infinity,
    jitter: true,
  },
  attempts: {
    max: 3,
    retryIf: (error, _operation) => {
      // Retry on network errors, but not on authentication errors
      if (error && 'statusCode' in error) {
        return error.statusCode !== 401 && error.statusCode !== 403;
      }
      return !!error;
    },
  },
});

// Error handling link
const errorLink = onError((error: any) => {
  if (error.graphQLErrors) {
    error.graphQLErrors.forEach((err: any) => {
      const message = err.message || '';
      const locations = err.locations;
      const path = err.path;
      const extensions = err.extensions;
      
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      
      // Handle authentication errors
      if (extensions?.type === 'UNAUTHENTICATED' || message.includes('Bad credentials')) {
        // Clear token and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('github_token');
          window.location.href = '/login';
        }
      }
    });
  }

  if (error.networkError) {
    const networkError = error.networkError;
    console.error(`[Network error]: ${networkError}`);
    
    // Handle 401 Unauthorized
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('github_token');
        window.location.href = '/login';
      }
    }
  }
});

// Create Apollo Client instance
export const apolloClient = new ApolloClient({
  link: from([errorLink, retryLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      // Removed repository merge policy to prevent cache conflicts with aliased queries
      // Using network-only fetch policy in usePRs ensures fresh data
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
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
  },
});

