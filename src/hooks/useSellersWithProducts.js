import { useInfiniteQuery } from '@tanstack/react-query';
import graphqlClient from '../lib/graphqlClient';
import { SELLERS_WITH_PRODUCTS } from '../graphql/sellers/queries';
import { normalizeSellersWithProductsResponse } from '../utils/mediaUrl';

export function useSellersWithProducts({ pageSize = 50, productLimit = 50, enabled = true } = {}) {
  return useInfiniteQuery({
    queryKey: ['sellersWithProducts', pageSize, productLimit],
    enabled,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      try {
        const currentPage = Number(pageParam || 1);
        // eslint-disable-next-line no-console
        console.log('[useSellersWithProducts] vars:', { pageSize, productLimit, currentPage });

        const data = await graphqlClient.request(SELLERS_WITH_PRODUCTS, { pageSize, productLimit, currentPage });
        return normalizeSellersWithProductsResponse(data);
      } catch (e) {
        console.error('[useSellersWithProducts] graphql-request error:', {
          message: e?.message,
          response: e?.response,
        });
        throw e;
      }
    },
    getNextPageParam: (lastPage) => {
      const pageInfo = lastPage?.sellersWithProducts?.page_info;
      const current = Number(pageInfo?.current_page || 1);
      const totalPages = Number(pageInfo?.total_pages || 1);
      if (current < totalPages) return current + 1;
      return undefined;
    },
    retry: 1,
  });
}