import { useQuery } from '@tanstack/react-query';
import graphqlClient from '../lib/graphqlClient';
import { SELLERS_WITH_PRODUCTS } from '../graphql/sellers/queries';
import { normalizeSellersWithProductsResponse } from '../utils/mediaUrl';

export function useSellerById({ sellerId } = {}) {
  const idNum = Number(sellerId);
  const idOk = Number.isFinite(idNum) && idNum > 0;

  return useQuery({
    queryKey: ['sellerById', idOk ? idNum : 0],
    enabled: idOk,
    queryFn: async () => {
      const pageSize = 40;
      const productLimit = 1;

      for (let currentPage = 1; currentPage <= 10; currentPage += 1) {
        const resRaw = await graphqlClient.request(SELLERS_WITH_PRODUCTS, {
          pageSize,
          productLimit,
          currentPage,
        });

        const res = normalizeSellersWithProductsResponse(resRaw);

        const items = res?.sellersWithProducts?.items || [];
        const match = items.find((it) => Number(it?.seller?.seller_id) === idNum);
        if (match?.seller) return match.seller;
      }

      return null;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}