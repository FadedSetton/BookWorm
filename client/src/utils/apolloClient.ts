import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Adjust based on environment
const httpLink = createHttpLink({
  uri: import.meta.env.PROD
    ? '/graphql' // proxy to same origin in production
    : 'http://localhost:3001/graphql', // local dev
});

// Attach JWT token if logged in
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('id_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
