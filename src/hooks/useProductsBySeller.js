import { useQuery } from '@tanstack/react-query';
import graphqlClient from '../lib/graphqlClient';
import { PRODUCTS_BY_SELLER } from '../graphql/sellers/queries';

export function useProductsBySeller({ sellerId, pageSize = 6, currentPage = 1, enabled = true } = {}) {
  return useQuery({
    queryKey: ['productsBySeller', sellerId, pageSize, currentPage],
    enabled: Boolean(enabled && sellerId),
    queryFn: async () => {
      const data = await graphqlClient.request(PRODUCTS_BY_SELLER, {
        sellerId,
        pageSize,
        currentPage,
      });
      return data;
    },
    retry: 1,
  });
}