'use client';

import { useMemo, useRef, useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../Navbar/Navbar';
import Hero from '../Hero/Hero';
import HowItWorks from '../HowItWorks/HowItWorks';
import SellerSection from '../SellerSection/SellerSection';
import Stats from '../Stats/Stats';
import Footer from '../Footer/Footer';
import { stats } from '../../data/mockData';
import { useSellersWithProductsInfinite } from '../../hooks/useSellersWithProductsInfinite';
import { useInfiniteScrollTrigger } from '../../hooks/useInfiniteScrollTrigger';
import OrderSuccessFromUrl from '../OrderSuccessModal/OrderSuccessFromUrl';
import { mapSellersWithProducts } from '../../utils/mapSellers';
import './HomePageView.css';

export default function HomePageView() {
  const howItWorksSectionRef = useRef(null);
  const router = useRouter();

  const q = useSellersWithProductsInfinite({ pageSize: 20, productLimit: 6 });

  const sellers = useMemo(() => {
    const pages = q.data?.pages || [];
    const allItems = pages.flatMap((p) => p?.sellersWithProducts?.items || []);
    return mapSellersWithProducts(allItems);
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
    <div className="home-page">
      {/* ✅ this must be inside Suspense because it uses useSearchParams */}
      <Suspense fallback={null}>
        <OrderSuccessFromUrl />
      </Suspense>

      <Navbar />
      <main>
        <Hero nextSectionRef={howItWorksSectionRef} />
        <HowItWorks sectionRef={howItWorksSectionRef} />

        {/* ✅ Home sellers section WITHOUT the "Los emprendedores" text */}
        <section className="home-sellers" aria-label="Emprendedores destacados">
          <SellerSection sellers={sellers} onSellerClick={(seller) => router.push(`/seller/${seller.id}`)} />

          <div className="home-sellers__footer">
            <button
              type="button"
              className="home-sellers__link"
              onClick={() => router.push('/sellers')}
              aria-label="Ver todos los emprendedores"
            >
              Ver todos
            </button>
          </div>
        </section>

        <div ref={sentinelRef} className="home-infinite__sentinel" />
        <Stats stats={stats} />
        <Footer sponsors={[]} />
      </main>
    </div>
  );
}
