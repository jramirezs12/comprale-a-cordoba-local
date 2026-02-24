import { useQuery } from '@tanstack/react-query';
import graphqlClient from '../lib/graphqlClient';
import { PRODUCTS_BY_SELLER } from '../graphql/sellers/queries';

export function useProductsBySeller({ sellerId, currentPage = 1, pageSize = 20 } = {}) {
  return useQuery({
    queryKey: ['productsBySeller', sellerId, currentPage, pageSize],
    queryFn: () =>
      graphqlClient.request(PRODUCTS_BY_SELLER, { sellerId: Number(sellerId), currentPage, pageSize }),
    enabled: Boolean(sellerId),
  });
}
