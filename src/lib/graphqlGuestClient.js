import { GraphQLClient } from 'graphql-request';

// Guest client: omits Authorization and credentials – safe for guest checkout flows.
function getEndpoint() {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/graphql-proxy`;
  }
  return process.env.INTERNAL_GRAPHQL_PROXY_URL || 'http://localhost:3000/api/graphql-proxy';
}

const graphqlGuestClient = new GraphQLClient(getEndpoint(), {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'omit',
});

export default graphqlGuestClient;
