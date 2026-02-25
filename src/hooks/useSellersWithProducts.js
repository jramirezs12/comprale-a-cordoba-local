import { useQuery } from '@tanstack/react-query';
import graphqlClient from '../lib/graphqlClient';
import { SELLERS_WITH_PRODUCTS } from '../graphql/sellers/queries';

export function useSellersWithProducts({ pageSize = 100, productLimit = 100, currentPage = 1 } = {}) {
  return useQuery({
    queryKey: ['sellersWithProducts', pageSize, productLimit, currentPage],
    queryFn: async () => {
      try {
        console.log('[useSellersWithProducts] vars:', { pageSize, productLimit, currentPage });
        const data = await graphqlClient.request(SELLERS_WITH_PRODUCTS, { pageSize, productLimit, currentPage });
        return data;
      } catch (e) {
        console.error('[useSellersWithProducts] graphql-request error:', {
          message: e?.message,
          response: e?.response,
        });
        throw e;
      }
    },
    retry: 1,
  });
}