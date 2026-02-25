import { useInfiniteQuery } from '@tanstack/react-query';
import graphqlClient from '../lib/graphqlClient';
import { PRODUCTS_BY_SELLER } from '../graphql/sellers/queries';

export function useProductsBySellerInfinite({ sellerId, pageSize = 12 } = {}) {
  const idNum = Number(sellerId);
  const enabled = Number.isFinite(idNum) && idNum > 0;

  return useInfiniteQuery({
    queryKey: ['productsBySellerInfinite', enabled ? idNum : 0, pageSize],
    enabled,
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      return graphqlClient.request(PRODUCTS_BY_SELLER, {
        sellerId: idNum,
        currentPage: pageParam,
        pageSize,
      });
    },
    getNextPageParam: (lastPage) => {
      const info = lastPage?.productsBySeller?.page_info;
      if (!info) return undefined;
      return info.current_page < info.total_pages ? info.current_page + 1 : undefined;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
}