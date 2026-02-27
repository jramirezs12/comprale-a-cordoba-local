import { useMemo } from 'react';
import { useSellersWithProductsInfinite } from './useSellersWithProductsInfinite';

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}

export function useProductSearch(query, { enabled = true } = {}) {
  const q = useSellersWithProductsInfinite({ pageSize: 20, productLimit: 60 });

  const clean = norm(query);
  const active = enabled && clean.length >= 2;

  const products = useMemo(() => {
    if (!active) return [];

    const pages = q.data?.pages || [];
    const items = pages.flatMap((p) => p?.sellersWithProducts?.items || []);

    const out = [];
    for (const row of items) {
      const seller = row?.seller || {};
      const sellerId = seller?.seller_id ? String(seller.seller_id) : '';
      const sellerName = seller?.shop_title || seller?.shop_url || '';

      const prods = Array.isArray(row?.products?.items) ? row.products.items : [];
      for (const p of prods) {
        const name = p?.name || '';
        const sku = p?.sku || '';
        const hay = norm(`${name} ${sku}`);
        if (!hay.includes(clean)) continue;

        out.push({
          id: sku,
          sku,
          name,
          image: p?.image?.url || '',
          price: p?.price_range?.minimum_price?.final_price?.value ?? 0,
          sellerId,
          sellerName,
        });
      }
    }

    // Dedup by sku
    const seen = new Set();
    return out.filter((p) => {
      const key = String(p.sku || '');
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [q.data, active, clean]);

  return {
    queryEnabled: active,
    products,
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    fetchNextPage: q.fetchNextPage,
    hasNextPage: q.hasNextPage,
    isFetchingNextPage: q.isFetchingNextPage,
  };
}