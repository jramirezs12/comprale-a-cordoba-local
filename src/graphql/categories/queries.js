import { gql } from 'graphql-request';

export const CATEGORIES = gql`
  query Categories {
    categories {
      items {
        id
        name
        children {
          id
          name
        }
      }
    }
  }
`;