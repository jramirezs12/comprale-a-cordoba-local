import { useInfiniteQuery } from '@tanstack/react-query';
import graphqlClient from '../lib/graphqlClient';
import { SELLERS_WITH_PRODUCTS } from '../graphql/sellers/queries';

export function useSellersWithProductsInfinite({ pageSize = 20, productLimit = 6 } = {}) {
  return useInfiniteQuery({
    queryKey: ['sellersWithProductsInfinite', pageSize, productLimit],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const data = await graphqlClient.request(SELLERS_WITH_PRODUCTS, {
        pageSize,
        productLimit,
        currentPage: pageParam,
      });
      return data;
    },
    getNextPageParam: (lastPage) => {
      const info = lastPage?.sellersWithProducts?.page_info;
      if (!info) return undefined;
      return info.current_page < info.total_pages ? info.current_page + 1 : undefined;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
}