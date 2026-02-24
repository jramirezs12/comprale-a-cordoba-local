import { gql } from 'graphql-request';

export const GET_ALL_CITIES = gql`
  query GetAllCities {
    allCities {
      items {
        id
        name
        code
        region {
          id
          name
        }
      }
    }
  }
`;
