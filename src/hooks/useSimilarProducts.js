import { useInfiniteQuery } from '@tanstack/react-query';
import graphqlClient from '../lib/graphqlClient';
import { SELLERS_WITH_PRODUCTS } from '../graphql/sellers/queries';

const PRODUCT_PLACEHOLDER = 'https://via.placeholder.com/200x200?text=Producto';
const PAGE_SIZE = 20;
const PRODUCT_LIMIT = 60;

/**
 * Returns a flat list of products from all sellers, with infinite pagination.
 * Excludes the product with the given excludeProductId.
 */
export function useSimilarProducts({ excludeProductId } = {}) {
  return useInfiniteQuery({
    queryKey: ['similarProducts', excludeProductId],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const data = await graphqlClient.request(SELLERS_WITH_PRODUCTS, {
        pageSize: PAGE_SIZE,
        productLimit: PRODUCT_LIMIT,
        currentPage: pageParam,
      });
      return data;
    },
    getNextPageParam: (lastPage) => {
      const info = lastPage?.sellersWithProducts?.page_info;
      if (!info) return undefined;
      const { current_page, total_pages } = info;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
    retry: 1,
    select: (data) => {
      const allProducts = [];
      for (const page of data.pages) {
        const items = page?.sellersWithProducts?.items || [];
        for (const item of items) {
          const seller = item?.seller || {};
          const productItems = Array.isArray(item?.products?.items) ? item.products.items : [];
          for (const p of productItems) {
            if (!p?.sku) continue;
            if (!p?.name) continue; // skip products with missing names
            if (String(p.sku) === String(excludeProductId)) continue;
            allProducts.push({
              id: p.sku,
              sku: p.sku,
              name: p.name || '',
              price: p.price_range?.minimum_price?.final_price?.value ?? 0,
              image: p.image?.url || PRODUCT_PLACEHOLDER,
              sellerId: String(seller.seller_id),
              sellerName: seller.shop_title || seller.shop_url || '',
            });
          }
        }
      }
      const pageInfo = data.pages[data.pages.length - 1]?.sellersWithProducts?.page_info;
      return {
        products: allProducts,
        hasNextPage: pageInfo ? pageInfo.current_page < pageInfo.total_pages : false,
      };
    },
  });
}
