import { useQuery } from '@tanstack/react-query';
import graphqlClient from '../lib/graphqlClient';
import { CATEGORIES } from '../graphql/categories/queries';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => graphqlClient.request(CATEGORIES),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}