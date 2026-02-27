import { useMemo } from 'react';
import { useSellersWithProducts } from './useSellersWithProducts';

const PRODUCT_PLACEHOLDER = 'https://via.placeholder.com/700x700?text=Producto';

export function useProductsByCategory({ categoryId, pageSize = 50, productLimit = 50 } = {}) {
  const idNum = Number(categoryId);
  const idOk = Number.isFinite(idNum) && idNum > 0;

  const q = useSellersWithProducts({
    pageSize,
    productLimit,
    enabled: idOk,
  });

  const products = useMemo(() => {
    if (!idOk) return [];

    const pages = q.data?.pages || [];
    const out = [];

    for (const page of pages) {
      const items = page?.sellersWithProducts?.items || [];

      for (const row of items) {
        const seller = row?.seller;
        const sellerId = seller?.seller_id ? String(seller.seller_id) : '';
        const sellerName = seller?.shop_title || seller?.shop_url || '';

        const prodItems = Array.isArray(row?.products?.items) ? row.products.items : [];
        for (const p of prodItems) {
          const cats = Array.isArray(p?.categories) ? p.categories : [];
          const match = cats.some((c) => Number(c?.id) === idNum);
          if (!match) continue;

          out.push({
            id: p?.sku,
            sku: p?.sku,
            name: p?.name || '',
            image: p?.image?.url || PRODUCT_PLACEHOLDER,
            price: p?.price_range?.minimum_price?.final_price?.value ?? 0,
            sellerId,
            sellerName,
            categories: cats,
          });
        }
      }
    }

    // Deduplicate by SKU
    const seen = new Set();
    return out.filter((p) => {
      const key = String(p.sku || p.id || '');
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [q.data, idOk, idNum]);

  return {
    ...q,
    products,
    // helper flags for the page
    isLoading: q.isLoading,
    isError: q.isError,
  };
}