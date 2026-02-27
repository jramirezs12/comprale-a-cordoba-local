'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { useSellersWithProductsInfinite } from '../../hooks/useSellersWithProductsInfinite';
import { useInfiniteScrollTrigger } from '../../hooks/useInfiniteScrollTrigger';
import { stripHtml } from '../../utils/html';
import SellerTile from '../../components/Sellers/SellerTile';
import './sellers.css';

const SELLER_PLACEHOLDER = 'https://via.placeholder.com/900x900?text=Negocio';

function mapSellers(items) {
  return (items || []).map((item) => {
    const s = item?.seller || {};
    return {
      id: s.seller_id,
      name: s.shop_title || s.shop_url || `Seller ${s.seller_id}`,
      image: s.banner_pic || s.logo_pic || SELLER_PLACEHOLDER,
      description: stripHtml(s.description),
    };
  });
}

export default function SellersPage() {
  const router = useRouter();

  // Sellers list (infinite)
  const q = useSellersWithProductsInfinite({ pageSize: 24, productLimit: 0 });

  const sellers = useMemo(() => {
    const pages = q.data?.pages || [];
    const allItems = pages.flatMap((p) => p?.sellersWithProducts?.items || []);
    return mapSellers(allItems);
  }, [q.data]);

  const canLoadMore = !!q.hasNextPage && !q.isFetchingNextPage;

  const loadMore = useCallback(() => {
    if (!canLoadMore) return;
    q.fetchNextPage();
  }, [canLoadMore, q]);

  const sentinelRef = useInfiniteScrollTrigger({
    enabled: canLoadMore,
    onLoadMore: loadMore,
    rootMargin: '900px',
  });

  return (
    <div className="sellers-page">
      <Navbar />

      <main className="sellers-main">
        <header className="sellers-hero" aria-label="Encabezado emprendedores">
          <div className="sellers-hero__inner">
            <h1 className="sellers-hero__title">Los emprendedores</h1>
            <p className="sellers-hero__subtitle">Cada compra que haces, reactiva sus metas.</p>
          </div>
        </header>

        <section className="sellers-grid" aria-label="Listado de emprendedores">
          <div className="sellers-grid__inner">
            {sellers.map((s) => (
              <SellerTile key={s.id} seller={s} onBuy={() => router.push(`/seller/${s.id}`)} />
            ))}
          </div>

          <div ref={sentinelRef} className="sellers-grid__sentinel" />
        </section>
      </main>

      <Footer sponsors={[]} />
    </div>
  );
}