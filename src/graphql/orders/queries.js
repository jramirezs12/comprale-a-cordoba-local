import { gql } from 'graphql-request';

export const GUEST_ORDER_BY_TOKEN = gql`
  query GuestOrderByToken($token: String!) {
    guestOrderByToken(input: { token: $token }) {
      email
      id
      grand_total
      increment_id
    }
  }
`;