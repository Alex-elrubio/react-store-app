import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import {GRAPHQL_URL} from '../config';

const httpLink = new HttpLink({ uri: GRAPHQL_URL });
const authLink = setContext(async (_, { headers }) => {
  const token = localStorage.authToken;

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const errorLink = onError(({ operation, graphQLErrors }) => {
  console.warn(
    `Query: ${operation.operationName}, graphQLErrors: "${JSON.stringify(
      graphQLErrors,
    )}".`,
  );
});

const client = new ApolloClient({
  link: errorLink.concat(authLink).concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
