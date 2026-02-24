import { GraphQLClient } from 'graphql-request';

function getEndpoint() {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/graphql-proxy`;
  }
  return process.env.INTERNAL_GRAPHQL_PROXY_URL || 'http://localhost:3000/api/graphql-proxy';
}

const graphqlClient = new GraphQLClient(getEndpoint(), {
  headers: {
    'Content-Type': 'application/json',
  },
});

export default graphqlClient;
