import { useQuery } from '@tanstack/react-query';
import graphqlClient from '../lib/graphqlClient';
import { GET_ALL_CITIES } from '../graphql/checkout/queries';

export function useAllCities() {
  return useQuery({
    queryKey: ['allCities'],
    queryFn: () => graphqlClient.request(GET_ALL_CITIES),
    staleTime: 5 * 60 * 1000,
  });
}
